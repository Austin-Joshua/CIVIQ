from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
from datetime import datetime
import numpy as np
import os

# Application setup
app = FastAPI(
    title="CIVIQ ML Intelligence Backend",
    description="Decoupled Python microservice routing for heavy ML inference.",
    version="1.0.0"
)

# ==========================================================
# 1. Waste Generation Forecast Service (solid-waste-prediction)
# ==========================================================
class ForecastRequest(BaseModel):
    zone_ids: List[str]
    start_date: str
    end_date: str
    historical_data: Optional[List[Dict[str, Any]]] = None

@app.post("/api/forecast")
async def forecast_waste(data: ForecastRequest):
    # Mock inference using statistical baseline
    predictions = {}
    for zone in data.zone_ids:
        # Generate random upward-trending polynomial curve logic placeholder
        predictions[zone] = {
            "predicted_volume_kg": np.random.randint(400, 1200),
            "confidence_interval": [0.85, 0.94],
            "projected_peak_time": "14:00"
        }
    return {
        "status": "success",
        "model": "solid-waste-prediction-v1",
        "timestamp": datetime.now().isoformat(),
        "data": predictions
    }

# ==========================================================
# 2. Spatial Hotspot Analysis Service (PyEhsa)
# ==========================================================
class HotspotRequest(BaseModel):
    geospatial_coordinates: List[List[float]]
    time_window_hours: int

@app.post("/api/hotspots")
async def analyze_hotspots(data: HotspotRequest):
    # Placeholder for PyEhsa implementation
    return {
        "status": "success",
        "model": "pyehsa-v2",
        "hotspots": [
            {"lat": 40.7128, "lng": -74.0060, "intensity": "CRITICAL", "trend": "emerging"},
            {"lat": 40.7306, "lng": -73.9352, "intensity": "HIGH", "trend": "stable"}
        ]
    }

# ==========================================================
# 3. Anomaly Detection Toolkit (Isolation Forest / OSAD)
# ==========================================================
class AnomalyRequest(BaseModel):
    time_series_data: List[float]
    sensor_ids: List[str]

@app.post("/api/anomalies")
async def detect_anomalies(data: AnomalyRequest):
    # Simulate pyOD Isolation Forest return
    return {
        "status": "success",
        "model": "anomaly-detection-toolkit-iforest",
        "events": [
            {"sensor_id": data.sensor_ids[0] if data.sensor_ids else "S-01", "anomaly_score": 0.92, "severity": "HIGH", "timestamp": datetime.now().isoformat()}
        ]
    }

# ==========================================================
# 4. Service Demand Forecasting (Taxi-Demand adapted)
# ==========================================================
class DemandRequest(BaseModel):
    zone_ids: List[str]
    external_factors: Optional[Dict[str, float]] = None

@app.post("/api/demand")
async def forecast_demand(data: DemandRequest):
    return {
        "status": "success",
        "model": "service-demand-lstm",
        "routing_priority": [
            {"zone": "Zone C", "demand_score": 0.88, "suggested_fleet_allocation": 4},
            {"zone": "Zone A", "demand_score": 0.45, "suggested_fleet_allocation": 2}
        ]
    }

# ==========================================================
# 5. Waste Classification Service (TrashNet Vision)
# ==========================================================
@app.post("/api/classify")
async def classify_waste(file: UploadFile = File(...)):
    # Mocking CNN TrashNet inference output based on file parsing
    categories = ["paper", "cardboard", "plastic", "metal", "trash", "glass"]
    selected = np.random.choice(categories)
    confidence = float(np.random.uniform(0.75, 0.99))
    
    return {
        "status": "success",
        "model": "trashnet-resnet50",
        "filename": file.filename,
        "classification": {
            "material_category": selected,
            "confidence_score": round(confidence, 3)
        }
    }

# ==========================================================
# 6. Route Optimization Service (Google OR-Tools VRP)
# ==========================================================
class VRPRequest(BaseModel):
    depot_location: str
    pickup_nodes: List[str]
    num_vehicles: int
    vehicle_capacities: List[int]

@app.post("/api/optimize-routes")
async def optimize_routes(data: VRPRequest):
    # Simulate OR-Tools VRP solver pathing
    return {
        "status": "success",
        "model": "google-or-tools-vrp",
        "solver_status": "OPTIMAL",
        "routes": [
            {"vehicle": 1, "path": [data.depot_location, data.pickup_nodes[0] if data.pickup_nodes else "Node1", data.depot_location], "estimated_time_mins": 45},
            {"vehicle": 2, "path": [data.depot_location, data.pickup_nodes[1] if len(data.pickup_nodes)>1 else "Node2", data.depot_location], "estimated_time_mins": 38}
        ],
        "total_distance_km": 24.5
    }

