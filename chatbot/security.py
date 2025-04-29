from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import  Depends, HTTPException
from jose import JWTError, jwt
from datetime import datetime, timedelta
from base import get_db
from sqlalchemy.orm import Session
from model import User
# 중요한 설정들
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/user/login")

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호 해싱 함수
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# 비밀번호 검증 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
# 토큰 검증 함수
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def create_access_token(data: dict):
    """
    💫 토큰 생성 함수
    - data: 토큰에 담을 데이터 (사용자 정보 등)
    """
    # 데이터 복사
    to_encode = data.copy()

    # 만료 시간 설정
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # JWT 토큰 생성
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(username : str, password : str, db:Session):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return False
        return verify_password(user.password,password)
    except Exception as e:
        return {"error": str(e)}
    