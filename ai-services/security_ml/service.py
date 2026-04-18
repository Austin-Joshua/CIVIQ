"""
Runtime ML service: batching, LRU cache, Phase C inference + optional Phase B training hook.
Falls back to interpretable heuristics when PyTorch is not installed (keeps API online).
"""
from __future__ import annotations

import os
import threading
import time
from collections import OrderedDict
from typing import Any, Dict, List, Tuple

import numpy as np

from . import preprocess

try:
    import torch

    from .model import SecurityFlowNet, build_batch_tensorized

    _HAS_TORCH = True
except ImportError:  # pragma: no cover
    torch = None  # type: ignore
    SecurityFlowNet = None  # type: ignore
    build_batch_tensorized = None  # type: ignore
    _HAS_TORCH = False

LABELS = ("normal", "suspicious", "malicious")


def _signals(sample: Dict[str, Any]) -> Dict[str, float]:
    payload = str(sample.get("payload") or "")
    headers = {str(k).lower(): str(v) for k, v in (sample.get("headers") or {}).items()}
    ua = headers.get("user-agent", "") + headers.get("useragent", "")
    return {
        "sqli": float(min(1.0, len(preprocess.SQLI_PATTERNS.findall(payload)) / 2.0)),
        "xss": float(min(1.0, len(preprocess.XSS_PATTERNS.findall(payload)) / 2.0)),
        "bot": float(1.0 if preprocess.BOT_UA.search(ua) else 0.0),
        "ddos": float(min(1.0, float(sample.get("recentRequestCount1m") or 0) / 400.0)),
        "behavior": float(min(1.0, abs(int(sample.get("statusCode") or 200) - 200) / 400.0)),
    }


def _heuristic_probs(sample: Dict[str, Any]) -> Tuple[np.ndarray, str]:
    """Phase C-style 3-way distribution without neural weights (degraded mode)."""
    sig = _signals(sample)
    p = np.array([0.82, 0.1, 0.08], dtype=np.float32)
    atk = max(sig["sqli"], sig["xss"], sig["bot"])
    if atk > 0.25:
        p = np.array([0.08, 0.12, 0.80], dtype=np.float32)
    elif sig["ddos"] > 0.45 or sig["behavior"] > 0.55:
        p = np.array([0.15, 0.72, 0.13], dtype=np.float32)
    elif atk > 0.08 or sig["ddos"] > 0.2:
        p = np.array([0.35, 0.5, 0.15], dtype=np.float32)
    p /= p.sum()
    idx = int(np.argmax(p))
    return p, LABELS[idx]


class SecurityMLRuntime:
    def __init__(self, artifact_path: str | None = None, device: str | None = None):
        self._has_torch = _HAS_TORCH
        self.device = None
        self.model = None
        if self._has_torch:
            self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
            self.model = SecurityFlowNet(d_model=128, max_len=512).to(self.device)
            self.model.eval()
            path = artifact_path or os.path.join(os.path.dirname(__file__), "artifacts", "model.pt")
            if os.path.isfile(path):
                state = torch.load(path, map_location=self.device)
                self.model.load_state_dict(state)
        self._lock = threading.Lock()
        self._cache: "OrderedDict[str, Tuple[float, Dict[str, Any]]]" = OrderedDict()
        self.cache_ttl_sec = float(os.getenv("SECURITY_ML_CACHE_TTL_SEC", "30"))
        self.cache_max = int(os.getenv("SECURITY_ML_CACHE_MAX", "4096"))

    @property
    def backend(self) -> str:
        return "torch" if self._has_torch else "heuristic"

    def _cache_get(self, key: str) -> Dict[str, Any] | None:
        now = time.time()
        with self._lock:
            item = self._cache.get(key)
            if not item:
                return None
            ts, val = item
            if now - ts > self.cache_ttl_sec:
                del self._cache[key]
                return None
            self._cache.move_to_end(key)
            return val

    def _cache_put(self, key: str, val: Dict[str, Any]) -> None:
        now = time.time()
        with self._lock:
            self._cache[key] = (now, val)
            self._cache.move_to_end(key)
            while len(self._cache) > self.cache_max:
                self._cache.popitem(last=False)

    def classify_batch(self, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self._has_torch or self.model is None:
            return [self._one_heuristic(s) for s in samples]
        return self._classify_batch_torch(samples)

    def _one_heuristic(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        pre = preprocess.preprocess_http_sample(sample)
        ck = pre["cache_key"]
        cached = self._cache_get(ck)
        if cached:
            return cached
        p, label = _heuristic_probs(sample)
        result = {
            "label": label,
            "confidence": float(p[list(LABELS).index(label)]),
            "probabilities": {LABELS[k]: float(p[k]) for k in range(3)},
            "attackSignals": _signals(sample),
            "phase": "C",
            "model": "heuristic-security-fallback-v1",
        }
        self._cache_put(ck, result)
        return result

    def _classify_batch_torch(self, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pres = [preprocess.preprocess_http_sample(s) for s in samples]
        out: List[Dict[str, Any]] = []
        pending_idx: List[int] = []
        pending_pre: List[Dict[str, Any]] = []
        for i, pre in enumerate(pres):
            ck = pre["cache_key"]
            cached = self._cache_get(ck)
            if cached:
                out.append(cached)
            else:
                out.append({})
                pending_idx.append(i)
                pending_pre.append(pre)
        if pending_pre:
            with torch.inference_mode():
                batch, methods, paths = build_batch_tensorized(pending_pre, self.device)
                logits = self.model(batch, methods, paths)
                probs = torch.softmax(logits, dim=-1).cpu().numpy()
            for j, pre in enumerate(pending_pre):
                p = probs[j]
                sig = self._signature_boost(samples[pending_idx[j]], p)
                idx2 = int(np.argmax(sig))
                result = {
                    "label": LABELS[idx2],
                    "confidence": float(sig[idx2]),
                    "probabilities": {LABELS[k]: float(sig[k]) for k in range(3)},
                    "attackSignals": _signals(samples[pending_idx[j]]),
                    "phase": "C",
                    "model": "hierarchical-security-flow-v1",
                }
                self._cache_put(pre["cache_key"], result)
                out[pending_idx[j]] = result
        return out

    def _signature_boost(self, sample: Dict[str, Any], neural_probs: np.ndarray) -> np.ndarray:
        sig = _signals(sample)
        boost = np.array([0.0, 0.0, 0.0], dtype=np.float32)
        atk = max(sig["sqli"], sig["xss"], sig["bot"])
        if atk > 0.2:
            boost[2] += 0.55 * atk
        if sig["ddos"] > 0.35 or sig["behavior"] > 0.6:
            boost[1] += 0.35
        if boost.sum() > 0:
            mix = 0.65 * neural_probs + 0.35 * boost
            mix = np.clip(mix, 1e-6, 1.0)
            mix /= mix.sum()
            return mix
        return neural_probs


_RUNTIME: SecurityMLRuntime | None = None


def get_runtime() -> SecurityMLRuntime:
    global _RUNTIME
    if _RUNTIME is None:
        _RUNTIME = SecurityMLRuntime()
    return _RUNTIME
