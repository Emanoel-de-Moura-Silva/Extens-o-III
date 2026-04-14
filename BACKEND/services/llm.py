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
    image_b64 = image_to_base64(image_bytes)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            OLLAMA_URL,
            json={
                "model": VISION_MODEL,
                "prompt": "List exactly what is written in this job posting image. Copy the exact text you see: job title, requirements, skills, and experience needed. Do not add or interpret anything.",
                "images": [image_b64],
                "stream": False,
                "options": {
                    "temperature": 0.0,
                    "seed": 42
                }
            }
        )
        response.raise_for_status()

    job_description = response.json()["response"]
    print("VAGA EXTRAÍDA:", job_description)
    return job_description


async def analyze_compatibility(job_description: str, resume_text: str) -> dict:
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Você é um especialista em recrutamento. 
Regras obrigatórias:
- Responda SOMENTE com JSON válido e completo
- Use APENAS informações presentes nos textos fornecidos
- NUNCA invente ou suponha informações
- Se não houver informação suficiente, coloque lista vazia []
- SEMPRE feche o JSON corretamente com }}
<|eot_id|><|start_header_id|>user<|end_header_id|>

DESCRIÇÃO DA VAGA:
{job_description}

CURRÍCULO DO CANDIDATO:
{resume_text}

Retorne este JSON completo e fechado:
{{
  "titulo_vaga": "<título exato da vaga>",
  "habilidades_vaga": ["<habilidade 1>", "<habilidade 2>"],
  "nivel_compatibilidade": <0 a 100>,
  "pontos_fortes": ["<ponto 1>", "<ponto 2>"],
  "pontos_fracos": ["<ponto 1>", "<ponto 2>"],
  "habilidades_faltantes": ["<skill 1>"],
  "recomendacao": "<Aprovado para entrevista | Requer desenvolvimento | Não recomendado>",
  "resumo": "<resumo curto em 1 frase>"
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
                    "temperature": 0.0,
                    "seed": 42,
                    "num_predict": 2048
                }
            }
        )
        response.raise_for_status()

    raw_text = response.json()["response"]
    print("RESPOSTA LLAMA:", raw_text)

    # Tenta consertar JSON incompleto
    raw_text = raw_text.strip()
    if not raw_text.endswith("}"):
        raw_text += "}"

    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not json_match:
        raise ValueError(f"Modelo não retornou JSON válido: {raw_text}")

    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError:
        fixed = re.sub(r'("resumo":\s*"[^"]*?)(\s*$)', r'\1"}', raw_text)
        json_match = re.search(r'\{.*\}', fixed, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError(f"Não foi possível corrigir o JSON: {raw_text}")


async def analyze_with_vision(prompt: str, image_bytes: bytes) -> dict:
    job_description = await extract_job_from_image(image_bytes)
    return await analyze_compatibility(job_description, prompt)