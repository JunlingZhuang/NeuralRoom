import json
import yaml
import trimesh
import os
import random

# import open3d as o3d
import numpy as np
from helpers.util import (
    fit_shapes_to_box_3dfront,
    params_to_8points_no_rot,
)
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union

# import json
import torch
import plotly.graph_objects as go

# import plotly.express as px
# import pyrender
# import imageio
from PIL import Image

# courtyard>service>storage>bathroom>bedroom>library>kitchen>diningroom>balcony>circulation>livingroom
ROOM_HIER_MAP = {
    "bathroom": 4,
    "bedroom": 5,
    "diningroom": 8,
    "kitchen": 7,
    "library": 6,
    "livingroom": 10,
    "circulation": 3,
    "courtyard": 0,
    "storage": 2,
    "service": 1,
    "balcony": 9,
}


# function to separate room graph from main graph
def extract_room_graph(data):
    """
    input
    - data: dict, format of data from dataset

    output
    - room_idxs: room idxs in original obj tensor
    - room_objs: a tensor of (T,), the room object ids
    - room_triples: a tensor of (T_r,3), the T_r room-involved edge tuples of (from_idx,edge type, to_idx)

    """
    objs = data["decoder"]["objs"]
    triples = data["decoder"]["triples"]
    obj_to_pidx = data["decoder"]["obj_to_pidx"]
    room_idxs = torch.where(
        (obj_to_pidx == torch.arange(objs.shape[0]).to(obj_to_pidx.device))
        & (objs != 0)
    )[
        0
    ]  # filter out furniture and units
    room_triples_mask = torch.isin(triples[:, 0], room_idxs) & torch.isin(
        triples[:, 2], room_idxs
    )
    room_triples = triples[room_triples_mask]
    room_objs = objs[room_idxs]

    return room_idxs, room_objs, room_triples


def get_bedroom_count(room_objs, obj_idx2name):
    """
    input
    - room_objs: a tensor of (N_r,), room node category id
    - obj_idx2name: a dictionary, map category id to its label

    output
    - bedroom_count: an int showing the number of bedroom count
    """
    bedroom_num = 0
    for room_obj in room_objs:
        if "bedroom" == obj_idx2name[int(room_obj)]:
            bedroom_num += 1

    return bedroom_num


# get all zs for the whole graph
# use room_idxs to retrieve room nodes
# sum them to get the new latent vector for the whole room graph
def get_graph_latent_features(
    data,
    random_seed=852,
    model=None,
    args=None,
    point_classes_idx=None,
):
    device = args["device"]
    dec_objs = data["decoder"]["objs"]
    dec_triples = data["decoder"]["triples"]
    dec_text_feat = None
    dec_rel_feat = None
    if args["with_CLIP"]:
        dec_rel_feat = data["decoder"]["rel_feats"]
        dec_text_feat = data["decoder"]["text_feats"]
        dec_rel_feat = dec_rel_feat.to(device)
        dec_text_feat = dec_text_feat.to(device)
    dec_unit_box = data["decoder"]["unit_box"]

    with torch.no_grad():
        np.random.seed(random_seed)

    dec_objs = dec_objs.to(device)
    dec_triples = dec_triples.to(device)
    dec_unit_box = dec_unit_box.to(device)

    sample_with_categories = args.get("categorize_latents", False)
    with torch.no_grad():
        s, p, o = dec_triples.chunk(3, dim=1)  # All have shape (T, 1)
        s, p, o = [x.squeeze(1) for x in [s, p, o]]  # Now have shape (T,)
        edges = torch.stack([s, o], dim=1)  # Shape is (T, 2)

        obj_vecs = model.vae_box.obj_embeddings_dc(dec_objs)
        s_embeddings = obj_vecs[s, :]
        o_embeddings = obj_vecs[o, :]
        pred_vecs = torch.cat(
            (s_embeddings, o_embeddings), dim=1
        )  # use concatenation of node feats as edge feats initialization
        pred_vecs = model.vae_box.pred_embeddings_dc(pred_vecs, p)
        unit_box_vecs = model.vae_box.unit_box_embeddings(dec_unit_box)
        obj_vecs_ = torch.cat([obj_vecs, unit_box_vecs], dim=1)
        if sample_with_categories:
            assert point_classes_idx is not None
            z = []
            for idxz in dec_objs:
                idxz = int(idxz.cpu())
                if idxz in point_classes_idx:
                    z.append(
                        torch.from_numpy(
                            np.random.multivariate_normal(
                                model.mean_est_box[idxz], model.cov_est_box[idxz], 1
                            )
                        )
                        .float()
                        .to(device)
                    )
                else:
                    z.append(
                        torch.from_numpy(
                            np.random.multivariate_normal(
                                model.mean_est_box[-1], model.cov_est_box[-1], 1
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
                        model.mean_est_box, model.cov_est_box, dec_objs.size(0)
                    )
                )
                .float()
                .to(device)
            )
        obj_vecs_ = torch.cat([obj_vecs_, z], dim=1)
        obj_vecs_, pred_vecs = model.vae_box.gconv_net_dc(obj_vecs_, pred_vecs, edges)

    return obj_vecs_


