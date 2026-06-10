from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

from app.core.config import settings

# SQLite requires 'check_same_thread': False for multi-threaded FastAPI apps
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    """
    Dependency generator for SQLAlchemy database sessions.
    Yields a database session and closes it once the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
