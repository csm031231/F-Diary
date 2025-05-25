from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from base import Base
from sqlalchemy.sql import func

class Diary(Base):
    __tablename__ = "diaries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    empathy_response = Column(Text)
    emotion_tag = Column(String)
    feedback = Column(Text)  # 건설적인 피드백
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=func.now())

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    calendar_id = Column(Integer, ForeignKey("calendars.id"), nullable=True)

    user = relationship("User", back_populates="diaries")
    calendar = relationship("Calendar", back_populates="diaries")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    diaries = relationship("Diary", back_populates="user", cascade="all, delete-orphan")
    calendars = relationship("Calendar", back_populates="user", cascade="all, delete-orphan")

class Calendar(Base):
    __tablename__ = "calendars"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    emotion_tag = Column(String(50)) 
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="calendars")
    diaries = relationship("Diary", back_populates="calendar", cascade="all, delete-orphan")