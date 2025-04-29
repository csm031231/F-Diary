from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from base import SessionLocal
from model import Diary
from ai import get_empathy_response
from dto import DiaryCreate, DiaryOut, DiaryUpdate
from security import get_current_user  # 사용자 인증 함수
from model import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/diaries/", response_model=DiaryOut)
def create_diary(
    diary: DiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    empathy = get_empathy_response(diary.content, character=diary.character)
    db_diary = Diary(
        title=diary.title,
        content=diary.content,
        empathy_response=empathy,
        user_id=current_user.id  
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    return db_diary

@router.get("/diaries/", response_model=list[DiaryOut])
def read_diaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Diary).filter(Diary.user_id == current_user.id).all()

@router.get("/diaries/{diary_id}", response_model=DiaryOut)
def read_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    return diary

@router.delete("/diaries/{diary_id}", response_model=DiaryOut)
def delete_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    db.delete(diary)
    db.commit()
    return diary

@router.put("/diaries/{diary_id}", response_model=DiaryOut)
def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")

    if diary_update.title is not None:
        diary.title = diary_update.title
    if diary_update.content is not None:
        diary.content = diary_update.content
        diary.empathy_response = get_empathy_response(diary_update.content, character=diary_update.character or "angry_friend")

    db.commit()
    db.refresh(diary)
    return diary

@router.get("/characters/")
def get_available_characters():
    from ai import CHARACTER_PROMPTS
    return {"characters": list(CHARACTER_PROMPTS.keys())}
