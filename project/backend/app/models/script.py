import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

class GeneratedScript(Base):
    __tablename__ = "generated_scripts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("deployment_sessions.id"), nullable=False)
    filename = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(30), nullable=False) # bash, powershell, python, yaml (ansible)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("DeploymentSession", back_populates="scripts")
