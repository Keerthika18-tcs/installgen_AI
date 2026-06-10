from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AgentLogBase(BaseModel):
    agent_name: str
    action: Optional[str] = None
    thought: Optional[str] = None
    output_data: Optional[str] = None

class AgentLogCreate(AgentLogBase):
    session_id: str

class AgentLogOut(AgentLogBase):
    id: int
    session_id: str
    timestamp: datetime

    class Config:
        from_attributes = True
