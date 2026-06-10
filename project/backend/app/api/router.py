from fastapi import APIRouter, Depends
from app.api.endpoints import deployments, scripts, reports, assistant, troubleshoot, auth, users
from app.api.deps import get_current_user

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(deployments.router, prefix="/deployments", tags=["deployments"], dependencies=[Depends(get_current_user)])
api_router.include_router(scripts.router, prefix="/scripts", tags=["scripts"], dependencies=[Depends(get_current_user)])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"], dependencies=[Depends(get_current_user)])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"], dependencies=[Depends(get_current_user)])
api_router.include_router(troubleshoot.router, prefix="/troubleshoot", tags=["troubleshoot"], dependencies=[Depends(get_current_user)])


