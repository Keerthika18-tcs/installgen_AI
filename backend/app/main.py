from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.base import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.api.router import api_router
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite database tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default admin user if database has no users
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            default_admin = User(
                id=str(uuid.uuid4()),
                email="admin@installgen.ai",
                full_name="System Administrator",
                password_hash=get_password_hash("AdminPass123"),
                role="Admin"
            )
            db.add(default_admin)
            db.commit()
            print("INFO:     Seeded default administrator account: admin@installgen.ai")
    finally:
        db.close()
        
    yield
    # Shutdown: No-op
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS middleware origins
# You can adjust this list to specify exactly which frontend ports / origins are allowed
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include main router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
def health_check():
    """
    Health check endpoint to verify backend service status.
    """
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": "0.1.0"}