def pool_latent_features(
    room_idxs,
    obj_vecs_,
    graph_type="room",
):
    assert graph_type in ["full", "room", "root"]
    if graph_type == "full":
        pooled_feat = torch.sum(obj_vecs_[:-1], dim=0)
    elif graph_type == "room":
        room_vecs = obj_vecs_[room_idxs]
        pooled_feat = torch.sum(room_vecs, dim=0)
    elif graph_type == "root":
        pooled_feat = obj_vecs_[-1]
    return pooled_feat


def load_semantic_scene_graphs_custom(
    yml_relationships, color_palette, rel_label_to_id, with_manipuation=False
):
    scene_graphs = {}

    graphs = yaml.load(open(yml_relationships, "r"))
    for scene_id, scene in graphs["Scenes"].items():

        scene_graphs[str(scene_id)] = {}
        scene_graphs[str(scene_id)]["objects"] = []
        scene_graphs[str(scene_id)]["relationships"] = []
        scene_graphs[str(scene_id)]["node_mask"] = [1] * len(scene["nodes"])
        scene_graphs[str(scene_id)]["edge_mask"] = [1] * len(scene["relships"])

        for i, n in enumerate(scene["nodes"]):
            obj_item = {
                "ply_color": color_palette[i % len(color_palette)],
                "id": str(i),
                "label": n,
            }
            scene_graphs[str(scene_id)]["objects"].append(obj_item)
        for r in scene["relships"]:
            rel_4 = [r[0], r[1], rel_label_to_id[r[2]], r[2]]
            scene_graphs[str(scene_id)]["relationships"].append(rel_4)
        counter = len(scene["nodes"])
        if with_manipuation:
            for m in scene["manipulations"]:
                if m[1] == "add":
                    # visualize an addition
                    # ['chair', 'add', [[2, 'standing on'], [1, 'left']]]
                    obj_item = {
                        "ply_color": color_palette[counter % len(color_palette)],
                        "id": str(counter),
                        "label": m[0],
                    }
                    scene_graphs[str(scene_id)]["objects"].append(obj_item)

                    scene_graphs[str(scene_id)]["node_mask"].append(0)
                    for mani_rel in m[2]:
                        rel_4 = [
                            counter,
                            mani_rel[0],
                            rel_label_to_id[mani_rel[1]],
                            mani_rel[1],
                        ]
                        scene_graphs[str(scene_id)]["relationships"].append(rel_4)
                        scene_graphs[str(scene_id)]["edge_mask"].append(0)
                    counter += 1
                if m[1] == "rel":
                    # visualize changes in the relationship
                    for rid, r in enumerate(
                        scene_graphs[str(scene_id)]["relationships"]
                    ):
                        s, o, p, l = r
                        if isinstance(m[2][3], list):
                            # ['', 'rel', [0, 1, 'right', [0, 1, 'left']]]
                            if (
                                s == m[2][0]
                                and o == m[2][1]
                                and l == m[2][2]
                                and s == m[2][3][0]
                                and o == m[2][3][1]
                            ):
                                # a change on the SAME (s, o) pair, indicate the change
                                scene_graphs[str(scene_id)]["edge_mask"][rid] = 0
                                scene_graphs[str(scene_id)]["relationships"][rid][3] = (
                                    m[2][2] + "->" + m[2][3][2]
                                )
                                scene_graphs[str(scene_id)]["relationships"][rid][2] = (
                                    rel_label_to_id[m[2][3][2]]
                                )
                                break
                            elif s == m[2][0] and o == m[2][1] and l == m[2][2]:
                                # overwrite this edge with a new pair (s,o)
                                del scene_graphs[str(scene_id)]["edge_mask"][rid]
                                del scene_graphs[str(scene_id)]["relationships"][rid]
                                scene_graphs[str(scene_id)]["edge_mask"].append(0)
                                new_edge = [
                                    m[2][3][0],
                                    m[2][3][1],
                                    rel_label_to_id[m[2][3][2]],
                                    m[2][3][2],
                                ]
                                scene_graphs[str(scene_id)]["relationships"].append(
                                    new_edge
                                )
                        else:
                            # ['', 'rel', [0, 1, 'right', 'left']]
                            if s == m[2][0] and o == m[2][1] and l == m[2][2]:
                                scene_graphs[str(scene_id)]["edge_mask"][rid] = 0
                                scene_graphs[str(scene_id)]["relationships"][rid][3] = (
                                    m[2][2] + "->" + m[2][3]
                                )
                                scene_graphs[str(scene_id)]["relationships"][rid][2] = (
                                    rel_label_to_id[m[2][3]]
                                )
                                break

    return scene_graphs


