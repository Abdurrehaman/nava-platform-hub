"""
dcgm_emulator.py — NVIDIA DCGM Hardware Telemetry & Xid Error Stream Generator
Simulates real bare-metal GPU hardware metrics (SM occupancy, PCIe bandwidth, Power, Temp)
and injects realistic Linux kernel Xid hardware error events.
"""

import random
from datetime import datetime
from backend.database import SessionLocal, GPUNode, DCGMMetric, XidLog

GPU_CATALOG = [
    {"id": "gpu-node-01", "name": "GPU Node 01", "gpu_model": "NVIDIA H100 SXM 80GB", "vram_total_gb": 80.0, "power_max_w": 700},
    {"id": "gpu-node-02", "name": "GPU Node 02", "gpu_model": "NVIDIA H100 SXM 80GB", "vram_total_gb": 80.0, "power_max_w": 700},
    {"id": "gpu-node-03", "name": "GPU Node 03", "gpu_model": "NVIDIA B200 SXM 192GB", "vram_total_gb": 192.0, "power_max_w": 1000},
    {"id": "gpu-node-04", "name": "GPU Node 04", "gpu_model": "NVIDIA A100 SXM 80GB", "vram_total_gb": 80.0, "power_max_w": 400},
    {"id": "gpu-node-05", "name": "GPU Node 05", "gpu_model": "NVIDIA H100 NVL 94GB", "vram_total_gb": 94.0, "power_max_w": 400},
    {"id": "gpu-node-06", "name": "GPU Node 06", "gpu_model": "NVIDIA L40S 48GB", "vram_total_gb": 48.0, "power_max_w": 350},
]

XID_ERROR_TYPES = [
    {"code": "Xid 79", "severity": "CRITICAL", "desc": "GPU fallen off bus — PCIe link reset failure"},
    {"code": "Xid 62", "severity": "WARNING", "desc": "Page Retirement — Dynamic uncorrectable memory page isolation"},
    {"code": "Thermal", "severity": "WARNING", "desc": "GPU Temp reached 84°C — Dynamic thermal throttling engaged"},
    {"code": "Xid 31", "severity": "INFO", "desc": "Memory Exception — Single-bit ECC error corrected"},
]

def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Nodes if empty
        if db.query(GPUNode).count() == 0:
            for g in GPU_CATALOG:
                node = GPUNode(
                    id=g["id"],
                    name=g["name"],
                    gpu_model=g["gpu_model"],
                    status="healthy",
                    vram_total_gb=g["vram_total_gb"],
                    power_max_w=g["power_max_w"],
                    k8s_cordoned=0
                )
                db.add(node)
            db.commit()

        # Seed initial Xid Logs if empty
        if db.query(XidLog).count() == 0:
            sample_logs = [
                XidLog(node_id="gpu-node-06", xid_code="Xid 79", severity="CRITICAL", description="GPU fallen off bus — PCIe link reset failure", action_taken="Pending Remediation", resolved=0),
                XidLog(node_id="gpu-node-03", xid_code="Xid 62", severity="WARNING", description="Page Retirement — Dynamic memory page isolation", action_taken="Page Retired", resolved=1),
                XidLog(node_id="gpu-node-04", xid_code="Thermal", severity="WARNING", description="GPU Temp reached 84°C — Fan speed 100%", action_taken="Tuned Cooling", resolved=1),
            ]
            for log in sample_logs:
                db.add(log)
            db.commit()

    finally:
        db.close()

def generate_telemetry_tick():
    db = SessionLocal()
    try:
        nodes = db.query(GPUNode).all()
        for node in nodes:
            if node.status == "isolated":
                continue # Isolated nodes don't produce active compute metrics

            sm_occ = round(random.uniform(70.0, 98.0), 1)
            power = round(random.uniform(node.power_max_w * 0.5, node.power_max_w * 0.88), 1)
            temp = round(random.uniform(55.0, 82.0), 1)
            pcie_bw = round(random.uniform(32.0, 64.0), 1)
            vram_used = round(random.uniform(node.vram_total_gb * 0.4, node.vram_total_gb * 0.9), 1)

            metric = DCGMMetric(
                node_id=node.id,
                sm_occupancy_pct=sm_occ,
                power_draw_w=power,
                temperature_c=temp,
                pcie_bandwidth_gbs=pcie_bw,
                vram_used_gb=vram_used,
                timestamp=datetime.utcnow()
            )
            db.add(metric)

        db.commit()
    finally:
        db.close()
