from datetime import datetime

from fastapi import APIRouter, File, HTTPException, UploadFile

from database import analyses_collection
from models import ResumeImprovementResult
from services.agent import tool_improve_resume
from services.pdf import extract_text_from_pdf

router = APIRouter()

_MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("/improve", response_model=ResumeImprovementResult)
async def improve_resume(
    resume_pdf: UploadFile = File(..., description="Currículo em PDF"),
):
    if resume_pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="resume_pdf deve ser um PDF")

    if resume_pdf.size and resume_pdf.size > _MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="resume_pdf muito grande (máx 20 MB)")

    pdf_bytes = await resume_pdf.read()

    try:
        resume_text = await extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        result = await tool_improve_resume(resume_text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        await analyses_collection.insert_one({
            "tipo": "melhoria_curriculo",
            "resume_filename": resume_pdf.filename,
            "resultado": result,
            "modelo_usado": "llama3.2 (agente)",
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[MongoDB] Falha ao salvar melhoria (não crítico): {e}")

    return ResumeImprovementResult(**result)