def load_semantic_scene_graphs(json_relationships, json_objects):
    scene_graphs_obj = {}

    with open(json_objects, "r") as read_file:
        data = json.load(read_file)
        for s in data["scans"]:
            scan = s["scan"]
            objs = s["objects"]
            scene_graphs_obj[scan] = {}
            scene_graphs_obj[scan]["scan"] = scan
            scene_graphs_obj[scan]["objects"] = []
            for obj in objs:
                scene_graphs_obj[scan]["objects"].append(obj)
    scene_graphs = {}
    with open(json_relationships, "r") as read_file:
        data = json.load(read_file)
        for s in data["scans"]:
            scan = s["scan"]
            split = str(s["split"])
            if scan + "_" + split not in scene_graphs:
                scene_graphs[scan + "_" + split] = {}
                scene_graphs[scan + "_" + split]["objects"] = []
                print("WARNING: no objects for this scene")
            scene_graphs[scan + "_" + split]["relationships"] = []
            for k in s["objects"].keys():
                ob = s["objects"][k]
                for i, o in enumerate(scene_graphs_obj[scan]["objects"]):
                    if o["id"] == k:
                        inst = i
                        break
                scene_graphs[scan + "_" + split]["objects"].append(
                    scene_graphs_obj[scan]["objects"][inst]
                )
            for rel in s["relationships"]:
                scene_graphs[scan + "_" + split]["relationships"].append(rel)
    return scene_graphs


def read_relationships(read_file):
    relationships = []
    with open(read_file, "r") as f:
        for line in f:
            relationship = line.rstrip().lower()
            relationships.append(relationship)
    return relationships


# from kaleido.scopes.plotly import PlotlyScope
def calculate_distance(box1, box2):
    """
    Calculate the minimum distance between two boxes along x and z directions.
    Each box is represented by an array: [size_x, size_y, size_z, center_x, center_y, center_z].
    """
    size1, center1 = box1[:3], box1[3:]
    size2, center2 = box2[:3], box2[3:]

    distance_x = abs(center1[0] - center2[0]) - (size1[0] + size2[0]) / 2
    distance_z = abs(center1[2] - center2[2]) - (size1[2] + size2[2]) / 2

    return max(distance_x, 0), max(distance_z, 0)


def force_room_pair_attach(room1_idx, room2_idx, boxes, obj_to_pidx):
    """
    Adjust the position of box1 to eliminate any gap with box2 along the x or z direction.
    Moves box1 and its associated furniture along the direction of minimum non-zero distance.
    """
    all_boxes = boxes.clone()
    room1 = all_boxes[room1_idx]
    room2 = all_boxes[room2_idx]
    distance_x, distance_z = calculate_distance(room1, room2)

    # Determine direction to move based on minimum non-zero distance
    move_x = move_z = 0
    if distance_x > 0 and (distance_x <= distance_z or distance_z == 0):
        # Move along x
        direction = torch.sign(room2[3] - room1[3])
        move_x = direction * distance_x
    if distance_z > 0 and (distance_z < distance_x or distance_x == 0):
        # Move along z
        direction = torch.sign(room2[5] - room1[5])
        move_z = direction * distance_z

    for i, room in enumerate(all_boxes):
        if obj_to_pidx[i] == room1_idx:  # move room1 and associated furniture
            room[3] += move_x
            room[5] += move_z

    return all_boxes


def modularize_room(denormalized_boxes, obj_to_pidx, module_dim=0.5):
    """
    denormalized_boxes: a list of box parameter tensors [dx,dy,dz,cenx,ceny,cenz]
    obj_to_pidx: a list maps child to their parent index
    module_dim: the module dimension used to standarize the room boxes
    """
    num_objs = denormalized_boxes.size(0)
    fur_idxs = [i for i in range(num_objs - 1) if i != obj_to_pidx[i]]
    room_idxs = [i for i in range(num_objs - 1) if i not in fur_idxs]
    for i in room_idxs:
        room_box = denormalized_boxes[i]
        room_size = room_box[:3]
        room_cen = room_box[3:]
        room_origin = room_cen - room_size / 2
        mod_size = torch.abs(torch.round(room_size / module_dim) * module_dim)
        mod_origin = torch.round(room_origin / module_dim) * module_dim
        mod_cen = mod_origin + mod_size / 2
        denormalized_boxes[i][:3] = mod_size
        denormalized_boxes[i][3:] = mod_cen

    return denormalized_boxes


def force_room_adjacency(
    adjacency_list, boxes, obj_to_pidx, max_iter=100, vertical_threshold=2.0
):
    """
    Check and adjust positions of all adjacent room pairs iteratively until no more adjustments are needed
    or the maximum number of iterations is reached.
    """
    adjusted_boxes = boxes.clone()
    counter = 0

    while counter < max_iter:
        adjusted = False
        for pair in adjacency_list:
            room1_idx, room2_idx = pair
            vertical_distance = np.abs(
                adjusted_boxes[room1_idx][4] - adjusted_boxes[room2_idx][4]
            )  # [size_x, size_y, size_z, center_x, center_y, center_z] check center_y
            if vertical_distance >= vertical_threshold:
                continue
            before_distance = calculate_distance(
                adjusted_boxes[room1_idx], adjusted_boxes[room2_idx]
            )

            adjusted_boxes = force_room_pair_attach(
                room1_idx, room2_idx, adjusted_boxes, obj_to_pidx
            )

            after_distance = calculate_distance(
                adjusted_boxes[room1_idx], adjusted_boxes[room2_idx]
            )

            # If the distance changed, mark as adjusted
            if before_distance != after_distance:
                adjusted = True

        counter += 1
        # Break the loop if no adjustments were made in this iteration
        if not adjusted:
            break

    return adjusted_boxes


