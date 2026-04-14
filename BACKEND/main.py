from fastapi import FastAPI
from routes.analyze import router as analyze_router
from routes.jobs import router as jobs_router

app = FastAPI(title="Resume Analyzer API")

app.include_router(jobs_router, prefix="/api/v1/jobs")
app.include_router(analyze_router, prefix="/api/v1")