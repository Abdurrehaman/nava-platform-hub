"""
database.py — SQLite / SQLAlchemy Database Layer for Nava GPU SRE Sentinel
Stores Fleet Nodes, DCGM Hardware Telemetry, Xid Kernel Error Logs, and Remediation Audit Trails.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./gpu_sre_sentinel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class GPUNode(Base):
    __tablename__ = "gpu_nodes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gpu_model = Column(String, nullable=False) # e.g. "NVIDIA H100 SXM 80GB"
    status = Column(String, default="healthy")  # healthy, warning, isolated, degraded
    vram_total_gb = Column(Float, default=80.0)
    power_max_w = Column(Integer, default=700)
    k8s_cordoned = Column(Integer, default=0)    # 0 = false, 1 = true
    updated_at = Column(DateTime, default=datetime.utcnow)

class DCGMMetric(Base):
    __tablename__ = "dcgm_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String, ForeignKey("gpu_nodes.id"), index=True)
    sm_occupancy_pct = Column(Float, nullable=False)
    power_draw_w = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    pcie_bandwidth_gbs = Column(Float, nullable=False)
    vram_used_gb = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class XidLog(Base):
    __tablename__ = "xid_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String, ForeignKey("gpu_nodes.id"), index=True)
    xid_code = Column(String, nullable=False) # e.g. "Xid 79", "Xid 62", "Thermal"
    severity = Column(String, nullable=False) # CRITICAL, WARNING, INFO
    description = Column(Text, nullable=False)
    action_taken = Column(String, default="Pending Remediation")
    resolved = Column(Integer, default=0)      # 0 = unresolved, 1 = resolved
    timestamp = Column(DateTime, default=datetime.utcnow)

class RemediationAudit(Base):
    __tablename__ = "remediation_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String, nullable=False)
    trigger_reason = Column(String, nullable=False)
    execution_steps = Column(Text, nullable=False) # JSON list of steps executed
    status = Column(String, default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
