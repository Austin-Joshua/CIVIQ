"""
Hierarchical security encoder:
  1) Byte-level encoder — payload / path patterns
  2) Packet-level encoder — metadata vs payload packets in one request
  3) Flow-level encoder — session / rate behavior

Phase A patchify + embedding: conv patch extractor, byte + position embeddings, CLS.
Phase C head: Linear -> GELU -> Dropout -> Linear (3-way: normal / suspicious / malicious).
"""
from __future__ import annotations

from typing import Dict, List, Tuple, Any

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


class ByteEncoder(nn.Module):
    def __init__(self, d_model: int = 128, nhead: int = 4, layers: int = 2, max_len: int = 512):
        super().__init__()
        self.emb = nn.Embedding(257, d_model, padding_idx=0)
        self.pos = nn.Embedding(max_len, d_model)
        enc_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 4,
            batch_first=True,
            activation="gelu",
        )
        self.enc = nn.TransformerEncoder(enc_layer, num_layers=layers)
        self.max_len = max_len

    def forward(self, byte_ids: torch.Tensor) -> torch.Tensor:
        b, l = byte_ids.shape
        l = min(l, self.max_len)
        x = self.emb(byte_ids[:, :l]) + self.pos(torch.arange(l, device=byte_ids.device)).unsqueeze(0)
        pad = byte_ids[:, :l] == 0
        out = self.enc(x, src_key_padding_mask=pad)
        mask = (~pad).unsqueeze(-1).float()
        return (out * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1.0)


