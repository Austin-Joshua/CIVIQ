"""Phase B — contrastive (InfoNCE) loss for self-supervised security representation learning."""
from __future__ import annotations

import torch
import torch.nn.functional as F


def info_nce_loss(z1: torch.Tensor, z2: torch.Tensor, temperature: float = 0.1) -> torch.Tensor:
    """
    z1, z2: [B, D] L2-normalized projections for two augmented views of the same flows.
    SimCLR-style batch contrastive loss.
    """
    b = z1.size(0)
    z = torch.cat([z1, z2], dim=0)  # [2B, D]
    sim = torch.matmul(z, z.T) / temperature
    mask = torch.eye(2 * b, device=z.device, dtype=torch.bool)
    sim = sim.masked_fill(mask, -1e9)
    targets = torch.empty(2 * b, dtype=torch.long, device=z.device)
    targets[:b] = torch.arange(b, 2 * b, device=z.device)
    targets[b:] = torch.arange(0, b, device=z.device)
    return F.cross_entropy(sim, targets)
