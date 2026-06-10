from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.agent import AgentLogOut
from app.schemas.script import ScriptOut
from app.schemas.report import ReportOut

class DeploymentBase(BaseModel):
    name: str = Field(..., max_length=100, examples=["Install Web Server"])
    target_os: str = Field(..., max_length=50, description="Target OS (e.g. windows, ubuntu, macos)", examples=["ubuntu"])
    requirements: str = Field(..., description="Installation requirements or instructions", examples=["Install nginx and allow port 80"])

class DeploymentCreate(DeploymentBase):
    pass

class DeploymentUpdate(BaseModel):
    status: str = Field(..., description="Current status of the deployment run")

class DeploymentSessionOut(DeploymentBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    agent_logs: List[AgentLogOut] = []
    scripts: List[ScriptOut] = []
    reports: List[ReportOut] = []

    class Config:
        from_attributes = True
