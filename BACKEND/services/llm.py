import httpx
import json
import re
import base64

OLLAMA_URL = "http://localhost:11434/api/generate"
VISION_MODEL = "moondream"
ANALYSIS_MODEL = "llama3.2"

def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")

async def extract_job_from_image(image_bytes: bytes) -> str:
    """Etapa 1 — moondream extrai o texto da vaga da imagem"""
    image_b64 = image_to_base64(image_bytes)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            OLLAMA_URL,
            json={
                "model": VISION_MODEL,
                "prompt": "Describe in detail the job posting in this image. Include: job title, required skills, experience needed, and responsibilities.",
                "images": [image_b64],
                "stream": False,
                "options": {"temperature": 0.1}
            }
        )
        response.raise_for_status()

    job_description = response.json()["response"]
    return job_description


async def analyze_compatibility(job_description: str, resume_text: str) -> dict:
    """Etapa 2 — llama3.2 analisa compatibilidade e retorna JSON"""
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Você é um especialista em recrutamento. Responda SOMENTE com JSON válido, sem texto adicional.
<|eot_id|><|start_header_id|>user<|end_header_id|>

VAGA EXTRAÍDA:
{job_description}

CURRÍCULO:
{resume_text}

Retorne EXATAMENTE este JSON:
{{
  "titulo_vaga": "<título da vaga>",
  "habilidades_vaga": ["<requisito 1>", "<requisito 2>"],
  "nivel_compatibilidade": <0 a 100>,
  "pontos_fortes": ["<ponto forte 1>", "<ponto forte 2>"],
  "pontos_fracos": ["<ponto fraco 1>", "<ponto fraco 2>"],
  "habilidades_faltantes": ["<skill ausente 1>"],
  "recomendacao": "<Aprovado para entrevista | Requer desenvolvimento | Não recomendado>",
  "resumo": "<resumo em 2 frases>"
}}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            OLLAMA_URL,
            json={
                "model": ANALYSIS_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 1024
                }
            }
        )
        response.raise_for_status()

    raw_text = response.json()["response"]
    print("RESPOSTA LLAMA:", raw_text[:300])

    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not json_match:
        raise ValueError(f"Modelo não retornou JSON válido: {raw_text}")

    return json.loads(json_match.group())


async def analyze_with_vision(prompt: str, image_bytes: bytes) -> dict:
    """Orquestra as duas etapas"""
    job_description = await extract_job_from_image(image_bytes)
    return await analyze_compatibility(job_description, prompt)