def params_to_8points_3dfront(box, degrees=False):
    """Given bounding box as 7 parameters: l, h, w, cx, cy, cz, z, compute the 8 corners of the box"""
    l, h, w, px, py, pz, angle = box
    points = []
    for i in [-1, 1]:
        for j in [-1, 1]:
            for k in [-1, 1]:
                points.append([l.item() / 2 * i, h.item() / 2 * j, w.item() / 2 * k])
    points = np.asarray(points)
    points = points.dot(get_rotation_3dfront(angle.item(), degree=degrees))
    points += np.expand_dims(np.array([px.item(), py.item(), pz.item()]), 0)
    return points


def get_rotation_3dfront(y, degree=True):
    if degree:
        y = np.deg2rad(y)
    rot = np.array([[np.cos(y), 0, -np.sin(y)], [0, 1, 0], [np.sin(y), 0, np.cos(y)]])
    return rot


def find_anchors(numbers, threshold=0.2, zero_min=True):
    numbers = sorted(numbers)
    anchors = []

    # Initial anchor setup based on zero_min flag
    if zero_min and numbers[0] < threshold:
        anchors.append(0)
    else:
        anchors.append(numbers[0])

    for num in numbers[1:]:
        # If num is within threshold of any existing anchor, it's not a new anchor
        if any(np.abs(num - anchor) < threshold for anchor in anchors):
            continue
        if zero_min and num < 0:
            continue

        anchors.append(num)

    return sorted(set(anchors))


def assign_to_nearest(numbers, anchors):
    """Assign each number to its nearest anchor value."""
    rationalized = []
    for num in numbers:
        if num < 0.2:
            rationalized.append(0)
        else:
            # Find the nearest anchor for this number
            nearest_anchor = min(anchors, key=lambda x: abs(x - num))
            rationalized.append(nearest_anchor)
    return rationalized


def rationalize_list(numbers, threshold=0.2):
    """
    Aim to rationalize y values
    """
    # First, find the anchors based on the given list and threshold
    anchors = find_anchors(numbers, threshold)
    # Then, assign each number to its nearest anchor
    rationalized_numbers = assign_to_nearest(numbers, anchors)

    return rationalized_numbers


def rel_to_abs_box_params(
    boxes,
    obj_to_pidx,
    unit_box_size,
    unit_mean,
    unit_std,
    angles_pred=None,
    norm_scale=1,
    module_dim=None,
):
    """Convert the relative params (dx,dy,dz,origin_x,origin_y,origin_z), which all
    normalized within their parent bbox, into abs params  (dx,dy,dz,cen_x,cen_y,cen_z)
    """
    # Denormalize unit_box to abs size
    unit_box_size = (unit_box_size * unit_std) / norm_scale + unit_mean
    # Calculate unit box's origin based on its center being at (0,0,0)
    unit_origin = torch.tensor([0.0, 0.0, 0.0], device=unit_box_size.device) - (
        unit_box_size / 2
    )
    unit_max = torch.tensor([0.0, 0.0, 0.0], device=unit_box_size.device) + (
        unit_box_size / 2
    )
    # Initialize tensor for unnormalized boxes
    unnormalized_boxes = torch.zeros_like(boxes)
    num_objs = boxes.size(0)

    fur_idxs = [i for i in range(num_objs - 1) if i != obj_to_pidx[i]]
    room_idxs = [i for i in range(num_objs - 1) if i not in fur_idxs]
    # iterate the origin_y s, rationalize them with threshold 0.2
    room_ori_y = [boxes[i, 4] for i in room_idxs]
    rationalized_ori_y = rationalize_list(room_ori_y)
    threshold = 0.8
    # Unnormalize room boxes using unit box size
    for idx, i in enumerate(room_idxs):  # Exclude the unit itself
        norm_box = boxes[i]
        norm_box[4] = rationalized_ori_y[idx]  # rationalize y
        norm_box = torch.clamp(norm_box, min=0.0, max=1.0)
        size = norm_box[:3] * unit_box_size
        for j in range(3):
            max_val = 1.0 - norm_box[j]
            norm_box[j + 3] = torch.clamp(norm_box[j + 3], min=0.0, max=max_val)

        origin = norm_box[3:] * unit_box_size + unit_origin
        if module_dim is not None:
            size = torch.abs(torch.round(size / module_dim) * module_dim)
            origin = torch.round(origin / module_dim) * module_dim
        # push to the boundary
        max_pt = origin + size
        origin = torch.where((origin - unit_origin) < threshold, unit_origin, origin)
        origin = torch.where((unit_max - max_pt) < threshold, unit_max - size, origin)
        cen = origin + (size / 2)
        unnormalized_boxes[i, :3] = size
        unnormalized_boxes[i, 3:] = cen

    # Unnormalize furniture boxes using their parent room boxes
    for i in fur_idxs:
        parent_idx = obj_to_pidx[i]
        parent_size = unnormalized_boxes[parent_idx, :3]
        parent_origin = unnormalized_boxes[parent_idx, 3:] - (parent_size / 2)
        norm_box = boxes[i]
        norm_box = torch.clamp(norm_box, min=0.0, max=1.0)
        size = norm_box[:3] * parent_size
        if angles_pred is not None:
            fur_angle = angles_pred[i] % 360
            if fur_angle not in (0.0, 180.0, -180.0):
                for j in range(3):
                    if fur_angle not in (90.0, -90.0, 270.0, -270):
                        max_val = min(1.0 - norm_box[j], 1.0 - norm_box[2 - j])
                    else:
                        max_val = 1.0 - norm_box[2 - j]
                    max_val = max(max_val, 0.0)
                    norm_box[j + 3] = torch.clamp(norm_box[j + 3], min=0.0, max=max_val)
            else:
                for j in range(3):
                    max_val = max(1.0 - norm_box[j], 0.0)
                    norm_box[j + 3] = torch.clamp(norm_box[j + 3], min=0.0, max=max_val)
        else:
            print("input should contain angles")
            raise ValueError
        origin = norm_box[3:] * parent_size + parent_origin
        # force same origin y
        origin[1] = parent_origin[1]
        cen = origin + (size / 2)
        unnormalized_boxes[i, :3] = size
        unnormalized_boxes[i, 3:] = cen

    # Handle unit box (assumed to be the last entry)
    unnormalized_boxes[-1, :3] = unit_box_size
    unnormalized_boxes[-1, 3:] = unit_origin + (unit_box_size / 2)

    return unnormalized_boxes


