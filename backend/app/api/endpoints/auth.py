from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserOut, UserLogin, Token, PasswordChange

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
):
    """
    Register a new user.
    """
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    db_user = User(
        id=str(uuid.uuid4()),
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role or "Employee"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(
    *,
    db: Session = Depends(get_db),
    login_in: UserLogin
):
    """
    OAuth2 compatible token login, retrieve a JWT access token.
    """
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout route. Simply returns a success status.
    """
    return {"status": "success", "message": "Successfully logged out."}

@router.get("/me", response_model=UserOut)
def read_user_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current logged in user.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update own profile settings.
    """
    if user_in.email is not None and user_in.email != current_user.email:
        email_exists = db.query(User).filter(User.email == user_in.email).first()
        if email_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another user"
            )
        current_user.email = user_in.email

    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/change-password", status_code=status.HTTP_200_OK)
def change_password(
    *,
    db: Session = Depends(get_db),
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """
    Change user password.
    """
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}
