from fastapi import APIRouter, HTTPException, UploadFile, File
from models import AnalysisResult
from database import analyses_collection
from services.llm import analyze_with_vision
from services.pdf import extract_text_from_pdf
from services.prompt import build_vision_prompt
from datetime import datetime

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    job_image: UploadFile = File(..., description="Foto ou print da vaga"),
    resume_pdf: UploadFile = File(..., description="Currículo em PDF")
):
    # 1. Valida os arquivos
    if not job_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="job_image deve ser uma imagem")
    
    if resume_pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="resume_pdf deve ser um PDF")

    # 2. Lê os arquivos
    image_bytes = await job_image.read()
    pdf_bytes = await resume_pdf.read()

    # 3. Extrai texto do PDF
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Monta o prompt e chama o modelo
    prompt = build_vision_prompt(resume_text)

    try:
        result = await analyze_with_vision(prompt, image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5. Salva no MongoDB
    await analyses_collection.insert_one({
        "titulo_vaga": result.get("job_title"),
        "resume_filename": resume_pdf.filename,
        "resultado": result,
        "modelo_usado": "llama3.2-vision",
        "created_at": datetime.utcnow()
    })

    return AnalysisResult(**result)