def adjust_positions_to_center(
    unnormalized_boxes, obj_to_pidx, unit_center=torch.tensor([0.0, 0.0, 0.0])
):
    num_objs = unnormalized_boxes.size(0)

    # Calculate the centroid of all rooms and adjust their positions
    room_indices = [
        i for i in range(num_objs - 1) if obj_to_pidx[i] == i
    ]  # Identify rooms
    if room_indices:
        room_centers = unnormalized_boxes[room_indices, 3:]
        rooms_centroid = room_centers.mean(0)
        rooms_offset = unit_center - rooms_centroid
        for i in room_indices:
            unnormalized_boxes[i, 3:] += rooms_offset

    # Adjust furniture positions relative to the adjusted room positions
    for room_idx in room_indices:
        furniture_indices = [
            i
            for i in range(num_objs - 1)
            if obj_to_pidx[i] == room_idx and obj_to_pidx[i] != i
        ]
        if furniture_indices:
            # Use the room center AFTER adjustment as the target for furniture centroid
            target_center = unnormalized_boxes[room_idx, 3:]
            furniture_centers = unnormalized_boxes[furniture_indices, 3:]
            furniture_centroid = furniture_centers.mean(0)
            furniture_offset = target_center - furniture_centroid
            for fur_idx in furniture_indices:
                unnormalized_boxes[fur_idx, 3:] += furniture_offset

    return unnormalized_boxes


def box_vertices_faces(cornerpoints):
    vertices = cornerpoints
    faces = np.array(
        [
            [0, 1, 3],
            [0, 3, 2],
            [0, 4, 5],
            [0, 5, 1],
            [1, 5, 7],
            [1, 7, 3],
            [2, 3, 7],
            [2, 7, 6],
            [0, 2, 6],
            [0, 6, 4],
            [4, 6, 7],
            [4, 7, 5],
        ]
    )
    return vertices, faces


def make_room_mesh(predBox, predAngle):
    box_and_angle = torch.cat([predBox.float(), predAngle.float()])
    box_points = params_to_8points_3dfront(box_and_angle, degrees=True)
    vertices = box_points
    faces = np.array(
        [
            [0, 1, 3],
            [0, 3, 2],
            [0, 4, 5],
            [0, 5, 1],
            [1, 5, 7],
            [1, 7, 3],
            # [2, 3, 7],
            # [2, 7, 6],
            [0, 2, 6],
            [0, 6, 4],
            [4, 6, 7],
            [4, 7, 5],
        ]
    )
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
    # TODO: find a way to calculate uve
    uv = np.random.rand(mesh.vertices.shape[0], 2)
    texture_image = Image.open("config/material/wall.png")
    material = trimesh.visual.texture.SimpleMaterial(image=texture_image)
    color_visuals = trimesh.visual.TextureVisuals(
        uv=uv, image=texture_image, material=material
    )
    mesh.visual = color_visuals
    return mesh


