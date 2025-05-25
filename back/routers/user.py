from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from base import get_db
from model import User
from dto import UpdateUserDTO, AddUserDTO
from security import hash_password, verify_password, oauth2_scheme, create_access_token, authenticate_user_by_email, get_current_user_by_email

router = APIRouter(prefix="/user")

@router.post("/")
def add_user(user_data: AddUserDTO, db: Session = Depends(get_db)):
    try:
        # 중복 이메일 확인
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
        
        # 중복 사용자명 확인
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다")
        
        hashed_password = hash_password(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        db.add(new_user)
        db.commit()
        print(f"✅ 회원가입 성공: {user_data.username} ({user_data.email})")
        return {"message": f"User {user_data.username} added successfully!"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ 회원가입 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding user: {str(e)}")

@router.delete("/delete")
def delete_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    try:
        user = db.query(User).filter(User.email == current_user.email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {current_user.email} not found")
        db.delete(user)
        db.commit()
        return {"message": f"User {current_user.email} deleted successfully!"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

@router.put("/update")
def update_user(user_data: UpdateUserDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    try:
        user = db.query(User).filter(User.email == current_user.email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {current_user.email} not found")

        # 이메일 변경 시 중복 확인
        if user_data.email and user_data.email != user.email:
            existing_email = db.query(User).filter(User.email == user_data.email).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
            user.email = user_data.email

        # 사용자명 변경 시 중복 확인
        if user_data.username and user_data.username != user.username:
            existing_username = db.query(User).filter(User.username == user_data.username).first()
            if existing_username:
                raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다")
            user.username = user_data.username

        if user_data.password:
            user.password_hash = hash_password(user_data.password)

        db.commit()
        return {"message": f"User {user.username} updated successfully!"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@router.get("/profile")
def get_user_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    try:
        user = db.query(User).filter(User.email == current_user.email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {current_user.email} not found")
        return {
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"🔐 로그인 시도:")
    print(f"   이메일: {form_data.username}")
    print(f"   비밀번호 길이: {len(form_data.password)}")
    
    try:
        # 사용자 존재 확인
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            print(f"❌ 사용자 없음: {form_data.username}")
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 잘못되었습니다"
            )
        
        print(f"✅ 사용자 찾음: {user.username} ({user.email})")
        
        # 비밀번호 검증
        if not verify_password(form_data.password, user.password_hash):
            print(f"❌ 비밀번호 불일치")
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 잘못되었습니다"
            )
        
        print(f"✅ 인증 성공!")
        
        token_data = {
            "sub": form_data.username,  # 이메일
            "type": "access"
        }
        token = create_access_token(token_data)
        print(f"✅ 토큰 생성 완료")
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 로그인 처리 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="서버 내부 오류가 발생했습니다"
        )