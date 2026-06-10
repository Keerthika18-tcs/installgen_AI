import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.report import VerificationReport
from app.schemas.report import ReportOut

router = APIRouter()

@router.get("/session/{session_id}", response_model=ReportOut)
def get_session_report(
    *,
    db: Session = Depends(get_db),
    session_id: str
):
    """
    Retrieve the verification report summary details for a session.
    """
    report = db.query(VerificationReport).filter(VerificationReport.session_id == session_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification report for session {session_id} not found."
        )
    return report

@router.get("/{id}/download")
def download_pdf_report(
    *,
    db: Session = Depends(get_db),
    id: str
):
    """
    Download the generated verification PDF report file.
    """
    report = db.query(VerificationReport).filter(VerificationReport.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification report {id} not found."
        )
    
    if not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The PDF report file does not exist on disk."
        )
    
    filename = f"verification_report_{report.session_id}.pdf"
    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=filename
    )
