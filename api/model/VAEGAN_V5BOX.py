import torch
import torch.nn as nn
import torch.nn.functional as F
from helpers.viz_util import ROOM_HIER_MAP
from model.graph import GraphTripleConvNet, _init_weights, make_mlp
from model.edge_feats import EdgeFeatsLinear
from model.prior_v2 import PriorSampler
import numpy as np
from helpers.util import batch_torch_denormalize_box_params


class Sg2ScVAEModel(nn.Module):
    """
    VAE-based network for scene generation and manipulation from a scene graph.
    It has a separate embedding of shape and bounding box latents.
    V4BOX version will use ground truth edge embedding, without CLIP features, GCN as its GNN module
    angle uses 4 category
    """

    def __init__(
        self,
        vocab,
        embedding_dim=128,
        decoder_cat=False,
        input_dim=6,
        gconv_pooling="avg",
        gconv_num_layers=5,
        mlp_normalization="none",
        use_AE=False,
        residual=False,
        use_angles=True,
        device="cuda",
        unit_box_dim=3,
        angle_num=24,
        edge_feats_dim=7,
    ):
        super(Sg2ScVAEModel, self).__init__()
        gconv_dim = embedding_dim
        gconv_hidden_dim = gconv_dim * 4
        box_embedding_dim = int(embedding_dim)
        if use_angles:
            angle_embedding_dim = int(embedding_dim / 4)
            box_embedding_dim = int(embedding_dim * 3 / 4)
            Nangle = angle_num

        unit_box_embedding_dim = int(embedding_dim / 4)
        sem_embedding_dim = int(embedding_dim * 3 / 4)  # node semantic feature
        node_embedding_dim_ec = (
            embedding_dim + unit_box_embedding_dim + sem_embedding_dim
        )
        edge_embedding_dim_ec = 2 * embedding_dim  # edge feature
        node_embedding_dim_dc = 2 * embedding_dim
        edge_embedding_dim_dc = node_embedding_dim_dc

        self.angle_num = angle_num
        self.embedding_dim = embedding_dim
        self.decoder_cat = decoder_cat
        self.vocab = vocab
        self.use_AE = use_AE
        self.use_angles = use_angles
        self.device = device
        self.edge_feats_dim = edge_feats_dim
        self.full_label = vocab["full_object_idx_to_name"]
        fur2full, full2fur, rm2full, full2rm = self.fur_room_mapping(self.full_label)
        self.fur2full = fur2full
        self.full2fur = full2fur
        self.rm2full = rm2full
        self.full2rm = full2rm
        self.fur_cat_num = len(fur2full.keys())
        self.room_cat_num = len(rm2full)  # include unit
        self.sem_embedding_dim = sem_embedding_dim
        self.mean_est = None
        self.cov_est = None
        self.mean_est_box = None
        self.cov_est_box = None

        num_nodes = len(list(set(vocab["full_object_idx_to_name"])))  # node type
        num_edges = len(list(set(vocab["full_rel_idx_to_name"]))) + 1  # edge type

        # build prior
        self.prior_sampler = PriorSampler(
            input_size=embedding_dim + sem_embedding_dim + unit_box_embedding_dim,
            node_feat_size=embedding_dim,
            hidden_size=embedding_dim,
            max_fur_num=10,
            mlp_normalization=mlp_normalization,
        )

        # build encoder nets
        self.sem_embeddings_ec = nn.Embedding(num_nodes, sem_embedding_dim)
        self.edge_embeddings_ec = EdgeFeatsLinear(
            self.edge_feats_dim, edge_embedding_dim_ec, list(range(num_edges))
        )
        self.unit_box_embeddings_ec = nn.Linear(unit_box_dim, unit_box_embedding_dim)

        # build prior nets
        self.sem_embeddings_rm_pr = nn.Embedding(num_nodes, sem_embedding_dim)
        self.unit_box_embeddings_pr = nn.Linear(unit_box_dim, unit_box_embedding_dim)

        # build decoder nets
        self.sem_embeddings_rm_dc = nn.Embedding(num_nodes, sem_embedding_dim)
        self.edge_embeddings_dc = EdgeFeatsLinear(
            node_embedding_dim_dc * 2,
            edge_embedding_dim_dc,
            list(range(num_edges)),
            num_layers=2,
        )
        self.room_vecs_dc = nn.Linear(embedding_dim * 2, node_embedding_dim_dc)
        self.fur_vecs_dc = nn.Linear(node_embedding_dim_dc, node_embedding_dim_dc)
        self.unit_box_embeddings_dc = nn.Linear(unit_box_dim, unit_box_embedding_dim)

        if self.decoder_cat:
            self.edge_embeddings_dc = EdgeFeatsLinear(
                node_embedding_dim_dc * 2,
                edge_embedding_dim_dc,
                list(range(num_edges)),
                num_layers=2,
            )

        self.d3_embeddings = nn.Linear(input_dim, box_embedding_dim)  # box embedding
        if self.use_angles:
            self.angle_embeddings = nn.Embedding(Nangle, angle_embedding_dim)

        # weight sharing of mean and var
        self.mean_var = make_mlp(
            [node_embedding_dim_ec, gconv_hidden_dim, node_embedding_dim_ec],
            batch_norm=mlp_normalization,
        )
        self.mean = make_mlp(
            [node_embedding_dim_ec, box_embedding_dim],
            batch_norm=mlp_normalization,
            norelu=True,
        )
        self.var = make_mlp(
            [node_embedding_dim_ec, box_embedding_dim],
            batch_norm=mlp_normalization,
            norelu=True,
        )
        if self.use_angles:
            self.angle_mean_var = make_mlp(
                [node_embedding_dim_ec, gconv_hidden_dim, node_embedding_dim_ec],
                batch_norm=mlp_normalization,
            )
            self.angle_mean = make_mlp(
                [node_embedding_dim_ec, angle_embedding_dim],
                batch_norm=mlp_normalization,
                norelu=True,
            )
            self.angle_var = make_mlp(
                [node_embedding_dim_ec, angle_embedding_dim],
                batch_norm=mlp_normalization,
                norelu=True,
            )  # graph conv net
        self.gconv_net_ec = None
        self.gconv_net_dc = None

        gconv_kwargs_ec = {
            "input_dim_obj": node_embedding_dim_ec,
            "input_dim_pred": edge_embedding_dim_ec,
            "hidden_dim": gconv_hidden_dim,
            "pooling": gconv_pooling,
            "num_layers": gconv_num_layers,
            "mlp_normalization": mlp_normalization,
            "residual": residual,
        }
        gconv_kwargs_dc = {
            "input_dim_obj": node_embedding_dim_dc,
            "input_dim_pred": edge_embedding_dim_dc,
            "hidden_dim": gconv_hidden_dim,
            "pooling": gconv_pooling,
            "num_layers": gconv_num_layers,
            "mlp_normalization": mlp_normalization,
            "residual": residual,
        }

        self.gconv_net_ec = GraphTripleConvNet(**gconv_kwargs_ec)
        self.gconv_net_dc = GraphTripleConvNet(**gconv_kwargs_dc)

        net_layers = [
            node_embedding_dim_dc,
            gconv_hidden_dim,
            input_dim,
        ]
        self.d3_net = make_mlp(net_layers, batch_norm=mlp_normalization, norelu=True)

        if self.use_angles:
            # angle prediction net
            angle_net_layers = [
                node_embedding_dim_dc,
                gconv_hidden_dim,
                Nangle,
            ]
            self.angle_net = make_mlp(
                angle_net_layers, batch_norm=mlp_normalization, norelu=True
            )

        fur_sem_layers = [node_embedding_dim_dc, gconv_hidden_dim, self.fur_cat_num]
        self.fur_sem_net = make_mlp(
            fur_sem_layers, batch_norm=mlp_normalization, norelu=True
        )

        # initialization
        self.d3_embeddings.apply(_init_weights)
        self.mean_var.apply(_init_weights)
        self.mean.apply(_init_weights)
        self.var.apply(_init_weights)
        self.d3_net.apply(_init_weights)
        self.edge_embeddings_ec.apply(_init_weights)
        self.edge_embeddings_dc.apply(_init_weights)
        self.unit_box_embeddings_ec.apply(_init_weights)
        self.unit_box_embeddings_dc.apply(_init_weights)
        self.sem_embeddings_ec.apply(_init_weights)
        self.sem_embeddings_rm_dc.apply(_init_weights)
        self.room_vecs_dc.apply(_init_weights)
        self.fur_vecs_dc.apply(_init_weights)
        self.sem_embeddings_rm_pr.apply(_init_weights)
        self.unit_box_embeddings_pr.apply(_init_weights)

        if self.use_angles:
            self.angle_embeddings.apply(_init_weights)
            self.angle_mean_var.apply(_init_weights)
            self.angle_mean.apply(_init_weights)
            self.angle_var.apply(_init_weights)

    def fur_room_mapping(self, full_label):
        """
        input
        - full_label : vocab["full_object_idx_to_name"],a list of full class strings, not sorted. eg.['_unit_\n', 'chair\n', 'balcony\n', 'bathroom\n', 'bed\n', 'bedroom\n', 'cabinet\n'...]

        return
        - fur2full : a dictionary maps furniture cat idx to the full label idx, eg:'0':23
        - full2fur : a dictionary maps the full label idx to the furniture cat idx, eg:'23':0
        - rm2full : a dictionary maps room cat idx to the full label idx, eg:'0':23
        - full2rm : a dictionary maps the full label idx to the room cat idx, eg:'23':0


        """
        sorted_label = sorted(set([label.strip() for label in full_label]))
        self.full_label = sorted_label
        room_labels = list(ROOM_HIER_MAP.keys()) + ["_unit_"]
        fur2full = {}
        full2fur = {}
        rm2full = {}
        full2rm = {}
        fur_mask = 0
        rm_mask = 0
        for i, label in enumerate(sorted_label):
            if label not in room_labels:
                fur2full[fur_mask] = i
                full2fur[i] = fur_mask
                fur_mask += 1
            else:
                rm2full[rm_mask] = i
                full2rm[i] = rm_mask
                rm_mask += 1

        return fur2full, full2fur, rm2full, full2rm

    def encoder(
        self,
        nodes,
        triples,
        boxes_gt,
        angles_gt=None,
        edge_feats_gt=None,
        unit_box_gt=None,
    ):
        """
        update node and edge features using gconv to obtain mu (D)and var (D)of latent variable distribution
        node features: concatenated the unit bbox embed (D/4), box param embed (3D/4), orientation angle embed (D/4) and semantic embed (3D/4) as feature vector (2D)
        edge features: edge params embed 2D
        """

        assert edge_feats_gt is not None
        O, T = nodes.size(0), triples.size(0)
        s, p, o = triples.chunk(3, dim=1)  # All have shape (T, 1)
        s, p, o = [x.squeeze(1) for x in [s, p, o]]  # Now have shape (T,)
        edges = torch.stack([s, o], dim=1)  # Shape is (T, 2)

        node_vecs = self.sem_embeddings_ec(nodes)  # 3D/4
        pred_vecs = self.edge_embeddings_ec(edge_feats_gt, p)  # 2D
        d3_vecs = self.d3_embeddings(boxes_gt)  # 3D/4
        unitbox_vecs = self.unit_box_embeddings_ec(unit_box_gt)  # D/4

        if self.use_angles:
            angle_vecs = self.angle_embeddings(angles_gt)  # D/4
            node_vecs = torch.cat(
                [node_vecs, d3_vecs, angle_vecs, unitbox_vecs], dim=1
            )  # 2D
        else:
            node_vecs = torch.cat([node_vecs, d3_vecs, unitbox_vecs], dim=1)

        if self.gconv_net_ec is not None:
            node_vecs, pred_vecs = self.gconv_net_ec(
                node_vecs, pred_vecs, edges
            )  # 2D,2D

        node_vecs_3d = self.mean_var(node_vecs)  # 2D
        mu = self.mean(node_vecs_3d)  #  3D/4
        logvar = self.var(node_vecs_3d)  # 3D/4

        if self.use_angles:
            node_vecs_angle = self.angle_mean_var(node_vecs)  # 2D
            mu_angle = self.angle_mean(node_vecs_angle)  # D/4
            logvar_angle = self.angle_var(node_vecs_angle)  # D/4
            mu = torch.cat([mu, mu_angle], dim=1)  # D
            logvar = torch.cat([logvar, logvar_angle], dim=1)  # D

        return mu, logvar

    def decoder(
        self,
        z,  # both room and fur feats
        roomunit_nodes,  # include _unit_
        triples,
        unit_box_gt=None,  # both room and fur
        roomunit_idxs=None,  # include _unit_
        fur_idxs=None,
        obj_to_pidx=None,
    ):
        """ """
        s, p, o = triples.chunk(3, dim=1)  # All have shape (T, 1)
        s, p, o = [x.squeeze(1) for x in [s, p, o]]  # Now have shape (T,)
        edges = torch.stack([s, o], dim=1)  # Shape is (T, 2)

        O = z.size(0)
        node_vecs = torch.zeros((z.size(0), int(self.embedding_dim * 2))).to(z.device)
        node_sem_vecs = torch.zeros((z.size(0), int(self.sem_embedding_dim))).to(
            z.device
        )
        # roomunit_nodes = torch.tensor(
        #     [self.full2rm[int(obj)] for obj in roomunit_nodes]
        # ).to(
        #     z.device
        # )  # not sure if need to map to room cats

        # prepare node features
        # unit embedding
        unitbox_vecs = self.unit_box_embeddings_dc(unit_box_gt)  # D/4

        # semantic embedding
        roomunit_sem_vecs = self.sem_embeddings_rm_dc(roomunit_nodes)  # 3D/4
        node_sem_vecs[roomunit_idxs] = roomunit_sem_vecs
        node_sem_vecs[list(range(O))] = node_sem_vecs[obj_to_pidx]
        fur_sem_vecs = node_sem_vecs[fur_idxs]

        # roomunit node vectors
        roomunit_node_vecs = torch.cat(
            [roomunit_sem_vecs, unitbox_vecs[roomunit_idxs], z[roomunit_idxs]], dim=1
        )  # 2D
        roomunit_node_vecs = self.room_vecs_dc(roomunit_node_vecs)  # 2D

        # fur node vectors
        fur_node_vecs = torch.cat(
            [fur_sem_vecs, unitbox_vecs[fur_idxs], z[fur_idxs]], dim=1
        )  # 2D
        fur_node_vecs = self.fur_vecs_dc(fur_node_vecs)  # 2D

        # contatenate room and fur node vecs
        node_vecs[roomunit_idxs] = roomunit_node_vecs
        node_vecs[fur_idxs] = fur_node_vecs

        s_embeddings = node_vecs[s, :]  # 2D
        o_embeddings = node_vecs[o, :]  # 2D
        edge_vecs = torch.cat(
            (s_embeddings, o_embeddings), dim=1  # 4D
        )  # use concatenation of node feats as edge feats initialization
        edge_vecs = self.edge_embeddings_dc(edge_vecs, p)  # 2D
        node_vecs, edge_vecs = self.gconv_net_dc(node_vecs, edge_vecs, edges)
        d3_pred = self.d3_net(node_vecs)
        fur_sem_pred = F.log_softmax(self.fur_sem_net(node_vecs[fur_idxs]), dim=1)
        if self.use_angles:
            angles_pred = F.log_softmax(self.angle_net(node_vecs), dim=1)
            return d3_pred, angles_pred, fur_sem_pred
        else:
            return d3_pred, fur_sem_pred

    def forward_with_prior(
        self,
        nodes,
        triples,
        boxes_gt,
        angles_gt=None,
        unit_box_gt=None,
        edge_feats_gt=None,
        obj_to_pidx=None,
    ):
        mu, logvar = self.encoder(
            nodes=nodes,
            triples=triples,
            boxes_gt=boxes_gt,
            angles_gt=angles_gt,
            edge_feats_gt=edge_feats_gt,
            unit_box_gt=unit_box_gt,
        )  # D
        std = torch.exp(0.5 * logvar)
        # standard sampling
        eps = torch.randn_like(std)
        z = eps.mul(std).add_(mu)

        (
            room_idxs,
            furniture_mus,
            furniture_vars,
        ) = self.separate_room_fur_nodes(nodes, triples, mu, logvar, obj_to_pidx)

        # use prior model to sample new furniture graph
        room_nodes = nodes[room_idxs]
        room_z = z[room_idxs]
        room_unit_box = unit_box_gt[room_idxs]

        recon_loss_info = self.calculate_prior_loss(
            room_nodes, room_z, room_unit_box, furniture_mus, furniture_vars
        )

        roomunit_idxs = torch.where(
            (obj_to_pidx == torch.arange(nodes.shape[0]).to(obj_to_pidx.device))
        )[0]
        fur_idxs = torch.tensor(
            [idx for idx in range(nodes.size(0)) if idx not in roomunit_idxs]
        )
        roomunit_nodes = nodes[roomunit_idxs]

        keep = []

        if self.use_angles:
            box_pred, angles_pred, fur_sem_pred = self.decoder(
                z,
                roomunit_nodes,
                triples,
                unit_box_gt=unit_box_gt,
                roomunit_idxs=roomunit_idxs,
                fur_idxs=fur_idxs,
                obj_to_pidx=obj_to_pidx,
            )
        else:
            box_pred, fur_sem_pred = self.decoder(
                z,
                roomunit_nodes,
                triples,
                unit_box_gt=unit_box_gt,
                roomunit_idxs=roomunit_idxs,
                fur_idxs=fur_idxs,
                obj_to_pidx=obj_to_pidx,
            )
            angles_pred = None

        for i in range(len(box_pred)):
            keep.append(1)

        # calculate furniture sem loss
        fur_sem_gt = nodes[fur_idxs]
        fur_sem_gt = torch.tensor([self.full2fur[int(obj)] for obj in fur_sem_gt]).to(
            z.device
        )
        sem_loss = F.nll_loss(fur_sem_pred, fur_sem_gt)
        sem_acc = self.accuracy(fur_sem_pred, fur_sem_gt)
        recon_loss_info["fur_semantic"] = sem_loss
        recon_loss_info["fur_semantic_acc"] = sem_acc

        keep = torch.from_numpy(np.asarray(keep).reshape(-1, 1)).float().to(self.device)

        return (mu, logvar, box_pred, angles_pred, keep, recon_loss_info)

    def accuracy(self, Y_hat, Y, averaged=True):
        """Compute the number of correct predictions."""
        Y_hat = Y_hat.reshape((-1, Y_hat.shape[-1]))
        preds = Y_hat.argmax(axis=1).type(Y.dtype)
        compare = (preds == Y.reshape(-1)).type(torch.float32)
        return compare.mean() if averaged else compare

    def calculate_prior_loss(self, room_nodes, room_z, unit_box, fur_mu_gt, fur_var_gt):

        # concatenate room nodes's sem embed,unit box embed, z
        # unit_box is (num_room,3)
        unitbox_vecs = self.unit_box_embeddings_pr(unit_box)
        # room semantic features
        # room_nodes = torch.tensor([self.full2rm[int(obj)] for obj in room_nodes]).to(
        #     room_z.device
        # )  # not sure to map to room cats
        room_sem_vecs = self.sem_embeddings_rm_pr(room_nodes)
        room_vecs = torch.cat([room_sem_vecs, unitbox_vecs, room_z], dim=1)  # 2D
        loss_info = self.prior_sampler(
            room_z=room_vecs, fur_mu_gt=fur_mu_gt, fur_var_gt=fur_var_gt
        )

        return loss_info

    def sample_latents(
        self,
        nodes,
        device="cpu",
        random_seed=0,
        point_classes_idx=None,
        with_categories=False,
    ):
        """
        sample the latent variables for each nodes

        @input
        - nodes: a tensor of (N,1), indicating each node's category in full label
        - device: 'cpu' or 'cuda'
        - random_seed: the random seed for sampling
        - point_classes_idx: the dataset's property, an array of object category label in training set
        - with_categories: a boolean, consistent with args['categorize_latents'], if true, the collecting training statistis process with create a dictionary, with class label as key, and corresonding mu or var as value

        @return
        - z: a tensor of (N,feat_dim),the sampled latent variables
        """

        with torch.no_grad():
            np.random.seed(random_seed)
            if with_categories:
                assert point_classes_idx is not None
                assert isinstance(self.mean_est_box, dict)
                assert isinstance(self.cov_est_box, dict)
                z = []
                for idxz in nodes:
                    idxz = int(idxz.cpu())
                    if idxz in point_classes_idx:
                        z.append(
                            torch.from_numpy(
                                np.random.multivariate_normal(
                                    self.mean_est_box[idxz], self.cov_est_box[idxz], 1
                                )
                            )
                            .float()
                            .to(device)
                        )
                    else:
                        z.append(
                            torch.from_numpy(
                                np.random.multivariate_normal(
                                    self.mean_est_box[-1], self.cov_est_box[-1], 1
                                )
                            )
                            .float()
                            .to(device)
                        )
                z = torch.cat(z, 0)
            else:
                z = (
                    torch.from_numpy(
                        np.random.multivariate_normal(
                            self.mean_est_box, self.cov_est_box, nodes.size(0)
                        )
                    )
                    .float()
                    .to(device)
                )
        return z

    def infer(
        self,
        room_nodes,
        room_triples,
        unit_box,
        device="cpu",
        random_seed=0,
        point_classes_idx=None,
        with_categories=False,
    ):
        """
        infer one unit's room graph, does not support batch operation

        input
        - room nodes: (N_rm,1), the room category in full label, no unit nodes
        - room triples: (T_rm,3), the edge triples of room nodes, each contains (from_idx,edge_type,to_idx)
        - unit_box: (3,) the bounding box  xyz size

        return
        - all_nodes:(N,1) whole nodes, contain both room and predicted furniture's full label
        - all_triples:(T,3) whole edges(rm-rm,rm-unit,rm-fur, fur-fur),each triple contains(from_idx,edge_type,to_idx)
        - all_obj2pidx: an array showing the parent node's index of each node
        - boxes_pred:(N,6), predicted box parameters of each node
        - anlges_pred: (N,1), predicted angle cat of each node
        """
        # sample graphs
        with torch.no_grad():
            room_zs = self.sample_latents(
                room_nodes,
                device=device,
                random_seed=random_seed,
                point_classes_idx=point_classes_idx,
                with_categories=with_categories,
            )
            unit_z = self.sample_latents(
                torch.tensor([0]).to(device),
                device=device,
                random_seed=random_seed,
                point_classes_idx=point_classes_idx,
                with_categories=with_categories,
            )
            # no grad, reconstruct full graph
            all_nodes, all_triples, all_zs, all_obj2pidx, roomunit_idxs, fur_idxs = (
                self.reconstruct_full_graph(
                    room_nodes=room_nodes,
                    room_triples=room_triples,
                    room_zs=room_zs,
                    unit_box=unit_box,
                    unit_z=unit_z,
                )
            )

            roomunit_nodes = all_nodes[roomunit_idxs]
            all_unit_box = unit_box[0].repeat((all_zs.size(0), 1)).to(device)
            angles_pred = None
            if self.use_angles:
                boxes_pred, angles_pred, fur_sem_pred = self.decoder(
                    z=all_zs,
                    roomunit_nodes=roomunit_nodes,
                    triples=all_triples,
                    unit_box_gt=all_unit_box,
                    roomunit_idxs=roomunit_idxs,
                    fur_idxs=fur_idxs,
                    obj_to_pidx=all_obj2pidx,
                )
            else:
                boxes_pred, fur_sem_pred = self.decoder(
                    z=all_zs,
                    roomunit_nodes=roomunit_nodes,
                    triples=all_triples,
                    unit_box_gt=all_unit_box,
                    roomunit_idxs=roomunit_idxs,
                    fur_idxs=fur_idxs,
                    obj_to_pidx=all_obj2pidx,
                )

            fur_sem_pred = torch.argmax(fur_sem_pred, dim=1)
            fur_sem_pred = torch.tensor(
                [self.fur2full[int(obj)] for obj in fur_sem_pred]
            ).to(device)
            all_nodes[fur_idxs] = fur_sem_pred

        return (
            all_nodes.detach(),
            all_triples.detach(),
            all_obj2pidx.detach(),
            boxes_pred.detach(),
            angles_pred.detach(),
        )

    def collect_train_statistics(self, train_loader, with_categories=False):
        # model = model.eval()
        mean_cat = None
        if with_categories:
            means, vars = {}, {}
            for idx in train_loader.dataset.point_classes_idx:
                means[idx] = []
                vars[idx] = []
            means[-1] = []
            vars[-1] = []

        for idx, data in enumerate(train_loader):
            if data == -1:
                continue
            try:
                (
                    objs,
                    triples,
                    tight_boxes,
                    objs_to_scene,
                    triples_to_scene,
                    unit_box,
                ) = (
                    data["decoder"]["objs"],
                    data["decoder"]["triples"],
                    data["decoder"]["boxes"],
                    data["decoder"]["obj_to_scene"],
                    data["decoder"]["triple_to_scene"],
                    data["decoder"]["unit_box"],
                )

                if "feats" in data["decoder"]:
                    encoded_points = data["decoder"]["feats"]
                    encoded_points = encoded_points.to(self.device)
                enc_text_feat, enc_rel_feat = None, None
                if "text_feats" in data["decoder"] and "rel_feats" in data["decoder"]:
                    enc_text_feat, enc_rel_feat = (
                        data["decoder"]["text_feats"],
                        data["decoder"]["rel_feats"],
                    )
                    enc_text_feat, enc_rel_feat = (
                        enc_text_feat.to(self.device),
                        enc_rel_feat.to(self.device),
                    )
                if "gt_edge_feats" in data["decoder"]:
                    enc_gt_edge_feats = data["decoder"]["gt_edge_feats"].to(self.device)

            except Exception as e:
                print("Exception", str(e))
                continue

            objs, triples, tight_boxes, unit_box = (
                objs.to(self.device),
                triples.to(self.device),
                tight_boxes.to(self.device),
                unit_box.to(self.device),
            )
            boxes = tight_boxes[:, :6]
            angles = tight_boxes[:, 6].long() - 1
            angles = torch.where(angles > 0, angles, torch.zeros_like(angles))
            attributes = None

            mean, logvar = self.encoder(
                nodes=objs,
                triples=triples,
                boxes_gt=boxes,
                angles_gt=angles,
                edge_feats_gt=enc_gt_edge_feats,
                unit_box_gt=unit_box,
            )
            mean, logvar = mean.cpu().clone(), logvar.cpu().clone()

            mean = mean.data.cpu().clone()
            if with_categories:
                for i in range(len(objs)):
                    if objs[i] in train_loader.dataset.point_classes_idx:
                        means[int(objs[i].cpu())].append(mean[i].detach().cpu().numpy())
                        vars[int(objs[i].cpu())].append(
                            logvar[i].detach().cpu().numpy()
                        )
                    else:
                        means[-1].append(mean[i].detach().cpu().numpy())
                        vars[-1].append(logvar[i].detach().cpu().numpy())
            else:
                if mean_cat is None:
                    mean_cat = mean
                else:
                    mean_cat = torch.cat([mean_cat, mean], dim=0)

        if with_categories:
            for idx in train_loader.dataset.point_classes_idx + [-1]:
                if len(means[idx]) < 3:
                    means[idx] = np.zeros(self.embedding_dim)
                    vars[idx] = np.eye(self.embedding_dim)
                else:
                    mean_cat = np.stack(means[idx], 0)
                    mean_est = np.mean(
                        mean_cat, axis=0, keepdims=True
                    )  # size 1*embed_dim
                    mean_cat = mean_cat - mean_est
                    n = mean_cat.shape[0]
                    d = mean_cat.shape[1]
                    cov_est = np.zeros((d, d))
                    for i in range(n):
                        x = mean_cat[i]
                        cov_est += 1.0 / (n - 1.0) * np.outer(x, x)
                    mean_est = mean_est[0]
                    means[idx] = mean_est
                    vars[idx] = cov_est
            self.mean_est_box = means
            self.cov_est_box = vars
            return means, vars
        else:
            mean_cat = torch.nan_to_num(mean_cat, nan=0.0)  # TODO: FIX nan values
            mean_est = torch.mean(
                mean_cat.float(), dim=0, keepdim=True
            )  # size 1*embed_dim

            mean_cat = mean_cat - mean_est
            cov_est_ = np.cov(mean_cat.numpy().T)
            n = mean_cat.size(0)
            d = mean_cat.size(1)
            cov_est = np.zeros((d, d))
            for i in range(n):
                x = mean_cat[i].numpy()
                cov_est += 1.0 / (n - 1.0) * np.outer(x, x)
            mean_est = mean_est[0]
            self.mean_est_box = mean_est
            self.cov_est_box = cov_est_

            return mean_est, cov_est_

    def extract_room_graph(self, dec_objs, dec_triples, unit_boxes, obj_to_pidx):
        """
        extract room nodes and inter-room edges from full graph
        exclude all nodes and edges from furniture and unit
        """
        room_idxs = torch.where(
            (obj_to_pidx == torch.arange(dec_objs.shape[0]).to(obj_to_pidx.device))
            & (dec_objs != 0)
        )[
            0
        ]  # filter out furniture and units
        # Filter triples for those that involve room objects
        # room-room
        room_triples_mask = torch.isin(dec_triples[:, 0], room_idxs) & torch.isin(
            dec_triples[:, 2], room_idxs
        )
        # mapping room edge from and  to indexes
        full2room_idx = {old_idx: new_idx for new_idx, old_idx in enumerate(room_idxs)}
        mapped_triples = dec_triples.clone()
        for old_idx, new_idx in full2room_idx.items():
            mapped_triples[:, 0] = torch.where(
                mapped_triples[:, 0] == old_idx, new_idx, mapped_triples[:, 0]
            )
            mapped_triples[:, -1] = torch.where(
                mapped_triples[:, -1] == old_idx, new_idx, mapped_triples[:, -1]
            )
        room_triples = mapped_triples[room_triples_mask]
        room_objs = dec_objs[room_idxs]
        room_bbox = unit_boxes[room_idxs]

        return room_objs, room_triples, room_bbox

    def reconstruct_full_graph(
        self, room_nodes, room_triples, room_zs, unit_box, unit_z=None
    ):
        """
        do not work with batches
        used after training, for predicting a single room graph into full graph
        input the extracted room nodes (room_nodess),edges(room_triples) and node features(room_zs) from original full graph
        using prior sampler to sample furniture subgraph for each room node

        @input
        - room_nodes: a tensor of (N_rm,1), room node category in full label, only room nodes, no '_unit_'
        - room_triples: a tensor of (T_rm,3), each element is triple (from_idx,edge_type,to_idx)
        - room_zs: a tensor of (N_rm,feat_dim), sampled room node features
        - unit_box: a tensor of (N_rm,), indicating the unit bounding box xyz size
        - unit_z: unit node features, could be none

        @return
        - all_objs:a tensor of (N,1), include both unit,room and furniture nodes, furniture nodes using -1 as place holder
        - all_triples: a tensor of (T,3), including rm-unit, rm-rm, rm-fur, and fur-fur edges,each element is triple (from_idx,edge_type,to_idx)
        - all_zs: a tensor of (N, feat_dim)
        - all_obj2pidx: an array maps current idx to the parent node's idex
        - roomunit_idxs:an array containing all room nodes and unit nodes' idxs
        - fur_idxs: an array containing all furniture nodes' idxs
        """
        room_num = room_nodes.size(0)
        device = room_zs.device

        unitbox_vecs = self.unit_box_embeddings_pr(unit_box)
        # room semantic features
        room_sem_vecs = self.sem_embeddings_rm_pr(room_nodes)
        room_vecs = torch.cat([room_sem_vecs, unitbox_vecs, room_zs], dim=1)  # 2D
        fur_z, fur_edges = self.prior_sampler.sample_fur_nodes(room_vecs)  # 2 lists

        # create new graph
        all_objs = room_nodes.detach().clone().to(device)
        all_zs = room_zs.detach().clone().to(device)
        all_triples = room_triples.detach().clone().to(device)
        all_obj2pidx = torch.arange(0, room_nodes.size(0)).to(device)
        start_idx = room_nodes.shape[0]

        # store idxs
        room_idxs = list(range(room_num))
        fur_idxs = []

        # create new edges
        fur_edge_id = self.vocab["full_rel_idx_to_name"].index("near") + 1
        fur_rm_edge_id = self.vocab["full_rel_idx_to_name"].index("inside") + 1
        rm_unit_edge_id = 0

        # insert furniture graph into room graphs
        for i, (feats, edges) in enumerate(zip(fur_z, fur_edges)):
            if feats is not None:
                # Update indices for furniture triples
                fur_num = feats.size(0)
                cats = torch.flatten(
                    torch.tensor([-1]).repeat((fur_num, 1)).to(device)
                )  # use -1 as category label place holder
                all_objs = torch.cat([all_objs, cats], dim=0)
                all_zs = torch.cat([all_zs, feats], dim=0)
                all_obj2pidx = torch.cat(
                    [all_obj2pidx, torch.tensor([i]).repeat(fur_num)], dim=0
                )
                new_indices = torch.arange(start_idx, start_idx + fur_num)
                fur_idxs.extend(new_indices.tolist())

                if edges is not None:
                    # add inter-furniture edge
                    edges += start_idx
                    transformed_edges = torch.tensor(
                        [[edge[0], fur_edge_id, edge[-1]] for edge in edges],
                        dtype=room_triples.dtype,
                        device=device,
                    )

                    all_triples = torch.cat((all_triples, transformed_edges), dim=0)

                # Add 'inside' edges connecting furniture to its parent room
                fur_room_triples = torch.stack(
                    [
                        new_indices,  # Furniture IDs
                        torch.full(
                            (new_indices.shape[0],), fur_rm_edge_id
                        ),  # Edge type (fur_rm_edge_id)
                        torch.full((new_indices.shape[0],), i),  # Room ID
                    ],
                    dim=1,
                )
                all_triples = torch.cat([all_triples, fur_room_triples], dim=0)
                start_idx += fur_num

        # Add 'belong to' edges connecting each room to the unit node
        all_objs = torch.cat([all_objs, torch.tensor([0])], dim=0)
        unit_index = all_objs.shape[0] - 1
        room_idxs = torch.tensor(room_idxs).to(room_nodes.device)
        room_unit_triples = torch.stack(
            [
                room_idxs,  # Furniture IDs
                torch.full((room_idxs.shape[0],), rm_unit_edge_id),
                torch.full((room_idxs.shape[0],), unit_index),
            ],
            dim=1,
        )
        roomunit_idxs = torch.cat([room_idxs, torch.tensor([unit_index])], dim=0)
        all_triples = torch.cat([all_triples, room_unit_triples], dim=0)
        all_obj2pidx = torch.cat((all_obj2pidx, torch.tensor([unit_index])), dim=0)
        if unit_z is None:
            unit_z = torch.zeros_like(all_zs[0])
        all_zs = torch.cat([all_zs, unit_z], dim=0)

        return (all_objs, all_triples, all_zs, all_obj2pidx, roomunit_idxs, fur_idxs)

    def separate_room_fur_nodes(self, objs, triples, mu, var, obj_to_pids):
        """
        input
        - objs: tensor of (N,) indicating each node's category idx in full category, N is the node count for current batch
        - triples: tensor of (T,3),indicating all edges in the current batch, T is the edge count for current batch, the triple is (from_node_idx,edge_type_idx,to_node_idx)
        - mu: tensor of (N,z_dim) indicating each node's latent vector mean
        - var: tensor of (N,z_dim) indicating each node's latent vector varience
        - obj_to_pids: tensor of (N,) indicating each node's parent room node's index, if itself is a room node, then the index will be itself's index

        ouput
        - room_idxs: room idx
        - furniture_mus: a list of N_r tensors of shape (k,z_dim), each tensor indicates the furniture latent vectors mean for the room
        - furniture_vars: a list of N_r tensors of shape (k,z_dim), each tensor indicates the furniture latent vectors varience for the room
        """
        room_idxs = torch.where(
            (obj_to_pids == torch.arange(objs.shape[0]).to(obj_to_pids.device))
            & (objs != 0)
        )[
            0
        ]  # filter out furniture and units
        furniture_mus = []
        furniture_vars = []
        for room_idx in room_idxs:
            # Find furniture belonging to this room, excluding the room node itself

            furniture_idxs = torch.where(
                (obj_to_pids == room_idx)
                & (torch.arange(objs.shape[0]).to(obj_to_pids.device) != room_idx)
            )[0]
            if furniture_idxs.size(0) > 0:
                furniture_mus_room = mu[furniture_idxs]
                furniture_vars_room = var[furniture_idxs]

            else:
                furniture_mus_room = None
                furniture_vars_room = None

            furniture_mus.append(furniture_mus_room)
            furniture_vars.append(furniture_vars_room)

        return (
            room_idxs,
            furniture_mus,
            furniture_vars,
        )
