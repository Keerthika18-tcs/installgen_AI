import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

class VerificationReport(Base):
    __tablename__ = "verification_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("deployment_sessions.id"), nullable=False)
    passed = Column(Boolean, default=True, nullable=False)
    score = Column(Integer, default=100, nullable=False) # score out of 100 representing health/success checks
    summary = Column(Text, nullable=True)
    details = Column(Text, nullable=True) # JSON serialized detailed verification output
    pdf_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("DeploymentSession", back_populates="reports")