# ==========================================================
# 7. Web Security ML (Phases A/B/C — hierarchical encoder + realtime classify)
# ==========================================================
try:
    from security_ml.service import get_runtime as _get_security_ml_runtime

    _SECURITY_ML_AVAILABLE = True
    _SECURITY_ML_IMPORT_ERROR = ""
except Exception as exc:  # pragma: no cover
    _SECURITY_ML_AVAILABLE = False
    _SECURITY_ML_IMPORT_ERROR = str(exc)


class SecurityTrafficSample(BaseModel):
    requestId: Optional[str] = None
    method: str = "GET"
    path: str = "/"
    headers: Dict[str, str] = Field(default_factory=dict)
    payload: str = ""
    sessionId: str = ""
    userId: Optional[str] = None
    clientIp: str = ""
    statusCode: int = 200
    recentRequestCount1m: int = 0


class SecurityClassifyBatchRequest(BaseModel):
    items: List[SecurityTrafficSample]


@app.get("/api/security/ml/health")
async def security_ml_health():
    if not _SECURITY_ML_AVAILABLE:
        return {
            "status": "degraded",
            "securityMl": False,
            "error": _SECURITY_ML_IMPORT_ERROR,
            "timestamp": datetime.now().isoformat(),
        }
    rt = _get_security_ml_runtime()
    dev = str(rt.device) if rt.device is not None else "cpu"
    return {
        "status": "ok",
        "securityMl": True,
        "backend": rt.backend,
        "device": dev,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/security/ml/classify")
async def security_ml_classify(body: SecurityClassifyBatchRequest):
    if not _SECURITY_ML_AVAILABLE:
        raise HTTPException(status_code=503, detail="security_ml unavailable")
    if not body.items:
        raise HTTPException(status_code=400, detail="items required")
    if len(body.items) > 128:
        raise HTTPException(status_code=400, detail="max batch size 128")
    samples: List[Dict[str, Any]] = []
    for it in body.items:
        samples.append(
            {
                "requestId": it.requestId,
                "method": it.method,
                "path": it.path,
                "headers": it.headers,
                "payload": it.payload,
                "sessionId": it.sessionId,
                "userId": it.userId,
                "clientIp": it.clientIp,
                "statusCode": it.statusCode,
                "recentRequestCount1m": it.recentRequestCount1m,
            }
        )
    rt = _get_security_ml_runtime()
    results = rt.classify_batch(samples)
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "results": results,
    }


@app.post("/api/security/ml/pretrain-step")
async def security_ml_pretrain_step(token: str = Query(..., min_length=8)):
    """
    Phase B demo endpoint (optional): runs a single contrastive + CE step on synthetic batch.
    Guarded by SEC_ML_ADMIN_TOKEN — disabled when env unset.
    """
    secret = os.getenv("SEC_ML_ADMIN_TOKEN", "")
    if not secret or token != secret:
        raise HTTPException(status_code=404, detail="not found")
    if not _SECURITY_ML_AVAILABLE:
        raise HTTPException(status_code=503, detail="security_ml unavailable")
    rt0 = _get_security_ml_runtime()
    if rt0.backend != "torch" or rt0.model is None:
        raise HTTPException(status_code=503, detail="pretrain requires PyTorch (see requirements-ml.txt)")
    import torch
    from security_ml.train_synthetic import _sample, label_for, augment  # type: ignore
    import random
    from security_ml import preprocess
    from security_ml.model import SecurityFlowNet, build_batch_tensorized
    from security_ml.contrastive import info_nce_loss
    import torch.nn.functional as F

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SecurityFlowNet(d_model=128, max_len=512).to(device)
    rt = rt0
    model.load_state_dict(rt.model.state_dict())
    model.train()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-4)
    rng_py = random.Random(int(datetime.now().timestamp()) % 1_000_000)
    kinds = ["normal", "sqli", "xss", "bot", "ddos"]
    batch_kinds = [rng_py.choice(kinds) for _ in range(8)]
    samples = [_sample(k) for k in batch_kinds]
    pres = [preprocess.preprocess_http_sample(s) for s in samples]
    batch, methods, paths = build_batch_tensorized(pres, device)
    logits = model(batch, methods, paths)
    y = torch.tensor([label_for(k) for k in batch_kinds], device=device)
    ce = F.cross_entropy(logits, y)
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
    opt.zero_grad()
    loss.backward()
    opt.step()
    rt.model.load_state_dict(model.state_dict())
    rt.model.eval()
    return {"status": "ok", "loss": float(loss.item()), "ce": float(ce.item()), "contrastive": float(ctr.item())}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
