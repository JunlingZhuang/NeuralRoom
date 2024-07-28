import torch
import torch.nn as nn
import torch.nn.functional as F


import torch
import torch.nn as nn


class EdgeFeatsLinear(nn.Module):
    def __init__(self, in_features, out_features, edge_types, num_layers=1):
        super(EdgeFeatsLinear, self).__init__()
        self.out_features = out_features

        # Create a ModuleDict of edge transforms, each being a sequence of Linear -> BatchNorm1d -> ReLU layers
        self.edge_transforms = nn.ModuleDict()
        for edge_type in edge_types:
            layers = []
            for i in range(num_layers):
                if i == 0:  # For the first layer, in_features is used
                    layers.append(nn.Linear(in_features, out_features))
                else:  # For subsequent layers, out_features is used for both in and out features
                    layers.append(nn.Linear(out_features, out_features))
                # layers.append(nn.BatchNorm1d(out_features))

                layers.append(nn.ReLU())
            self.edge_transforms[str(edge_type)] = nn.Sequential(*layers)

    def forward(self, edge_features, edge_types):
        outputs = torch.zeros(edge_features.shape[0], self.out_features).to(
            edge_features.device
        )
        for edge_type in self.edge_transforms:
            mask = edge_types == int(edge_type)
            transformed_features = self.edge_transforms[edge_type](edge_features[mask])
            outputs[mask] = transformed_features
        return outputs
