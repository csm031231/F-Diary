from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from base import get_db  # ✅ base에서 get_db 함수 import
from model import Diary, Calendar
from ai import get_empathy_response
from dto import DiaryCreate, DiaryOut, DiaryUpdate
from security import get_current_user_by_email
from model import User
from datetime import date
from routers.calendar import update_or_create_calendar

router = APIRouter()

# ✅ get_db 함수를 base.py에서 import하므로 여기서 재정의할 필요 없음
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

@router.post("/diaries/", response_model=DiaryOut)
def create_diary(diary: DiaryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    today = date.today()
    
    # ✅ 오늘 이미 일기를 작성했는지 확인하는 로직 수정
    existing_diary = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.created_at >= today,
        Diary.created_at < date(today.year, today.month, today.day + 1) if today.day < 31 else date(today.year, today.month + 1, 1)
    ).first()

    if existing_diary:
        raise HTTPException(status_code=400, detail="오늘은 이미 일기를 작성하셨습니다.")

    # ✅ AI 감정 분석
    empathy = get_empathy_response(diary.content, intensity=diary.intensity)
    
    # ✅ 감정 태그 추가
    db_diary = Diary(
        title=diary.title,
        content=diary.content,
        empathy_response=empathy["comment"],
        feedback=empathy["feedback"],
        emotion_tag=empathy["emotion"],  # ✅ 감정 태그 저장
        user_id=current_user.id
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)

    # ✅ 캘린더 업데이트
    update_or_create_calendar(db, current_user.id, db_diary.created_at.date(), empathy["emotion"])

    return db_diary

@router.put("/diaries/{diary_id}/change", response_model=DiaryOut)
def update_diary(diary_id: int, diary_update: DiaryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")

    if diary_update.title:
        diary.title = diary_update.title
    if diary_update.content:
        diary.content = diary_update.content
        # ✅ 내용이 변경되면 감정 재분석
        empathy = get_empathy_response(diary_update.content, intensity=diary_update.intensity or "medium")
        diary.empathy_response = empathy["comment"]
        diary.feedback = empathy["feedback"]
        diary.emotion_tag = empathy["emotion"]  # ✅ 감정 태그 업데이트

    db.commit()
    db.refresh(diary)

    # ✅ 캘린더 업데이트
    update_or_create_calendar(db, current_user.id, diary.updated_at.date(), empathy["emotion"])

    return diary

@router.get("/diaries/read", response_model=list[DiaryOut])
def read_diaries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    # ✅ 최신 순으로 정렬
    return db.query(Diary).filter(Diary.user_id == current_user.id).order_by(Diary.created_at.desc()).all()

@router.get("/diaries/{diary_id}/read_Diary", response_model=DiaryOut)
def read_diary(diary_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    return diary

@router.delete("/diaries/{diary_id}/del", response_model=DiaryOut)
def delete_diary(diary_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_by_email)):
    diary = db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == current_user.id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    
    # ✅ 일기 삭제 시 캘린더에서도 제거 (선택적)
    # calendar_entry = db.query(Calendar).filter(
    #     Calendar.user_id == current_user.id,
    #     Calendar.date == diary.created_at.date()
    # ).first()
    # if calendar_entry:
    #     db.delete(calendar_entry)
    
    db.delete(diary)
    db.commit()
    return diary