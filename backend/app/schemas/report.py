from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    passed: bool
    score: int
    summary: Optional[str] = None
    details: Optional[str] = None
    pdf_path: Optional[str] = None

class ReportCreate(ReportBase):
    session_id: str

class ReportOut(ReportBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True
