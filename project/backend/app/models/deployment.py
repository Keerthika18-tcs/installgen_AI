import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship

from app.models.base import Base

class DeploymentSession(Base):
    __tablename__ = "deployment_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    target_os = Column(String(50), nullable=False)
    requirements = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False) # pending, planning, generating, auditing, verifying, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent_logs = relationship("AgentLog", back_populates="session", cascade="all, delete-orphan")
    scripts = relationship("GeneratedScript", back_populates="session", cascade="all, delete-orphan")
    reports = relationship("VerificationReport", back_populates="session", cascade="all, delete-orphan")
