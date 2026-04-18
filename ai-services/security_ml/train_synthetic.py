"""
Offline trainer: synthetic labeled + unlabeled traffic to prime Phase B (contrastive)
and Phase C (classification). Run once to emit artifacts/model.pt.

  python -m security_ml.train_synthetic
"""
from __future__ import annotations

import os
import random
from typing import Dict, List

import torch
import torch.nn.functional as F

from . import preprocess
from .contrastive import info_nce_loss
from .model import SecurityFlowNet, build_batch_tensorized


def _sample(kind: str) -> Dict:
    base_headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "accept": "application/json"}
    if kind == "sqli":
        return {
            "method": "GET",
            "path": "/api/users",
            "headers": base_headers,
            "payload": "id=1' OR '1'='1",
            "sessionId": "s1",
            "userId": None,
            "clientIp": "198.51.100.1",
            "statusCode": 200,
            "recentRequestCount1m": 4,
        }
    if kind == "xss":
        return {
            "method": "POST",
            "path": "/api/incidents",
            "headers": base_headers,
            "payload": '{"title": "<script>alert(1)</script>"}',
            "sessionId": "s2",
            "userId": "u1",
            "clientIp": "198.51.100.2",
            "statusCode": 201,
            "recentRequestCount1m": 2,
        }
    if kind == "bot":
        return {
            "method": "GET",
            "path": "/api/health",
            "headers": {"user-agent": "curl/8.0"},
            "payload": "",
            "sessionId": "",
            "userId": None,
            "clientIp": "203.0.113.9",
            "statusCode": 200,
            "recentRequestCount1m": 120,
        }
    if kind == "ddos":
        return {
            "method": "GET",
            "path": "/api/zones",
            "headers": base_headers,
            "payload": "",
            "sessionId": "s9",
            "userId": None,
            "clientIp": "203.0.113.10",
            "statusCode": 200,
            "recentRequestCount1m": 900,
        }
    return {
        "method": "GET",
        "path": "/api/zones",
        "headers": base_headers,
        "payload": "",
        "sessionId": "s3",
        "userId": "u2",
        "clientIp": "198.51.100.3",
        "statusCode": 200,
        "recentRequestCount1m": 1,
    }


def label_for(kind: str) -> int:
    if kind in {"sqli", "xss", "bot"}:
        return 2
    if kind == "ddos":
        return 1
    return 0


def augment(sample: Dict, rng: random.Random) -> Dict:
    s = dict(sample)
    if rng.random() < 0.3:
        s["payload"] = (s.get("payload") or "")[: max(1, int(len(s.get("payload") or "") * rng.uniform(0.4, 1.0)))]
    s["recentRequestCount1m"] = max(0, int(s.get("recentRequestCount1m", 0)) + rng.randint(-2, 2))
    return s


def main() -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SecurityFlowNet(d_model=128, max_len=512).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)

    kinds = ["normal", "normal", "sqli", "xss", "bot", "ddos"] * 40
    rng_py = random.Random(42)

    for step in range(180):
        model.train()
        opt.zero_grad()
        batch_kinds = [rng_py.choice(kinds) for _ in range(16)]
        samples = [_sample(k) for k in batch_kinds]
        pres = [preprocess.preprocess_http_sample(s) for s in samples]
        batch, methods, paths = build_batch_tensorized(pres, device)
        logits = model(batch, methods, paths)
        y = torch.tensor([label_for(k) for k in batch_kinds], device=device)
        ce = F.cross_entropy(logits, y)

        # Phase B contrastive on two augmented views
        s1 = [augment(s, rng_py) for s in samples]
        s2 = [augment(s, rng_py) for s in samples]
        p1 = [preprocess.preprocess_http_sample(x) for x in s1]
        p2 = [preprocess.preprocess_http_sample(x) for x in s2]
        b1, m1, pa1 = build_batch_tensorized(p1, device)
        b2, m2, pa2 = build_batch_tensorized(p2, device)
        z1 = model.latent(b1, m1, pa1)
        z2 = model.latent(b2, m2, pa2)
        p1p, p2p = model.forward_contrastive(z1, z2)
        ctr = info_nce_loss(p1p, p2p, temperature=0.12)

        loss = ce + 0.35 * ctr
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 2.0)
        opt.step()

        if step % 30 == 0:
            print(f"step {step} loss={loss.item():.4f} ce={ce.item():.4f} ctr={ctr.item():.4f}")

    out_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, "model.pt")
    torch.save(model.state_dict(), path)
    print("wrote", path)


if __name__ == "__main__":
    main()
