from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.diary import router as diary_router
from routers.user import router as user_router
from routers.calendar import router as calendar_router

app = FastAPI(title="Diary API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diary_router, prefix="/api", tags=["diaries"])
app.include_router(user_router, prefix="/api", tags=["user"])
app.include_router(calendar_router, prefix="/api/calendar", tags=["calendar"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)