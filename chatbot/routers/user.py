from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from base import get_db
from model import User
from dto import UpdateUserDTO, AddUserDTO
from security import hash_password, verify_password, oauth2_scheme, create_access_token, authenticate_user, get_current_user

router = APIRouter(prefix="/user")

@router.post("/")
def add_user(user_data: AddUserDTO, db: Session = Depends(get_db)):
    try:
        hashed_password = hash_password(user_data.password)
        new_user = User(
            username=user_data.username,
            password_hash=hashed_password,
            nickname=user_data.nickname
        )
        db.add(new_user)
        db.commit()
        return {"message": f"User {user_data.username} added successfully!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error adding user: {str(e)}"}


@router.delete("/{username}/del")
def delete_user(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.username == current_user).first()
        if not user:
            return {"error": f"User {current_user} not found"}
        db.delete(user)
        db.commit()
        return {"message": f"User {current_user} deleted successfully!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error deleting user: {str(e)}"}


@router.put("/{username}/change")
def update_user(user_data: UpdateUserDTO, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.username == current_user).first()
        if not user:
            return {"error": f"User {current_user} not found"}

        if user_data.username:
            user.username = user_data.username
        if user_data.nickname:
            user.nickname = user_data.nickname
        if user_data.password:
            user.password_hash = hash_password(user_data.password)

        db.commit()
        return {"message": f"User {user.username} updated successfully!"}
    except Exception as e:
        db.rollback()
        return {"error": f"Error updating user: {str(e)}"}
    
@router.get("/profile")
def get_user_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.username == current_user.username).first()
        if not user:
            return {"error": f"User {current_user.username} not found"}
        return {
            "username": user.username,
            "nickname": user.nickname,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    if authenticate_user(form_data.username, form_data.password, db):
        token_data = {
            "sub": form_data.username,
            "type": "access"
        }
        token = create_access_token(token_data)
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 잘못되었습니다"
        )
