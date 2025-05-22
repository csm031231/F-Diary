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
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AddUserDTO(BaseModel):
    username: str
    email: EmailStr  # 여기 추가
    password: str

class UpdateUserDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None  # 여기 추가
    password: Optional[str] = None
