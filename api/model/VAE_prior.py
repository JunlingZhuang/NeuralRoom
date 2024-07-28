import torch
import torch.nn as nn

import pickle
import os
from model.VAEGAN_V5BOX import Sg2ScVAEModel as vae_box


class VAE_PRIOR(nn.Module):
    """
    test of prior model to reduce the furture subgraphs in decoding process
    start from v1 box (graph-to-3d box without CLIP )
    """

    def __init__(
        self,
        vocab=None,
        residual=False,
        gconv_pooling="avg",
        with_angles=False,
        num_box_params=6,
        device="cuda",
        angle_num=24,
        embed_dim=64,
    ):
        super().__init__()
        self.vocab = vocab
        self.with_angles = with_angles
        self.epoch = 0
        self.device = device

        self.vae_box = vae_box(
            vocab,
            embedding_dim=embed_dim,
            decoder_cat=True,
            mlp_normalization="batch",
            input_dim=num_box_params,
            use_angles=with_angles,
            residual=residual,
            gconv_pooling=gconv_pooling,
            gconv_num_layers=5,
            device=device,
            angle_num=angle_num,
        )
        self.counter = 0

    def load_networks(self, exp, epoch, strict=True, restart_optim=False):

        self.vae_box.load_state_dict(
            torch.load(
                os.path.join(exp, "checkpoint", "model_box_{}.pth".format(epoch)),
                map_location=self.device,
            ),
            strict=strict,
        )

    def compute_statistics(
        self, exp, epoch, stats_dataloader, force=False, with_categories=False
    ):
        box_stats_f = os.path.join(
            exp, "checkpoint", "model_stats_box_{}.pkl".format(epoch)
        )
        # stats_f = os.path.join(exp, "checkpoint", "model_stats_{}.pkl".format(epoch))

        if os.path.exists(box_stats_f) and not force:
            stats = pickle.load(open(box_stats_f, "rb"))
            self.mean_est_box, self.cov_est_box = stats[0], stats[1]
            self.vae_box.mean_est_box, self.vae_box.cov_est_box = stats[0], stats[1]
        else:
            self.mean_est_box, self.cov_est_box = self.vae_box.collect_train_statistics(
                stats_dataloader, with_categories=with_categories
            )
            pickle.dump([self.mean_est_box, self.cov_est_box], open(box_stats_f, "wb"))

        # shape version
        # if os.path.exists(stats_f) and not force:
        #     stats = pickle.load(open(stats_f, "rb"))
        #     self.mean_est, self.cov_est = stats[0], stats[1]
        # else:
        #     self.mean_est, self.cov_est = self.vae_box.collect_train_statistics(
        #         stats_dataloader, with_categories=with_categories
        #     )
        #     pickle.dump([self.mean_est, self.cov_est], open(stats_f, "wb"))

    def save(self, exp, outf, epoch, counter=None):

        torch.save(
            self.vae_box.state_dict(),
            os.path.join(exp, outf, "model_box_{}.pth".format(epoch)),
        )
