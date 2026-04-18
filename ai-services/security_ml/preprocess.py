"""
Phase A — Pre-processing: web traffic -> structured security flows -> feature tensors.

Outputs representations for Phase A patchify + embedding (handled in model forward).
"""
from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import numpy as np

# --- Signature helpers (complement neural scores; stable production signals) ---

SQLI_PATTERNS = re.compile(
    r"(\bunion\b\s+\bselect\b)|(\bor\b\s+1\s*=\s*1)|(--)|(/\*)|(\bxp_cmdshell\b)|(\bexec\b\s*\()",
    re.I,
)
XSS_PATTERNS = re.compile(
    r"(<script)|(\bonerror\s*=)|(\bonload\s*=)|(javascript:)|(%3cscript)",
    re.I,
)
BOT_UA = re.compile(r"(bot|crawler|spider|scraper|curl|wget|python-requests|aiohttp|go-http)", re.I)


@dataclass
class SecurityFlowSample:
    """Single HTTP observation within a session context."""

    request_id: str
    method: str
    path: str
    headers: Dict[str, str]
    payload: str
    session_id: str
    user_id: str | None
    client_ip: str
    status_code: int
    recent_request_count_1m: int


def _truncate(s: str, n: int) -> str:
    if len(s) <= n:
        return s
    return s[:n]


def flow_to_bytes(text: str, max_len: int = 512) -> List[int]:
    """Byte-level token ids in [0, 255]; position semantics handled in model."""
    b = _truncate(text, max_len).encode("utf-8", errors="ignore")
    return list(b[:max_len]) or [0]


def headers_blob(headers: Dict[str, str]) -> str:
    parts: List[str] = []
    for k in sorted(headers.keys()):
        lk = k.lower()
        if lk in {"authorization", "cookie", "set-cookie"}:
            continue
        parts.append(f"{k}={headers[k]}")
    return "|".join(parts)


def build_security_flow_image(byte_seq: List[int], grid: int = 32) -> np.ndarray:
    """
    Convert byte stream into a 2D 'security flow image' (Phase A output): shape (1, grid, grid).
    Pads/ wraps bytes row-major; values normalized to [0, 1].
    """
    arr = np.zeros((grid * grid,), dtype=np.float32)
    if not byte_seq:
        return arr.reshape(1, grid, grid)
    for i, v in enumerate(byte_seq[: grid * grid]):
        arr[i] = v / 255.0
    return arr.reshape(1, grid, grid)


def token_frequency_features(path: str, payload: str) -> np.ndarray:
    """Scalar-style frequency / pattern stats (feeds flow-level encoder)."""
    p = (path + " " + payload).lower()
    tokens = re.findall(r"[a-z0-9_/\\.-]+", p)
    uniq = len(set(tokens))
    tot = max(1, len(tokens))
    sql_hits = float(len(SQLI_PATTERNS.findall(payload)))
    xss_hits = float(len(XSS_PATTERNS.findall(payload)))
    return np.array(
        [
            min(1.0, math.log1p(len(payload)) / 10.0),
            min(1.0, uniq / tot),
            min(1.0, sql_hits / 3.0),
            min(1.0, xss_hits / 3.0),
            1.0 if BOT_UA.search(payload) else 0.0,
        ],
        dtype=np.float32,
    )


def preprocess_http_sample(sample: Dict[str, Any]) -> Dict[str, Any]:
    """
    Phase A pipeline for one JSON traffic record from the API gateway.

    Steps:
    1) Structured security flow (method/path/headers/payload/session)
    2) Split: metadata (headers blob) vs payload body
    3) Feature matrices: byte sequence, token-frequency vector
    4) Security flow image tensor
    """
    headers = {str(k): str(v) for k, v in (sample.get("headers") or {}).items()}
    method = str(sample.get("method") or "GET").upper()
    path = str(sample.get("path") or "/")
    payload = str(sample.get("payload") or "")
    meta = headers_blob(headers)
    combined = f"{method}\n{path}\n{meta}\n{payload}"
    byte_seq = flow_to_bytes(combined, max_len=512)
    flow_img = build_security_flow_image(byte_seq, grid=32)
    freq = token_frequency_features(path, payload)
    cache_key = hashlib.sha256(combined.encode("utf-8", errors="ignore")).hexdigest()[:24]
    return {
        "byte_seq": byte_seq,
        "header_blob": meta,
        "payload": payload,
        "flow_image": flow_img,
        "freq": freq,
        "cache_key": cache_key,
        "method": method,
        "path": path,
        "recent_request_count_1m": int(sample.get("recentRequestCount1m") or 0),
        "status_code": int(sample.get("statusCode") or 0),
    }
