from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ScriptBase(BaseModel):
    filename: str
    content: str
    language: str
    description: Optional[str] = None

class ScriptCreate(ScriptBase):
    session_id: str

class ScriptOut(ScriptBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True