def create_floor(predBox, predAngle):
    box_and_angle = torch.cat([predBox.float(), predAngle.float()])
    points_list_x = []
    points_list_z = []
    box_points = params_to_8points_3dfront(box_and_angle, degrees=True)
    vertices, faces = box_vertices_faces(box_points)
    min_y = np.min(vertices[:, 1])
    points_list_x.append(box_points[0:2, 0])
    points_list_x.append(box_points[4:6, 0])
    points_list_z.append(box_points[0:2, 2])
    points_list_z.append(box_points[4:6, 2])
    points_x = np.array(points_list_x).reshape(-1, 1)
    points_y = np.zeros(points_x.shape)
    points_z = np.array(points_list_z).reshape(-1, 1)
    points = np.concatenate((points_x, points_y, points_z), axis=1)
    min_x, _, min_z = np.min(points, axis=0)
    max_x, _, max_z = np.max(points, axis=0)
    vertices = np.array(
        [
            [min_x, min_y, min_z],
            [min_x, min_y, max_z],
            [max_x, min_y, max_z],
            [max_x, min_y, min_z],
        ],
        dtype=np.float32,
    )
    faces = np.array([[0, 1, 2], [0, 2, 3]])

    return trimesh.Trimesh(vertices=vertices, faces=faces)


def retrieve_furniture_mesh(
    detailed_obj_class,
    dec_objs_grained,
    fur_id,
    fur_cat,
    sdf_dir,
    denormalized_boxes,
    angles_pred,
    shapes_pred,
    obj_to_pidx,
):
    class_name_grained = detailed_obj_class[int(dec_objs_grained[fur_id])]
    # print(class_name_grained)
    sdf_names = list(fur_cat[class_name_grained].keys())

    mesh_loaded = False
    attempts = 0
    max_attempts = len(sdf_names)

    # Attempt to load a mesh for the furniture, with a limit on the number of attempts
    while not mesh_loaded and attempts < max_attempts:
        sdf_name = random.choice(sdf_names)
        sdf_path = os.path.join(sdf_dir, sdf_name, "sdf.ply")
        if os.path.exists(sdf_path):
            mesh = trimesh.load(sdf_path)
            _, mesh = fit_shapes_to_box_3dfront(
                mesh,
                box=torch.cat(
                    [denormalized_boxes[fur_id].float(), angles_pred[fur_id].float()]
                ),
                degrees=True,
            )
            min_y = np.min(mesh.vertices[:, 1])
            p_id = int(obj_to_pidx[fur_id])
            parent_y = denormalized_boxes[p_id].float()[4] - (
                denormalized_boxes[p_id].float()[1] / 2
            )
            # move min_y to parent y
            offset = min_y - parent_y
            translation_vector = [0, -offset, 0]  # move to parent min y
            mesh.apply_translation(translation_vector)

            mesh.visual.face_colors = [[240, 125, 125, 255]] * len(mesh.faces)
            shapes_pred[fur_id] = mesh
            mesh_loaded = True
            # Remove the attempted sdf_name to avoid repeating the same failed attempt
            sdf_names.remove(sdf_name)
            attempts += 1


def create_scene_meshes(
    dec_objs_grained,
    obj_to_pidx,
    denormalized_boxes,
    angles_pred,
    detailed_obj_class,
    fur_cat,
    sdf_dir,
    retrieve_sdf=True,
    ceiling_and_floor=False,
    substract_room=False,
):
    # draw from furniture id
    num_obj = dec_objs_grained.size(0)

    fur_idxs = [i for i in range(num_obj) if i != obj_to_pidx[i]]
    room_idxs = [
        i
        for i in range(num_obj)
        if i not in fur_idxs
        and detailed_obj_class[int(dec_objs_grained[i])] != "_unit_"
    ]

    unit_id = -1
    shapes_pred = [None] * num_obj

    extrusion_intervals = {}
    for room_id in room_idxs:
        mesh = create_floor(denormalized_boxes[room_id], angles_pred[room_id])
        shapes_pred[room_id] = mesh
        extrusion_intervals[room_id] = denormalized_boxes[room_id][1]  # y size

    room_hier_dic = {}
    for room_id in room_idxs:  # ROOM_HIER_MAP
        room_class = detailed_obj_class[int(dec_objs_grained[int(room_id)])]
        hier_id = ROOM_HIER_MAP[room_class]
        room_hier_dic[room_id] = hier_id

    # group rooms by their y level and perform boolean separately
    room_y_mins = [np.min(shapes_pred[id].vertices[:, 1]) for id in room_idxs]
    anchors = find_anchors(room_y_mins, threshold=1.5, zero_min=False)
    room_to_anchor = {}
    room_y_mins_assigned = []

    for idx, y_min in zip(room_idxs, room_y_mins):
        nearest_anchor = min(anchors, key=lambda anchor: abs(anchor - y_min))
        room_y_mins_assigned.append(nearest_anchor)
        if nearest_anchor in room_to_anchor:
            room_to_anchor[nearest_anchor].append(idx)
        else:
            room_to_anchor[nearest_anchor] = [idx]

    ceilings = []
    floors = []
    for anchor, room_idxs_subset in room_to_anchor.items():
        # Perform boolean operations on each sublist of room indices
        if not ceiling_and_floor:
            shapes_pred = perform_boolean_operations(
                shapes_pred,
                room_idxs_subset,
                room_hier_dic,
                extrusion_intervals,
                ceiling_and_floor,
                substract_room=substract_room,
            )
        else:
            shapes_pred, floor, ceiling = perform_boolean_operations(
                shapes_pred,
                room_idxs_subset,
                room_hier_dic,
                extrusion_intervals,
                ceiling_and_floor,
                substract_room=substract_room,
            )
            floor.metadata["name"] = "floor"
            ceiling.metadata["name"] = "ceiling"
            ceilings.append(ceiling)
            floors.append(floor)

    for fur_id in fur_idxs:
        if retrieve_sdf:
            retrieve_furniture_mesh(
                detailed_obj_class,
                dec_objs_grained,
                fur_id,
                fur_cat,
                sdf_dir,
                denormalized_boxes,
                angles_pred,
                shapes_pred,
                obj_to_pidx,
            )
        else:
            box_and_angle = torch.cat(
                [denormalized_boxes[fur_id].float(), angles_pred[fur_id].float()]
            )
            box_points = params_to_8points_3dfront(box_and_angle, degrees=True)
            min_y = np.min(box_points[:, 1])
            p_id = int(obj_to_pidx[fur_id])

            parent_y = room_y_mins_assigned[room_idxs.index(p_id)]
            # move min_y to parent's min_y
            offset = min_y - parent_y
            box_points[:, 1] -= offset
            vertices, faces = box_vertices_faces(box_points)
            mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
            mesh.visual.face_colors = [[240, 125, 125, 255]] * len(mesh.faces)
            shapes_pred[fur_id] = mesh

    meshes = []
    for i, mesh in enumerate(shapes_pred):
        class_name = detailed_obj_class[int(dec_objs_grained[i])]
        if mesh is not None:
            mesh.metadata["name"] = class_name
            meshes.append(mesh)

    # add base
    base = create_floor(denormalized_boxes[unit_id], angles_pred[unit_id])
    base.metadata["name"] = "base"
    meshes.append(base)

    return meshes, floors, ceilings


