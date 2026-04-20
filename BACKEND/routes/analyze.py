from datetime import datetime

from fastapi import APIRouter, File, HTTPException, UploadFile

from database import analyses_collection
from models import AnalysisResult
from services.agent import run_agent
from services.pdf import extract_text_from_pdf

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    job_image: UploadFile = File(..., description="Foto ou print da vaga"),
    resume_pdf: UploadFile = File(..., description="Currículo em PDF"),
):
    if not job_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="job_image deve ser uma imagem")

    if resume_pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="resume_pdf deve ser um PDF")

    image_bytes = await job_image.read()
    pdf_bytes = await resume_pdf.read()

    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        result = await run_agent(image_bytes, resume_text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        await analyses_collection.insert_one({
            "titulo_vaga": result.get("titulo_vaga"),
            "resume_filename": resume_pdf.filename,
            "resultado": result,
            "modelo_usado": "moondream + llama3.2 (agente)",
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[MongoDB] Falha ao salvar análise (não crítico): {e}")

    return AnalysisResult(**result)
