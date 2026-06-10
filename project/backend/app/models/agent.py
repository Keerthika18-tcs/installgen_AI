from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("deployment_sessions.id"), nullable=False)
    agent_name = Column(String(50), nullable=False) # Planner, Generator, Auditor, Verifier
    action = Column(String(150), nullable=True) # e.g. "Analyzing Requirements", "Writing Script", "Auditing Shell Commands"
    thought = Column(Text, nullable=True) # AI thought process
    output_data = Column(Text, nullable=True) # Serialized output details or text summaries
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("DeploymentSession", back_populates="agent_logs")
