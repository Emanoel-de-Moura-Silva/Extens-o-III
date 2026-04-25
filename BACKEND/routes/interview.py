from fastapi import APIRouter, HTTPException
from models import InterviewQuestionsRequest, InterviewQuestionsResult
from database import analyses_collection
from services.llm import generate_interview_questions
from datetime import datetime

router = APIRouter()

@router.post("/interview-questions", response_model=InterviewQuestionsResult)
async def get_interview_questions(request: InterviewQuestionsRequest):

    # Gera as perguntas com base na análise
    try:
        perguntas = await generate_interview_questions(request.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Salva no MongoDB
    await analyses_collection.insert_one({
        "type": "interview_questions",
        "titulo_vaga": request.titulo_vaga,
        "perguntas": perguntas,
        "model_used": "llama3.2",
        "created_at": datetime.utcnow()
    })

    return InterviewQuestionsResult(
        titulo_vaga=request.titulo_vaga,
        total_perguntas=len(perguntas),
        perguntas=perguntas
    )