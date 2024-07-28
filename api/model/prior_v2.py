import torch
import torch.nn as nn
import numpy as np
from helpers.viz_util import ROOM_HIER_MAP
from scipy.optimize import linear_sum_assignment
import torch.nn.functional as F
from model.graph import make_mlp, _init_weights
from itertools import combinations


class AsymmetricLossOptimized(nn.Module):
    """
    https://github.com/Alibaba-MIIL/ASL
    Notice - optimized version, minimizes memory allocation and gpu uploading,
    favors inplace operations"""

    def __init__(
        self,
        gamma_neg=4,
        gamma_pos=1,
        clip=0.05,
        eps=1e-8,
        disable_torch_grad_focal_loss=False,
    ):
        super(AsymmetricLossOptimized, self).__init__()

        self.gamma_neg = gamma_neg
        self.gamma_pos = gamma_pos
        self.clip = clip
        self.disable_torch_grad_focal_loss = disable_torch_grad_focal_loss
        self.eps = eps

        # prevent memory allocation and gpu uploading every iteration, and encourages inplace operations
        self.targets = self.anti_targets = self.xs_pos = self.xs_neg = (
            self.asymmetric_w
        ) = self.loss = None

    def forward(self, x, y):
        """ "
        Parameters
        ----------
        x: input logits
        y: targets (multi-label binarized vector)
        """

        self.targets = y
        self.anti_targets = 1 - y

        # Calculating Probabilities
        self.xs_pos = torch.sigmoid(x)
        self.xs_neg = 1.0 - self.xs_pos

        # Asymmetric Clipping
        if self.clip is not None and self.clip > 0:
            self.xs_neg.add_(self.clip).clamp_(max=1)

        # Basic CE calculation
        self.loss = self.targets * torch.log(self.xs_pos.clamp(min=self.eps))
        self.loss.add_(self.anti_targets * torch.log(self.xs_neg.clamp(min=self.eps)))

        # Asymmetric Focusing
        if self.gamma_neg > 0 or self.gamma_pos > 0:
            if self.disable_torch_grad_focal_loss:
                torch.set_grad_enabled(False)
            self.xs_pos = self.xs_pos * self.targets
            self.xs_neg = self.xs_neg * self.anti_targets
            self.asymmetric_w = torch.pow(
                1 - self.xs_pos - self.xs_neg,
                self.gamma_pos * self.targets + self.gamma_neg * self.anti_targets,
            )
            if self.disable_torch_grad_focal_loss:
                torch.set_grad_enabled(True)
            self.loss *= self.asymmetric_w

        return -self.loss.sum()


class FurnitureDecoder(nn.Module):

    def __init__(
        self,
        input_size,
        node_feat_size,
        hidden_size,
        max_fur_num,
        mlp_normalization="none",
    ):
        """
        take room features to predict furniture number and furniture features
        """
        # node_feat_size -- z size
        super(FurnitureDecoder, self).__init__()

        self.feat_size = node_feat_size
        self.max_fur_num = max_fur_num
        self.hidden_size = hidden_size

        # MLPs to map parent features to child features
        self.mlp_parent = nn.Linear(
            input_size, hidden_size * max_fur_num
        )  # each child has its own representation

        self.mlp_exists = make_mlp(
            [hidden_size, int(hidden_size / 2), 1],
            batch_norm=mlp_normalization,
            norelu=True,
        )

        # take the output of mlp_child to predict mean and var
        self.mlp_child_mean = make_mlp(
            [hidden_size, node_feat_size], batch_norm=mlp_normalization, norelu=True
        )
        self.mlp_child_var = make_mlp(
            [hidden_size, node_feat_size], batch_norm=mlp_normalization, norelu=True
        )

        # predict if each room node a leaf node or not
        self.mlp_leaf = make_mlp(
            [input_size, 1], batch_norm=mlp_normalization, norelu=True
        )

        # initialization
        self.mlp_parent.apply(_init_weights)
        self.mlp_exists.apply(_init_weights)
        self.mlp_child_mean.apply(_init_weights)
        self.mlp_child_var.apply(_init_weights)
        self.mlp_leaf.apply(_init_weights)

    def forward(self, room_z):
        """
        input
        - room_z : (N,room_z_dim) sampled latent vectors of room nodes,

        returns
        - room_is_leaf: (N,), the tensor of the prob of the room is a leaf node (no furniture)
        - furniture_feats_mean: (N,10,z_dim),The tensor of the mean of child features distribution
        - furniture_feats_var: (N,10,z_dim),The tensor of the var of child features distribution
        - furniture_exist_logits: (N,10,1) The tensor of child node exist prob logits

        """
        batch_size = room_z.shape[0]
        feat_size = self.feat_size

        # Predict if room node a leaf node
        room_is_leaf = torch.sigmoid(self.mlp_leaf(room_z))

        room_feats = torch.relu(self.mlp_parent(room_z))  # (N, z_dim * 10)
        furniture_feats = room_feats.view(
            batch_size, self.max_fur_num, self.hidden_size
        )  # (N, 10, z_dim)

        # Node existence
        furniture_exist_logits = self.mlp_exists(
            furniture_feats.view(batch_size * self.max_fur_num, self.hidden_size)
        )  # (N*10, 1)
        furniture_exists_logits = furniture_exist_logits.view(
            batch_size, self.max_fur_num, 1
        )  # (N, 10, 1)
        furniture_exists_logits = furniture_exists_logits

        # Node features mean and var
        furniture_feats_mean = self.mlp_child_mean(
            furniture_feats.view(-1, self.hidden_size)
        )
        furniture_feats_var = self.mlp_child_var(
            furniture_feats.view(-1, self.hidden_size)
        )

        furniture_feats_mean = furniture_feats_mean.view(
            batch_size, self.max_fur_num, feat_size
        )
        furniture_feats_var = furniture_feats_var.view(
            batch_size, self.max_fur_num, feat_size
        )

        return (
            room_is_leaf,
            furniture_feats_mean,
            furniture_feats_var,
            furniture_exists_logits,
        )


