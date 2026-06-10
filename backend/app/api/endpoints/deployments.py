from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.deployment import DeploymentSession
from app.schemas.deployment import DeploymentCreate, DeploymentSessionOut
from app.services.orchestrator import AgentOrchestrator

router = APIRouter()

@router.post("/", response_model=DeploymentSessionOut, status_code=status.HTTP_201_CREATED)
def create_deployment(
    *,
    db: Session = Depends(get_db),
    deployment_in: DeploymentCreate,
    background_tasks: BackgroundTasks
):
    """
    Creates a new deployment session and kicks off the multi-agent orchestration pipeline in the background.
    """
    db_session = DeploymentSession(
        name=deployment_in.name,
        target_os=deployment_in.target_os,
        requirements=deployment_in.requirements,
        status="pending"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Trigger background multi-agent orchestrator
    # We must pass a new thread-safe session or let background task handle DB connection.
    # To be safe, we can query in the background task or manage session carefully.
    background_tasks.add_task(AgentOrchestrator.run_pipeline, db_session.id, db)
    
    return db_session

@router.get("/", response_model=List[DeploymentSessionOut])
def list_deployments(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    List all installation/deployment sessions.
    """
    sessions = (
        db.query(DeploymentSession)
        .order_by(DeploymentSession.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sessions

@router.get("/{id}", response_model=DeploymentSessionOut)
def get_deployment(
    *,
    db: Session = Depends(get_db),
    id: str
):
    """
    Fetch a single deployment session by ID, including its agent logs, scripts, and reports.
    """
    session = db.query(DeploymentSession).filter(DeploymentSession.id == id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deployment session {id} not found."
        )
    return session

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deployment(
    *,
    db: Session = Depends(get_db),
    id: str
):
    """
    Deletes a deployment session and its associated logs, scripts, and reports.
    """
    session = db.query(DeploymentSession).filter(DeploymentSession.id == id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deployment session {id} not found."
        )
    db.delete(session)
    db.commit()
    return None
