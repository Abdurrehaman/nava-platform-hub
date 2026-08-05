"""
app.py — Main FastAPI REST API Server for Nava GPU SRE Sentinel
Provides RESTful endpoints for GPU fleet monitoring, DCGM hardware telemetry,
kernel Xid error logging, and self-healing runbook execution.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import json

from backend.database import init_db, SessionLocal, GPUNode, DCGMMetric, XidLog, RemediationAudit
from backend.dcgm_emulator import seed_initial_data, generate_telemetry_tick
from backend.remediation_engine import execute_remediation_runbook

app = FastAPI(
    title="Nava GPU SRE Sentinel API",
    description="Autonomous GPU Fleet Observability & Self-Healing Remediation REST API",
    version="1.0.0"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    seed_initial_data()
    generate_telemetry_tick()

@app.get("/")
def read_root():
    return {
        "service": "Nava GPU SRE Sentinel API",
        "status": "ONLINE",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "HEALTHY", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/nodes")
def get_nodes():
    db = SessionLocal()
    try:
        nodes = db.query(GPUNode).all()
        return [
            {
                "id": n.id,
                "name": n.name,
                "gpu_model": n.gpu_model,
                "status": n.status,
                "vram_total_gb": n.vram_total_gb,
                "power_max_w": n.power_max_w,
                "k8s_cordoned": bool(n.k8s_cordoned),
                "updated_at": n.updated_at.isoformat()
            }
            for n in nodes
        ]
    finally:
        db.close()

@app.get("/api/v1/telemetry/dcgm")
def get_dcgm_telemetry():
    # Trigger a fresh telemetry tick
    generate_telemetry_tick()
    db = SessionLocal()
    try:
        latest_metrics = (
            db.query(DCGMMetric)
            .order_by(DCGMMetric.timestamp.desc())
            .limit(10)
            .all()
        )
        return [
            {
                "id": m.id,
                "node_id": m.node_id,
                "sm_occupancy_pct": m.sm_occupancy_pct,
                "power_draw_w": m.power_draw_w,
                "temperature_c": m.temperature_c,
                "pcie_bandwidth_gbs": m.pcie_bandwidth_gbs,
                "vram_used_gb": m.vram_used_gb,
                "timestamp": m.timestamp.isoformat()
            }
            for m in latest_metrics
        ]
    finally:
        db.close()

@app.get("/api/v1/xid/logs")
def get_xid_logs():
    db = SessionLocal()
    try:
        logs = db.query(XidLog).order_by(XidLog.timestamp.desc()).limit(20).all()
        return [
            {
                "id": l.id,
                "node_id": l.node_id,
                "xid_code": l.xid_code,
                "severity": l.severity,
                "description": l.description,
                "action_taken": l.action_taken,
                "resolved": bool(l.resolved),
                "timestamp": l.timestamp.isoformat()
            }
            for l in logs
        ]
    finally:
        db.close()

@app.post("/api/v1/remediate/{node_id}")
def remediate_node(node_id: str, trigger_reason: str = "Xid 79 Hardware Error"):
    res = execute_remediation_runbook(node_id, trigger_reason)
    if res["status"] == "ERROR":
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.get("/api/v1/audits")
def get_remediation_audits():
    db = SessionLocal()
    try:
        audits = db.query(RemediationAudit).order_by(RemediationAudit.timestamp.desc()).all()
        return [
            {
                "id": a.id,
                "node_id": a.node_id,
                "trigger_reason": a.trigger_reason,
                "execution_steps": json.loads(a.execution_steps),
                "status": a.status,
                "timestamp": a.timestamp.isoformat()
            }
            for a in audits
        ]
    finally:
        db.close()
