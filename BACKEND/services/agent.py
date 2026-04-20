import asyncio
import base64
import hashlib
import json
import re
import time

import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
VISION_MODEL = "moondream"
ANALYSIS_MODEL = "llama3.2"

# Cache em memória: hash do currículo -> perfil extraído
_resume_cache: dict[str, str] = {}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    last_space = truncated.rfind(" ")
    return truncated[:last_space] if last_space > 0 else truncated


def _log(step: str, elapsed: float):
    print(f"[AGENTE] {step} concluído em {elapsed:.1f}s")


# ─── Tools ────────────────────────────────────────────────────────────────────

async def tool_extract_job(image_bytes: bytes) -> str:
    t = time.monotonic()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": VISION_MODEL,
            "prompt": (
                "You are analyzing a job posting image. "
                "Extract and list in detail: job title, required technical skills, "
                "required experience level (years), and main responsibilities."
            ),
            "images": [image_b64],
            "stream": False,
            "options": {"temperature": 0.1},
        })
        resp.raise_for_status()
    _log("tool_extract_job", time.monotonic() - t)
    return resp.json()["response"]


async def tool_extract_resume_profile(resume_text: str) -> str:
    resume_hash = hashlib.md5(resume_text.encode()).hexdigest()
    if resume_hash in _resume_cache:
        print("[AGENTE] tool_extract_resume_profile: cache hit")
        return _resume_cache[resume_hash]

    t = time.monotonic()
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Você é um especialista em análise de currículos. Responda sempre em português do Brasil.
<|eot_id|><|start_header_id|>user<|end_header_id|>

CURRÍCULO:
{_truncate(resume_text, 3000)}

Extraia e liste de forma objetiva:
- Cargo atual ou objetivo profissional
- Habilidades técnicas principais (máximo 10 itens)
- Total de anos de experiência profissional
- Nível de formação acadêmica
- Idiomas (se mencionado)
<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": ANALYSIS_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 512},
        })
        resp.raise_for_status()

    profile = resp.json()["response"]
    _resume_cache[resume_hash] = profile
    _log("tool_extract_resume_profile", time.monotonic() - t)
    return profile


async def tool_analyze_compatibility(
    job_description: str,
    resume_profile: str,
    resume_text: str,
) -> dict:
    prompt = f"""Você é um recrutador sênior experiente. Analise a compatibilidade entre a vaga e o candidato.

DESCRIÇÃO DA VAGA:
{job_description}

PERFIL DO CANDIDATO (resumido):
{resume_profile}

CURRÍCULO COMPLETO (trecho):
{_truncate(resume_text, 2000)}

Retorne um objeto JSON com EXATAMENTE estes campos em português:
- "titulo_vaga": nome do cargo da vaga (string)
- "habilidades_vaga": lista de habilidades exigidas pela vaga (lista de strings)
- "nivel_compatibilidade": porcentagem de compatibilidade de 0 a 100 (número inteiro)
- "pontos_fortes": lista de pontos positivos do candidato para esta vaga (lista de strings)
- "pontos_fracos": lista de pontos negativos ou lacunas do candidato (lista de strings)
- "habilidades_faltantes": habilidades da vaga que o candidato não possui (lista de strings)
- "recomendacao": exatamente uma das três opções: "Aprovado para entrevista", "Requer desenvolvimento" ou "Não recomendado"
- "resumo": análise geral em 2 frases curtas (string)"""

    for attempt in range(3):
        t = time.monotonic()
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(OLLAMA_URL, json={
                "model": ANALYSIS_MODEL,
                "prompt": prompt,
                "format": "json",
                "stream": False,
                "options": {
                    "temperature": round(0.1 + attempt * 0.05, 2),
                    "num_predict": 1024,
                },
            })
            resp.raise_for_status()

        raw = resp.json()["response"]
        _log(f"tool_analyze_compatibility (tentativa {attempt + 1})", time.monotonic() - t)
        print(f"[AGENTE] resposta bruta:", raw[:400])

        try:
            data = json.loads(raw)
            return _normalize_and_coerce(data)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    return _normalize_and_coerce(data)
                except json.JSONDecodeError:
                    continue

    raise ValueError("Agente não conseguiu gerar JSON válido após 3 tentativas")


# ─── Normalização e coerção de tipos ──────────────────────────────────────────

def _normalize_and_coerce(data: dict) -> dict:
    aliases = {
        "titulo_vaga":           ["job_title", "title", "titulo", "vaga", "position"],
        "habilidades_vaga":      ["required_skills", "skills", "habilidades", "requisitos", "requirements"],
        "nivel_compatibilidade": ["compatibility_score", "score", "nivel", "compatibilidade", "compatibility", "percentage"],
        "pontos_fortes":         ["strengths", "strong_points", "fortes", "positives"],
        "pontos_fracos":         ["weaknesses", "weak_points", "fracos", "negatives"],
        "habilidades_faltantes": ["missing_skills", "gaps", "faltantes", "missing"],
        "recomendacao":          ["recommendation", "hiring_recommendation", "recomendação", "decision"],
        "resumo":                ["summary", "overview", "analysis"],
    }
    defaults = {
        "titulo_vaga": "Não identificado",
        "habilidades_vaga": [],
        "nivel_compatibilidade": 0,
        "pontos_fortes": [],
        "pontos_fracos": [],
        "habilidades_faltantes": [],
        "recomendacao": "Requer desenvolvimento",
        "resumo": "",
    }

    normalized = {}
    for field, alt_names in aliases.items():
        value = data.get(field)
        if value is None:
            for alt in alt_names:
                if alt in data:
                    value = data[alt]
                    break
        normalized[field] = value if value is not None else defaults[field]

    # Coerção de tipos
    normalized["nivel_compatibilidade"] = _to_int(normalized["nivel_compatibilidade"])
    normalized["titulo_vaga"] = str(normalized["titulo_vaga"])
    normalized["recomendacao"] = str(normalized["recomendacao"])
    normalized["resumo"] = str(normalized["resumo"])
    for list_field in ["habilidades_vaga", "pontos_fortes", "pontos_fracos", "habilidades_faltantes"]:
        normalized[list_field] = _to_list(normalized[list_field])

    return normalized


def _to_int(value) -> int:
    try:
        v = int(float(str(value).replace("%", "").strip()))
        return max(0, min(100, v))
    except (ValueError, TypeError):
        return 0


def _to_list(value) -> list:
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, str) and value:
        return [value]
    return []


# ─── Agent Orchestrator ────────────────────────────────────────────────────────

async def run_agent(image_bytes: bytes, resume_text: str) -> dict:
    t_total = time.monotonic()

    job_description, resume_profile = await asyncio.gather(
        tool_extract_job(image_bytes),
        tool_extract_resume_profile(resume_text),
    )

    result = await tool_analyze_compatibility(job_description, resume_profile, resume_text)

    _log("run_agent TOTAL", time.monotonic() - t_total)
    return result