class PacketEncoder(nn.Module):
    """Two packets: first/second half of byte embedding sequence + CLS."""

    def __init__(self, d_model: int = 128, nhead: int = 4, layers: int = 1):
        super().__init__()
        self.proj = nn.Linear(d_model, d_model)
        enc_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 2,
            batch_first=True,
            activation="gelu",
        )
        self.enc = nn.TransformerEncoder(enc_layer, num_layers=layers)
        self.cls = nn.Parameter(torch.zeros(1, 1, d_model))

    def forward(self, byte_emb_seq: torch.Tensor) -> torch.Tensor:
        x = self.proj(byte_emb_seq)
        mid = max(1, x.size(1) // 2)
        h = x[:, :mid, :].mean(dim=1, keepdim=True)
        p = x[:, mid:, :].mean(dim=1, keepdim=True)
        seq = torch.cat([self.cls.expand(x.size(0), -1, -1), h, p], dim=1)
        out = self.enc(seq)
        return out[:, 0, :]


class SecurityFlowNet(nn.Module):
    def __init__(self, d_model: int = 128, max_len: int = 512):
        super().__init__()
        self.d_model = d_model
        self.max_len = max_len
        self.byte_emb = nn.Embedding(257, d_model, padding_idx=0)
        self.byte_pos = nn.Embedding(max_len, d_model)
        self.byte_encoder = ByteEncoder(d_model=d_model, max_len=max_len)
        self.packet_encoder = PacketEncoder(d_model=d_model)

        self.patch_conv = nn.Conv2d(1, 16, kernel_size=4, stride=4)
        self.patch_proj = nn.Linear(16 * 8 * 8, d_model)

        self.flow_mlp = nn.Sequential(
            nn.Linear(d_model + 5 + 3, d_model),
            nn.GELU(),
            nn.Linear(d_model, d_model),
        )
        self.fusion = nn.Sequential(
            nn.Linear(d_model * 3, d_model),
            nn.GELU(),
        )
        self.proj_head = nn.Sequential(nn.Linear(d_model, d_model), nn.GELU(), nn.Linear(d_model, d_model))
        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(d_model, 3),
        )

    def _byte_sequence(self, byte_ids: torch.Tensor) -> torch.Tensor:
        b, l = byte_ids.shape
        l = min(l, self.max_len)
        return self.byte_emb(byte_ids[:, :l]) + self.byte_pos(torch.arange(l, device=byte_ids.device)).unsqueeze(0)

    def forward(self, batch: Dict[str, torch.Tensor], methods: List[str], paths: List[str]) -> torch.Tensor:
        byte_ids = batch["byte_ids"]
        bsz = byte_ids.size(0)
        seq = self._byte_sequence(byte_ids)
        byte_vec = self.byte_encoder(byte_ids)
        packet_vec = self.packet_encoder(seq)

        pf = torch.tanh(self.patch_conv(batch["flow_image"])).flatten(1)
        patch_vec = torch.tanh(self.patch_proj(pf))

        method_hot = torch.zeros(bsz, 1, device=byte_ids.device)
        for i, m in enumerate(methods):
            if m.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
                method_hot[i, 0] = 1.0
        path_depth = torch.tensor(
            [min(1.0, paths[i].count("/") / 12.0) for i in range(bsz)],
            dtype=torch.float32,
            device=byte_ids.device,
        ).unsqueeze(1)
        ddos_hint = torch.clamp(batch["recent"].unsqueeze(1) / 500.0, 0.0, 1.0)
        flow_in = torch.cat([patch_vec, batch["freq"], method_hot, path_depth, batch["status"].unsqueeze(1), ddos_hint], dim=1)
        flow_vec = self.flow_mlp(flow_in)
        z = self.fusion(torch.cat([byte_vec, packet_vec, flow_vec], dim=-1))
        return self.classifier(z)

    def latent(self, batch: Dict[str, torch.Tensor], methods: List[str], paths: List[str]) -> torch.Tensor:
        """Representation used for contrastive learning (Phase B)."""
        byte_ids = batch["byte_ids"]
        seq = self._byte_sequence(byte_ids)
        byte_vec = self.byte_encoder(byte_ids)
        packet_vec = self.packet_encoder(seq)
        pf = torch.tanh(self.patch_conv(batch["flow_image"])).flatten(1)
        patch_vec = torch.tanh(self.patch_proj(pf))
        bsz = byte_ids.size(0)
        method_hot = torch.zeros(bsz, 1, device=byte_ids.device)
        for i, m in enumerate(methods):
            if m.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
                method_hot[i, 0] = 1.0
        path_depth = torch.tensor(
            [min(1.0, paths[i].count("/") / 12.0) for i in range(bsz)],
            dtype=torch.float32,
            device=byte_ids.device,
        ).unsqueeze(1)
        ddos_hint = torch.clamp(batch["recent"].unsqueeze(1) / 500.0, 0.0, 1.0)
        flow_in = torch.cat([patch_vec, batch["freq"], method_hot, path_depth, batch["status"].unsqueeze(1), ddos_hint], dim=1)
        flow_vec = self.flow_mlp(flow_in)
        z = self.fusion(torch.cat([byte_vec, packet_vec, flow_vec], dim=-1))
        return z

    def forward_contrastive(self, z1: torch.Tensor, z2: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        p1 = F.normalize(self.proj_head(z1), dim=-1)
        p2 = F.normalize(self.proj_head(z2), dim=-1)
        return p1, p2


def build_batch_tensorized(pres: List[Dict[str, Any]], device: torch.device) -> Tuple[Dict[str, torch.Tensor], List[str], List[str]]:
    max_len = 512
    rows = len(pres)
    byte_ids = torch.zeros(rows, max_len, dtype=torch.long, device=device)
    for i, pre in enumerate(pres):
        for j, v in enumerate(pre["byte_seq"][:max_len]):
            byte_ids[i, j] = min(255, int(v)) + 1
    imgs = torch.tensor(np.stack([p["flow_image"] for p in pres], axis=0), dtype=torch.float32, device=device)
    freq = torch.tensor(np.stack([p["freq"] for p in pres], axis=0), dtype=torch.float32, device=device)
    status = torch.tensor([p["status_code"] / 600.0 for p in pres], dtype=torch.float32, device=device)
    recent = torch.tensor([float(p["recent_request_count_1m"]) for p in pres], dtype=torch.float32, device=device)
    methods = [p["method"] for p in pres]
    paths = [p["path"] for p in pres]
    return {"byte_ids": byte_ids, "flow_image": imgs, "freq": freq, "status": status, "recent": recent}, methods, paths
