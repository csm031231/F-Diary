from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class DiaryCreate(BaseModel):
    title: str
    content: str
    intensity: Optional[str] = "medium"

class DiaryUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    intensity: Optional[str]

class DiaryOut(BaseModel):
    id: int
    title: str
    content: str
    empathy_response: str
    feedback: Optional[str]
    emotion_tag: Optional[str]  # ✅ 감정 태그 필드 추가
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AddUserDTO(BaseModel):
    username: str
    email: EmailStr
    password: str

class UpdateUserDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None