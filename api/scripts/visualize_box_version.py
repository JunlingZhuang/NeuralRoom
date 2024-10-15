import json
import os
import random
import sys
import copy

import gdown
import numpy as np
import torch
import torch.nn.parallel
import torch.utils.data

# Local application-specific imports
# sys.path.append("../")
from dataset.threedfront_dataset import DatasetSceneGraph
from helpers.util import (
    params_to_8points_3dfront,
    params_to_8points_no_rot,
    batch_torch_denormalize_box_params,
)
from helpers.viz_util import (
    create_scene_meshes,
    export_scene_meshes,
    force_room_adjacency,
    rel_to_abs_box_params,
    ROOM_HIER_MAP,
)
from model.VAE_prior import VAE_PRIOR


def donwload_ckpt(share_link, destination_path):
    gdown.download(share_link, destination_path, quiet=False, fuzzy=True)


def prepare_dataset_and_model(
    args_location="test/partition_emb_box_250/args.json", ckpt_epoch=240, ckpt_link=None
):
    with open(args_location, "r") as json_file:
        args = json.load(json_file)
    args["device"] = "cpu"
    if os.getcwd().split("\\")[-1] == "scripts":
        args["exp"] = "../" + args["exp"]
        args["dataset"] = "../" + args["dataset"]
        args["data_list"] = "../" + args["data_list"]
    device = torch.device(args["device"])

    random.seed(args["manualSeed"])
    torch.manual_seed(args["manualSeed"])

    train_dataset = DatasetSceneGraph(
        root=args["dataset"],
        data_list=args["data_list"],
        split="train",
        shuffle_objs=True,
        use_SDF=args["with_SDF"],
        use_scene_rels=True,
        with_changes=args["with_changes"],
        with_feats=args["with_feats"],
        with_CLIP=args["with_CLIP"],
        large=args["large"],
        seed=False,
        recompute_feats=False,
        recompute_clip=False,
        device=args["device"],
        angle_num=args.get("angle_num", 24),
        norm_scale=args.get("norm_scale", 3),
        use_gt_edge_feats=args.get("use_gt_edge_feats", False),
    )

    collate_fn = train_dataset.collate_fn_vaegan_points
    dataloader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=args["batchSize"],
        collate_fn=collate_fn,
        shuffle=True,
        num_workers=int(2),
    )

    model = VAE_PRIOR(
        vocab=train_dataset.vocab,
        residual=args["residual"],
        gconv_pooling="avg",
        with_angles=True,
        num_box_params=args["num_box_params"],
        device=args["device"],
        angle_num=args.get("angle_num", 24),
        embed_dim=args.get("embed_dim", 64),
    )

    if torch.cuda.is_available():
        model = model.to(device)

    # load model
    ckpt_path = os.path.join(
        args["exp"], "checkpoint", "model_box_{}.pth".format(ckpt_epoch)
    )
    if not os.path.exists(ckpt_path):
        assert ckpt_link is not None
        donwload_ckpt(ckpt_link, ckpt_path)
        print("model check point downloaded succesfully")
    model.load_networks(args["exp"], epoch=ckpt_epoch)

    print("model loaded!")
    model.eval()
    model.compute_statistics(
        exp=args["exp"],
        epoch=ckpt_epoch,
        stats_dataloader=dataloader,
        force=False,
        with_categories=args.get("categorize_latents", False),
    )
    print("training statistics collected")

    bbox_file = os.path.join(args["dataset"], "cat_jid_all.json")
    with open(bbox_file, "r") as read_file:
        box_data = json.load(read_file)

    # TODO: EXPORT UNIT BOX NORMALIZATION PARAM INTO THE TEXT
    box_file = os.path.join(args["dataset"], "boxes_centered_stats_all.txt")

    return args, model, train_dataset, box_data, box_file


def rationalize_box_params(
    boxes_pred_den,
    angles_pred,
    unit_box_mean,
    unit_box_std,
    dec_unit_box,
    dec_triples,
    obj_to_pidx,
    adj_rel_idx,
    norm_scale,
    module_dim=None,
):
    """
    rationalize the raw output, forcing adjacent rooms attached and children boxes inside the parent boxes
    return
    - box_points: list of 8 corner points with rotation
    - denormalized_boxes: lisst of box params without rotation (dx,dy,dz,cenx,ceny,cenz)

    """
    angles_pred[-1] = 0.0
    dec_triples = dec_triples.to(boxes_pred_den.device)
    obj_to_pidx = obj_to_pidx.to(boxes_pred_den.device)

    # unnormalize rel params to abs params
    denormalized_boxes = rel_to_abs_box_params(
        boxes_pred_den,
        obj_to_pidx,
        dec_unit_box[0],
        unit_box_mean,
        unit_box_std,
        angles_pred=angles_pred,
        norm_scale=norm_scale,
        module_dim=module_dim,
    )

    # force adjacent rooms attach to each other
    adj_room_idxs = torch.where(dec_triples[:, 1] == adj_rel_idx)
    adj_list = dec_triples[adj_room_idxs][:, [0, 2]]
    denormalized_boxes = force_room_adjacency(adj_list, denormalized_boxes, obj_to_pidx)
    box_points_list = []
    box_and_angle_list = []
    for i in range(len(denormalized_boxes)):
        if angles_pred is None:
            box_points_list.append(params_to_8points_no_rot(denormalized_boxes[i]))
        else:
            box_and_angle = np.concatenate(
                [denormalized_boxes[i].float(), angles_pred[i].float()]
            )
            box_and_angle_list.append(box_and_angle)
            box_points_list.append(
                params_to_8points_3dfront(box_and_angle, degrees=True)
            )

    # Concatenate the list of tensors into a single tensor
    box_points = np.array(box_points_list)

    return box_points, denormalized_boxes, angles_pred


