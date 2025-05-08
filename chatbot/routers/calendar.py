from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from model import Calendar, User
from base import get_db
from security import get_current_user  

router = APIRouter()

def update_or_create_calendar(db: Session, user_id: int, diary_date: date, emotion: str):
    calendar_entry = db.query(Calendar).filter(
        Calendar.user_id == user_id,
        Calendar.date == diary_date
    ).first()

    if calendar_entry:
        calendar_entry.emotion_tag = emotion
    else:
        calendar_entry = Calendar(
            user_id=user_id,
            date=diary_date,
            emotion_tag=emotion
        )
        db.add(calendar_entry)

    db.commit()
    db.refresh(calendar_entry)
    
@router.get("/")
def read_calendar(
    year: int = Query(..., ge=1),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start_date = date(year, month, 1)
    end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)

    results = db.query(Calendar).filter(
        Calendar.user_id == current_user.id,
        Calendar.date >= start_date,
        Calendar.date < end_date
    ).all()

    return [
        {
            "date": record.date.isoformat(),
            "emotion_tag": record.emotion_tag
        }
        for record in results
    ]