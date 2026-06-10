from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.services.gemini import gemini_service

router = APIRouter()

class TroubleshootRequest(BaseModel):
    error_log: str
    script_context: Optional[str] = ""

class TroubleshootResponse(BaseModel):
    root_cause: str
    solution: str
    recovery_script: str

@router.post("/analyze", response_model=TroubleshootResponse)
def analyze_error(request: TroubleshootRequest):
    """
    Submit an error log and script context to analyze root cause and generate a recovery script.
    """
    try:
        result = gemini_service.troubleshoot_error(request.error_log, request.script_context)
        return TroubleshootResponse(
            root_cause=result.get("root_cause", "Unknown cause"),
            solution=result.get("solution", "No specific solution step found"),
            recovery_script=result.get("recovery_script", "")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing logs: {str(e)}"
        )
