from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DiaryCreate(BaseModel):
    title: str
    content: str
    character: Optional[str] = "angry_friend"  
    user_id: int

class DiaryUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    character: Optional[str] 

class DiaryOut(BaseModel):
    id: int
    title: str
    content: str
    empathy_response: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AddUserDTO(BaseModel):
    username: str
    nickname: str
    password: str

class UpdateUserDTO(BaseModel):
    username: Optional[str] = None
    nickname: Optional[str] = None
    password: Optional[str] = None