class PriorSampler(nn.Module):

    def __init__(
        self,
        input_size,
        node_feat_size,
        hidden_size,
        max_fur_num,
        mlp_normalization="none",
    ):
        super(PriorSampler, self).__init__()
        self.max_fur_num = max_fur_num
        self.feat_dim = node_feat_size
        self.furniture_decoder = FurnitureDecoder(
            input_size,
            node_feat_size,
            hidden_size,
            max_fur_num,
            mlp_normalization=mlp_normalization,
        )
        self.exist_criterion = AsymmetricLossOptimized(
            gamma_neg=2, gamma_pos=0, clip=0.1, disable_torch_grad_focal_loss=True
        )

    def linear_assignment(self, mu_gt, var_gt, mu_pred, var_pred):
        """
        Using Hungarian matching algorithms to match gt nodes and pred nodes using KL divergence as cost.
        Inputs are means and variances of the Gaussian distributions for GT and Pred.
        - mu_gt: Mean vectors for the GT nodes (size: [num_gt, feature_dim])
        - var_gt: Variance vectors for the GT nodes (size: [num_gt, feature_dim])
        - mu_pred: Mean vectors for the Pred nodes (size: [num_pred, feature_dim])
        - var_pred: Variance vectors for the Pred nodes (size: [num_pred, feature_dim])

        Returns:
        - matched_pred_idx: the indices in the mu_pred/var_pred that match the GT
        - matched_gt_idx: the indices in the mu_gt/var_gt that match the Pred
        """
        num_gt = mu_gt.size(0)
        num_pred = mu_pred.size(0)
        if num_gt == 0 or num_pred == 0:
            return np.array([]), np.array([])  # No matches

        with torch.no_grad():
            # Expand dimensions to create matrices for pairwise comparison
            mu_gt_exp = mu_gt.unsqueeze(0).expand(num_pred, -1, -1)
            var_gt_exp = var_gt.unsqueeze(0).expand(num_pred, -1, -1)
            mu_pred_exp = mu_pred.unsqueeze(1).expand(-1, num_gt, -1)
            var_pred_exp = var_pred.unsqueeze(1).expand(-1, num_gt, -1)
            # Compute KL divergence for each pair
            kl_divergence = (
                self.compute_kl_divergence(
                    mu_gt_exp, var_gt_exp, mu_pred_exp, var_pred_exp
                )
                .cpu()
                .detach()
            )
            if torch.any(torch.isnan(kl_divergence)) or torch.any(
                torch.isinf(kl_divergence)
            ):
                print("Non-finite values detected in KL divergence calculation")

            # Pad the cost matrix to make it square if necessary
            max_size = max(num_gt, num_pred)
            padded_cost_matrix = np.pad(
                kl_divergence.numpy(),
                ((0, max_size - num_gt), (0, max_size - num_pred)),
                mode="constant",
                constant_values=np.max(kl_divergence.numpy()) + 1,
            )

            # Perform Hungarian matching on the padded cost matrix
            matched_pred_idx, matched_gt_idx = linear_sum_assignment(padded_cost_matrix)
            return matched_pred_idx, matched_gt_idx

    def compute_kl_divergence(
        self, mu_gt, log_var_gt, mu_pred, log_var_pred, sum_dim=-1
    ):
        """
        Compute the KL divergence between two Gaussian distributions with means (mu) and
        log-variances (log_var).
        """
        var_gt = torch.exp(log_var_gt)  # Converting log-variance to variance
        var_pred = torch.exp(log_var_pred)

        epsilon = 1e-8  # Use a small epsilon to avoid division by zero
        var_ratio = var_pred / var_gt
        mean_diff = mu_pred - mu_gt
        mean_diff_sq = mean_diff.pow(2)

        # Summing KL divergence across dimensions for multivariate Gaussians
        kl_div = 0.5 * torch.sum(
            torch.log(var_ratio + epsilon)
            + (var_gt / var_pred)
            + (mean_diff_sq / var_pred)
            - 1,
            dim=sum_dim,
        )
        kl_div = torch.where(torch.isfinite(kl_div), kl_div, torch.zeros_like(kl_div))
        return kl_div

    def sample_fur_nodes(self, room_z, exist_threshold=0.5):
        """
        input
        - room_z : a tensor of (N,room_z_dim), the latent vector mean for N room nodes
        - exist_threshold: a threshold to decide if a node is existent or not

        return
        - fur_feats: a list of N tensor of (k,feat_dim), the predicted furniture node features
        - fur_edges: a list of N tensor of (n_edge,2), marking the from and to index of furniture nodes

        note: k could be different for each room, if the room has no furniture, it will be None
        """
        batch_size = room_z.size(0)
        device = room_z.device
        with torch.no_grad():
            # predict furniture node existence and features
            (
                is_leaf_pred,  # (N,1)
                fur_mu_pred,  # (N,10,feat_dim)
                fur_var_pred,  # (N,10,feat_dim)
                fur_exist_pred,  # (N,10,1)
            ) = self.furniture_decoder(room_z)

            # exist_mask
            fur_exists_mask = fur_exist_pred > exist_threshold

            feats_pred = []
            edges_pred = []

            for i in range(batch_size):
                feats = None
                edges = None
                exist_idx = torch.nonzero(fur_exists_mask[i].squeeze(-1)).flatten()
                count_pred = exist_idx.size(0)
                if is_leaf_pred[i] < 0.5:  # if have furniture
                    if count_pred > 0:
                        mu_pred = fur_mu_pred[i][exist_idx].to(device)
                        var_pred = fur_var_pred[i][exist_idx].to(device)
                        std = torch.exp(0.5 * mu_pred)
                        eps = torch.rand_like(std)
                        feats = eps.mul(std).add_(var_pred)

                    if count_pred > 1:  # at least 2 nodes to have edge
                        edges = torch.tensor(
                            list(combinations(range(count_pred), 2)), dtype=torch.int64
                        )

                feats_pred.append(feats)
                edges_pred.append(edges)

        return feats_pred, edges_pred

    def accuracy(self, Y_hat, Y, averaged=True):
        """Compute the number of correct predictions."""
        Y_hat = Y_hat.reshape((-1, Y_hat.shape[-1]))
        compare = (Y_hat == Y.reshape(-1)).type(torch.float32)
        return compare.mean() if averaged else compare

    def forward(self, room_z, fur_mu_gt, fur_var_gt, exist_threshold=0.5):
        """
        input
        - room_z : a tensor of (N,room_z_dim), the latent vector mean for N room nodes
        - fur_mu_gt : a list of N tensors of shape (k,z_dim), each tensor indicates the furniture latent vectors mean for the room,
        - fur_var_gt : a list of N tensors of shape (k,z_dim), each tensor indicates the furniture latent vectors varience for the room,
        - exist_threshold: a threshold to decide if a node is existent or not

        return
        - loss_info : a dictionary contains reconstruction loss information
        note: k could be different for each room, if the room has no furniture, it will be None
        """
        batch_size = room_z.size(0)
        feats_dim = self.feat_dim
        device = room_z.device

        # is_leaf  1 means leaf node, without furniture
        is_leaf_gt = torch.tensor([1.0 if item is None else 0.0 for item in fur_mu_gt])
        is_leaf_gt = is_leaf_gt.to(device)

        # fur_mean_gt fur_var_gt is a list  of N tensor (k,z_dim) or None, k is different for each tensor 1 to 10, z_dim is fixed
        fur_mu_gt = [
            torch.empty((0, feats_dim)) if item is None else item for item in fur_mu_gt
        ]
        fur_var_gt = [
            torch.empty((0, feats_dim)) if item is None else item for item in fur_var_gt
        ]

        # predict furniture node existence and features
        (
            is_leaf_pred,  # (N,1)
            fur_mu_pred,  # (N,10,feat_dim)
            fur_var_pred,  # (N,10,feat_dim)
            fur_exist_pred_logits,  # (N,10,1)
        ) = self.furniture_decoder(room_z)

        fur_exist_pred = torch.sigmoid(fur_exist_pred_logits)

        # exist_mask
        fur_exists_mask = fur_exist_pred > exist_threshold

        # loss for classifying if the room has furniture
        is_leaf_loss_fn = nn.BCELoss()
        is_leaf_loss = is_leaf_loss_fn(is_leaf_pred.squeeze(), is_leaf_gt)

        is_leaf_acc = self.accuracy(
            is_leaf_pred.squeeze() > 0.5, is_leaf_gt, averaged=True
        )

        # loss calculation
        total_node_exist_loss = 0.0
        total_node_feats_loss = 0.0
        total_unmatched_loss = 0.0
        total_exist_acc = 0.0
        total_node_pred_diff = 0.0
        for i in range(batch_size):
            max_gt_nodes = int(fur_mu_gt[i].size(0))

            # ground truth room has furniture
            if max_gt_nodes > 0:
                exist_idxs = torch.nonzero(fur_exists_mask[i].squeeze(-1)).flatten()

                # prepare gt and pred
                mu_gt = fur_mu_gt[i].to(device)  # (n_gt, feat_dim)
                var_gt = fur_var_gt[i].to(device)  # (n_gt, feat_dim)
                mu_pred = fur_mu_pred[i][exist_idxs].to(device)  # (n_ptrd, feat_dim)
                var_pred = fur_var_pred[i][exist_idxs].to(device)  # (n_pred, feat_dim)
                exist_pred = fur_exist_pred[i].to(device)  # (10,1)
                exist_logits = fur_exist_pred_logits[i].to(device)  # (10,1)

                # reparameterization
                std = torch.exp(0.5 * mu_pred)
                eps = torch.randn_like(std)
                feats_pred = eps.mul(std).add_(var_pred)  # (n_pred, feat_dim)

                # matching nodes
                (matched_pred_idx, matched_gt_idx) = self.linear_assignment(
                    mu_gt, var_gt, mu_pred, var_pred
                )  # both will of size with the smaller one

                matched_mu = torch.zeros((max_gt_nodes, feats_dim)).to(device)
                matched_var = torch.zeros((max_gt_nodes, feats_dim)).to(device)
                matched_feats = torch.zeros((max_gt_nodes, feats_dim)).to(device)

                # calculate kl loss
                if (
                    len(matched_pred_idx) > 0 and len(matched_gt_idx) > 0
                ):  # if there is matching nodes
                    matched_mu[matched_gt_idx] = mu_pred[matched_pred_idx]
                    matched_var[matched_gt_idx] = var_pred[matched_pred_idx]
                    matched_feats[matched_gt_idx] = feats_pred[matched_pred_idx]

                    # feature loss
                    kl_loss = self.compute_kl_divergence(
                        mu_gt[matched_gt_idx],
                        var_gt[matched_gt_idx],
                        mu_pred[matched_pred_idx],
                        var_pred[matched_pred_idx],
                    )
                    total_node_feats_loss += torch.sum(kl_loss)

                # calculate node existence loss
                exist_gt = torch.zeros_like(
                    exist_pred, dtype=torch.float, device=device
                )  # (10,1)
                matched_exist_idx = exist_idxs[matched_pred_idx]
                exist_gt[matched_exist_idx] = 1.0
                smoothing = 0.2
                exist_gt_smooth = exist_gt * (
                    1 - smoothing
                ) + smoothing / exist_gt.size(
                    0
                )  # soft labeling trick
                exist_loss = self.exist_criterion(exist_logits, exist_gt_smooth)
                total_node_exist_loss += exist_loss

                # calculate exist accuracy
                exist_acc = self.accuracy(exist_pred > 0.5, exist_gt, averaged=True)
                total_exist_acc += exist_acc

                # penalize unused nodes

                gt_node_count = max_gt_nodes
                pred_node_count = fur_exists_mask[i].sum()
                total_node_pred_diff += torch.abs(gt_node_count - pred_node_count)

        # print(
        #     f" exist loss {total_node_exist_loss/batch_size}, penalty {total_unmatched_loss/batch_size}"
        # )
        # print(
        #     f" exist loss {total_node_exist_loss/batch_size:.4f},acc {total_exist_acc/batch_size:.4f},num diff {total_node_pred_diff/batch_size:.4f}"
        # )
        loss_info = {
            "feats": (total_node_feats_loss) / batch_size,
            "leaf": is_leaf_loss,
            "node_exists": (total_node_exist_loss + total_unmatched_loss) / batch_size,
            "node_exists_acc": total_exist_acc / batch_size,
            "leaf_acc": is_leaf_acc,
        }
        return loss_info