def process_raw_data(objs, triples, dataset, unit_box=[6.0, 3.0, 6.0], norm_scale=1):
    # prepare unit_box
    num_objs = len(objs)
    unit_box_mean = dataset.unit_box_mean
    unit_box_std = dataset.unit_box_std
    unit_box = norm_scale * (unit_box - unit_box_mean) / unit_box_std
    unit_box = torch.from_numpy(np.array(unit_box).astype(np.float32))
    unit_box = unit_box.unsqueeze(0).repeat(num_objs, 1)

    # torchify
    objs = torch.from_numpy(np.array(objs).astype(np.int64))
    triples = torch.from_numpy(np.array(triples).astype(np.int64))
    unit_box = torch.from_numpy(np.array(unit_box).astype(np.float32))
    return objs, triples, unit_box


def generate_queried_unit_mesh(
    input_objs=None,
    input_triples=None,
    unit_box=None,
    args=None,
    model=None,
    train_dataset=None,
):
    """
    input nodes, edges, and the custom unit_box(optional), generate the unit mesh
    """
    bbox_file = os.path.join(args["dataset"], "cat_jid_all.json")
    with open(bbox_file, "r") as read_file:
        box_data = json.load(read_file)

    # TODO: EXPORT UNIT BOX NORMALIZATION PARAM INTO THE TEXT
    box_file = os.path.join(args["dataset"], "boxes_centered_stats_all.txt")
    if "unit_box_mean" not in args:
        unit_box_mean = train_dataset.unit_box_mean
        unit_box_std = train_dataset.unit_box_std
    else:
        unit_box_mean = np.array(args["unit_box_mean"])
        unit_box_std = np.array(args["unit_box_std"])
    obj_idx2name = {v: k for k, v in train_dataset.classes.items()}
    rel_idx2name = {k + 1: v for k, v in enumerate(train_dataset.relationships)}
    rel_idx2name[0] = "belong to"
    adj_rel_idx = train_dataset.relationships_dict["adjacent to"]
    device = args["device"]

    # parse data
    dec_objs, dec_triples, dec_unit_box = process_raw_data(
        input_objs, input_triples, train_dataset, unit_box, args.get("norm_scale")
    )
    dec_objs, dec_triples, dec_unit_box = (
        dec_objs.to(device),
        dec_triples.to(device),
        dec_unit_box.to(device),
    )
    seed = random.randint(1, 10000)

    new_objs, new_triples, new_obj2pidx, boxes_pred, angles_pred = model.vae_box.infer(
        room_nodes=dec_objs,
        room_triples=dec_triples,
        unit_box=dec_unit_box,
        random_seed=seed,
        point_classes_idx=train_dataset.point_classes_idx,
        with_categories=args.get("categorize_latents", False),
    )

    angle_num = args.get("angle_num", 24)

    angles_pred = -180 + (torch.argmax(angles_pred, dim=1, keepdim=True) + 1) * (
        360 / angle_num
    )

    # round angles
    angles_pred = torch.round(angles_pred / 90) * 90

    boxes_pred_den = batch_torch_denormalize_box_params(
        boxes_pred[:, :6],
        file=box_file,
        device=args["device"],
        scale=args.get("norm_scale", 1),
    )

    box_points, denormalized_boxes, angles_pred = rationalize_box_params(
        boxes_pred_den,
        angles_pred,
        unit_box_mean,
        unit_box_std,
        dec_unit_box,
        new_triples,
        new_obj2pidx,
        adj_rel_idx,
        norm_scale=args.get("norm_scale", 1),
        module_dim=0.5,
    )

    detailed_obj_class = list(train_dataset.classes.keys())
    sdf_dir = "DEEPSDF_reconstruction/Meshes"
    # get furniture category
    fur_cat_file = args["dataset"] + "/cat_jid_all.json"
    with open(fur_cat_file, "r") as file:
        fur_cat = json.load(file)
    # trimesh mesh object
    meshes, _, _ = create_scene_meshes(
        new_objs,
        new_obj2pidx,
        denormalized_boxes,
        angles_pred,
        detailed_obj_class,
        fur_cat,
        sdf_dir,
        retrieve_sdf=False,  # export box only meshes
        ceiling_and_floor=False,
        substract_room=True,
    )
    exp_dir = os.path.join(args["exp"], "mesh")
    mesh_name = "test.obj"
    exp_path = os.path.join(exp_dir, mesh_name)
    if not os.path.exists(exp_dir):
        os.makedirs(exp_dir, exist_ok=True)
    export_scene_meshes(meshes, new_objs, obj_idx2name, exp_path)
    return exp_path