def shapely_to_trimesh_path(shapely_polygon):
    """
    Convert a Shapely Polygon or MultiPolygon to a trimesh.Path2D object.
    """
    # Check if the input is a MultiPolygon
    if isinstance(shapely_polygon, MultiPolygon):
        # Handle MultiPolygon: you might choose to combine them or handle each polygon separately
        polygons = list(shapely_polygon.geoms)
    elif isinstance(shapely_polygon, Polygon):
        # If it's a single Polygon, wrap it in a list for consistent processing
        polygons = [shapely_polygon]
    else:
        raise TypeError("Input must be a Shapely Polygon or MultiPolygon.")

    # Initialize lists to hold vertices and entities for all polygons
    vertices = []
    entities = []

    for poly in polygons:
        # Extract the exterior of the current polygon
        exterior_coords = np.array(poly.exterior.coords)
        exterior_len = len(exterior_coords)
        exterior_line = trimesh.path.entities.Line(
            np.arange(len(vertices), len(vertices) + exterior_len)
        )

        # Add the exterior vertices and line entity
        vertices.extend(exterior_coords)
        entities.append(exterior_line)

        # Process any interiors (holes)
        for interior in poly.interiors:
            interior_coords = np.array(interior.coords)
            interior_len = len(interior_coords)
            interior_line = trimesh.path.entities.Line(
                np.arange(len(vertices), len(vertices) + interior_len)
            )

            # Add the interior vertices and line entity
            vertices.extend(interior_coords)
            entities.append(interior_line)

    vertices_array = np.array(vertices)
    path = trimesh.path.Path2D(vertices=vertices_array, entities=entities, process=True)

    return path


def mesh_to_shapely_polygon(mesh):
    """
    Convert a trimesh mesh to a Shapely polygon using x and z coordinates.

    Args:
    - mesh (trimesh.Trimesh): The input 3D mesh.

    Returns:
    - shapely.geometry.Polygon: The resulting 2D polygon.
    """
    vertices_xz = mesh.vertices[:, [0, 2]]
    polygons = [Polygon(vertices_xz[face]) for face in mesh.faces]
    combined_polygon = MultiPolygon(polygons).convex_hull

    return combined_polygon


