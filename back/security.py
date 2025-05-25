from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from datetime import datetime, timedelta
from base import get_db
from sqlalchemy.orm import Session
from model import User

SECRET_KEY = "your-secret-key-change-this-in-production"  # 프로덕션에서는 환경변수로 관리
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/user/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """비밀번호를 해시화합니다."""
    hashed = pwd_context.hash(password)
    print(f"🔐 비밀번호 해시 생성: {len(password)}자 -> {hashed[:30]}...")
    return hashed

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """평문 비밀번호와 해시된 비밀번호를 비교합니다."""
    print(f"🔍 비밀번호 검증:")
    print(f"   입력된 비밀번호 길이: {len(plain_password)}")
    print(f"   해시: {hashed_password[:30]}...")
    
    result = pwd_context.verify(plain_password, hashed_password)
    print(f"   검증 결과: {result}")
    return result

# 기존 username 기반 인증 (하위 호환성을 위해 유지)
def authenticate_user(username: str, password: str, db: Session):
    """사용자명으로 사용자를 인증합니다."""
    try:
        print(f"🔍 사용자명 기반 인증 시도: {username}")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"❌ 사용자명으로 사용자를 찾을 수 없음: {username}")
            return False
        
        result = verify_password(password, user.password_hash)
        print(f"✅ 사용자명 기반 인증 결과: {result}")
        return result
    except Exception as e:
        print(f"❌ 사용자명 기반 인증 중 오류: {e}")
        return False

# 이메일 기반 인증
def authenticate_user_by_email(email: str, password: str, db: Session):
    """이메일로 사용자를 인증합니다."""
    try:
        print(f"🔍 이메일 기반 인증 시도: {email}")
        
        # 이메일로 사용자 조회
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ 이메일로 사용자를 찾을 수 없음: {email}")
            return False
        
        print(f"✅ 사용자 찾음: {user.username} ({user.email})")
        
        # 비밀번호 검증
        result = verify_password(password, user.password_hash)
        print(f"✅ 이메일 기반 인증 결과: {result}")
        return result
        
    except Exception as e:
        print(f"❌ 이메일 기반 인증 중 오류: {e}")
        return False

# username 기반 현재 사용자 가져오기 (하위 호환성을 위해 유지)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """토큰에서 사용자명을 추출하여 현재 사용자를 반환합니다."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("❌ 토큰에 sub 필드가 없음")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        print(f"🔍 토큰에서 사용자명 추출: {username}")
        
    except JWTError as e:
        print(f"❌ JWT 디코딩 오류: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        print(f"❌ 사용자명으로 사용자를 찾을 수 없음: {username}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"✅ 현재 사용자 확인: {user.username}")
    return user

# 이메일 기반 현재 사용자 가져오기
async def get_current_user_by_email(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """토큰에서 이메일을 추출하여 현재 사용자를 반환합니다."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("❌ 토큰에 sub 필드가 없음")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        print(f"🔍 토큰에서 이메일 추출: {email}")
        
    except JWTError as e:
        print(f"❌ JWT 디코딩 오류: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        print(f"❌ 이메일로 사용자를 찾을 수 없음: {email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"✅ 현재 사용자 확인: {user.username} ({user.email})")
    return user

def create_access_token(data: dict):
    """액세스 토큰을 생성합니다."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    print(f"🔐 토큰 생성:")
    print(f"   데이터: {data}")
    print(f"   만료 시간: {expire}")
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"✅ 토큰 생성 완료: {encoded_jwt[:30]}...")
    return encoded_jwt