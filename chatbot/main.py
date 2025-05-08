from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import routers
from routers import user
from routers import calendar

app = FastAPI(title="Diary API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router, prefix="/api", tags=["diaries"])
app.include_router(user.router, prefix="/api", tags=["user"])
app.include_router(calendar.router, prefix="/api", tags=["calendar"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)