def perform_boolean_operations(
    shapes_pred,
    room_idxs,
    room_hier,
    extrusion_intervals,
    floor_and_ceiling=False,
    apply_material=False,
    substract_room=False,
):
    """
    params:
    - shapes_pred : the list of trimeshes
    - room_idxs : the list of room id to retrieve room mesh in the shapes_pred
    - room_hier : the dictionary that maps room id to its hierarchy id ( the smaller the topper)
    - extrusion_intervals : a dictionary, maps room id to the extrusion height
    - floors_and_ceiling : a bool, set to True will return additional floor and ceiling meshes
    - apply_material: a bool, set to True if want the generated mesh to include material difference for each class
    - substract_room: a bool, set to True if want the rooms to substract each other following the room hierachy order
    the function will perform boolean difference operation between rooms, substracting bottom room with top room, and return the new shapes_pred
    """
    # Sort room_idxs based on their hierarchy id from room_hier
    sorted_rooms = sorted(room_idxs, key=lambda idx: room_hier[idx], reverse=True)
    floors = []
    ceilings = []
    y_min = min(
        [np.min(shapes_pred[room_idx].vertices[:, 1]) for room_idx in room_idxs]
    )

    # Iterate through each room based on the sorted order
    for i, room_idx in enumerate(sorted_rooms):
        current_mesh = shapes_pred[room_idx]
        y_interval = extrusion_intervals[room_idx]
        current_polygon = mesh_to_shapely_polygon(current_mesh)
        if floor_and_ceiling:
            floors.append(current_polygon)
        current_hierarchy = room_hier[room_idx]

        difference_polygon = current_polygon
        if substract_room:
            # Subtract each other_polygon one by one
            for other_idx in sorted_rooms[i + 1 :]:
                if room_hier[other_idx] <= current_hierarchy:
                    other_mesh = shapes_pred[other_idx]
                    other_polygon = mesh_to_shapely_polygon(other_mesh)

                    # Perform the boolean difference operation one by one
                    difference_polygon = difference_polygon.difference(other_polygon)
                    # Check after each subtraction if the polygon is empty
                    if difference_polygon.is_empty:
                        print(
                            f"Subtraction resulted in an empty polygon at {other_idx}, stopping further subtractions."
                        )
                        break

        # Convert the difference polygon back to a trimesh object
        if not difference_polygon.is_empty:
            # shrink to make wall
            shrinked_poly = difference_polygon.buffer(-0.1)  # wall thickness
            new_poly_with_hole = difference_polygon.difference(shrinked_poly)
            translation_vec = [0, y_min, 0]
            try:
                mutable_mesh = extrude_polygons(
                    new_poly_with_hole, y_interval, translation_vec
                )

                # apply material
                if apply_material:
                    uv = np.random.rand(mutable_mesh.vertices.shape[0], 2)
                    texture_image = Image.open("config/material/wall.png")
                    material = trimesh.visual.texture.SimpleMaterial(
                        image=texture_image
                    )
                    color_visuals = trimesh.visual.TextureVisuals(
                        uv=uv, image=texture_image, material=material
                    )
                    mutable_mesh.visual = color_visuals

                # add to original list
                shapes_pred[room_idx] = mutable_mesh
            except:
                print("error in extrude polygons")
        else:
            print(f"No difference mesh generated between room {room_idx}")

    if floor_and_ceiling:
        floor_poly = unary_union(floors)
        thickness = 0.2
        floor_trans_vec = [0, y_min - thickness, 0]
        floor_mesh = extrude_polygons(floor_poly, thickness, floor_trans_vec)
        for i, ceiling_poly in enumerate(floors):
            y_interval = extrusion_intervals[sorted_rooms[i]]
            ceiling_trans_vec = [0, y_min - thickness + y_interval, 0]
            ceiling_mesh = extrude_polygons(ceiling_poly, thickness, ceiling_trans_vec)
            ceilings.append(ceiling_mesh)
        ceiling_con = trimesh.util.concatenate(ceilings)
        return shapes_pred, floor_mesh, ceiling_con
    else:
        return shapes_pred


def extrude_polygons(polygon, height, translation_vec):
    """
    the function will extrude the polygon in y axis by given height as trimesh mesh, then move to the specified location
    """
    path2d = shapely_to_trimesh_path(polygon)
    extruded_mesh = path2d.extrude(height)
    if isinstance(extruded_mesh, list):  # multiple meshes, we concatenate them
        extruded_mesh = combine_meshes(extruded_mesh)
    if extruded_mesh is None:
        print("extruded mesh is None, skipping further operations.")
        return None
    mutable_mesh = trimesh.Trimesh(
        vertices=extruded_mesh.vertices.copy(),
        faces=extruded_mesh.faces.copy(),
    )

    swapped_vertices = mutable_mesh.vertices.copy()
    swapped_vertices[:, [1, 2]] = mutable_mesh.vertices[:, [2, 1]]
    mutable_mesh.vertices = swapped_vertices
    mutable_mesh.apply_translation(translation_vec)
    return mutable_mesh


def combine_meshes(meshes):
    """
    Combine multiple trimesh objects into a single trimesh object.

    Args:
    - meshes (list of trimesh.Trimesh): The meshes to combine.

    Returns:
    - trimesh.Trimesh: A single mesh combining all input meshes.
    """
    if not meshes:  # Check if the list is empty
        print("No meshes to combine.")
        return trimesh.Trimesh()

    # Combine all vertices and faces, adjusting face indices accordingly
    all_vertices = np.vstack([mesh.vertices for mesh in meshes])
    all_faces = np.vstack(
        [
            mesh.faces + offset
            for mesh, offset in zip(
                meshes, np.cumsum([0] + [len(mesh.vertices) for mesh in meshes[:-1]])
            )
        ]
    )

    # Create a new mesh from the combined vertices and faces
    combined_mesh = trimesh.Trimesh(vertices=all_vertices, faces=all_faces)
    return combined_mesh


def export_scene_meshes(shapes_pred, dec_objs, obj_idx2name, exp_path):

    # Create an empty scene
    scene = trimesh.Scene()

    # Add each mesh in your array to the scene
    for i, mesh in enumerate(shapes_pred):
        name = obj_idx2name[int(dec_objs[i])]
        scene.add_geometry(mesh, node_name=name)

    # Export the scene to an OBJ file
    scene.export(file_obj=exp_path, file_type="obj")
