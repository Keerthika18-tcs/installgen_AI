import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Employee") # Admin, Support Engineer, Employee
    created_at = Column(DateTime, default=datetime.utcnow)
