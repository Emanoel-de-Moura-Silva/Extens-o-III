import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import client as mongo_client, db
from routes.analyze import router as analyze_router
from routes.improve import router as improve_router
from routes.interview import router as interview_router
from routes.jobs import router as jobs_router

app = FastAPI(title="Resume Analyzer API")

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
origins = [origin for origin in origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router, prefix="/api/v1/jobs")
app.include_router(analyze_router, prefix="/api/v1")
app.include_router(interview_router, prefix="/api/v1")
app.include_router(improve_router, prefix="/api/v1")


@app.get("/health")
async def health():
    try:
        await db.command("ping")
        db_status = "ok"
    except Exception:
        db_status = "error"
    return {"status": "ok", "database": db_status}


@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()