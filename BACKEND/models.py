from pydantic import BaseModel

class JobPosting(BaseModel):
    title: str
    description: str
    required_skills: list[str]
    experience_years: int

class AnalyzeRequest(BaseModel):
    job_id: str
    resume_text: str

class AnalysisResult(BaseModel):
    titulo_vaga: str
    habilidades_vaga: list[str]
    nivel_compatibilidade: int
    pontos_fortes: list[str]
    pontos_fracos: list[str]
    habilidades_faltantes: list[str]
    recomendacao: str
    resumo: str

class InterviewQuestionsRequest(BaseModel):
    titulo_vaga: str
    habilidades_vaga: list[str]
    pontos_fortes: list[str]
    pontos_fracos: list[str]
    habilidades_faltantes: list[str]
    nivel_compatibilidade: int

class InterviewQuestionsResult(BaseModel):
    titulo_vaga: str
    total_perguntas: int
    perguntas: list[str]