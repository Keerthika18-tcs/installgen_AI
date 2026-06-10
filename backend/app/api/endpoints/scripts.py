from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.script import GeneratedScript
from app.schemas.script import ScriptOut

router = APIRouter()

@router.get("/session/{session_id}", response_model=List[ScriptOut])
def get_session_scripts(
    *,
    db: Session = Depends(get_db),
    session_id: str
):
    """
    Retrieve all scripts generated for a specific deployment session.
    """
    scripts = db.query(GeneratedScript).filter(GeneratedScript.session_id == session_id).all()
    return scripts

@router.get("/{id}/download")
def download_script(
    *,
    db: Session = Depends(get_db),
    id: str
):
    """
    Download a generated script as an attachment file.
    """
    script = db.query(GeneratedScript).filter(GeneratedScript.id == id).first()
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Script with ID {id} not found."
        )
    
    # Return as download attachment response
    return Response(
        content=script.content,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={script.filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
