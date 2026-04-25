import asyncio
import base64
import hashlib
import json
import re
import time

import httpx
from fastapi import HTTPException

OLLAMA_URL = "http://localhost:11434/api/generate"
VISION_MODEL = "moondream"
ANALYSIS_MODEL = "llama3.2"

_resume_cache: dict[str, str] = {}
_MAX_CACHE = 200


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    last_space = truncated.rfind(" ")
    return truncated[:last_space] if last_space > 0 else truncated


def _log(step: str, elapsed: float):
    print(f"[AGENTE] {step} concluído em {elapsed:.1f}s")


def _cache_set(key: str, value: str):
    if len(_resume_cache) >= _MAX_CACHE:
        _resume_cache.pop(next(iter(_resume_cache)))
    _resume_cache[key] = value


async def _call_ollama(payload: dict) -> str:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(OLLAMA_URL, json=payload)
            resp.raise_for_status()
        return resp.json()["response"]
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Ollama indisponível. Verifique se o serviço está rodando.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout na geração de resposta pelo modelo.")
    except KeyError:
        raise ValueError("Resposta inesperada do Ollama: campo 'response' ausente.")


# ─── Tools ────────────────────────────────────────────────────────────────────

async def tool_extract_job(image_bytes: bytes) -> str:
    t = time.monotonic()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    result = await _call_ollama({
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
    _log("tool_extract_job", time.monotonic() - t)
    return result


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

    profile = await _call_ollama({
        "model": ANALYSIS_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 512},
    })
    _cache_set(resume_hash, profile)
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
        raw = await _call_ollama({
            "model": ANALYSIS_MODEL,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": round(0.1 + attempt * 0.05, 2),
                "num_predict": 1024,
            },
        })
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


# ─── Improvement Tool ─────────────────────────────────────────────────────────

async def tool_improve_resume(resume_text: str) -> dict:
    prompt = f"""Você é um especialista em RH e carreira. Analise o currículo abaixo e retorne sugestões de melhoria detalhadas.

CURRÍCULO:
{_truncate(resume_text, 4000)}

Retorne um objeto JSON com EXATAMENTE estes campos em português:
- "pontuacao_geral": pontuação geral do currículo de 0 a 100 (número inteiro)
- "resumo_diagnostico": diagnóstico geral do currículo em 2 a 3 frases (string)
- "melhorias_por_secao": lista de objetos, cada um com:
    - "secao": nome da seção analisada (ex: "Objetivo", "Experiência", "Habilidades", "Educação", "Formatação")
    - "problemas": lista de problemas encontrados nessa seção (lista de strings)
    - "sugestoes": lista de sugestões concretas para melhorar essa seção (lista de strings)
- "habilidades_recomendadas": lista de habilidades relevantes que o candidato deveria adicionar ao currículo (lista de strings)
- "palavras_chave_faltantes": lista de palavras-chave importantes para o mercado que estão ausentes (lista de strings)
- "acoes_prioritarias": lista de 3 a 5 ações prioritárias mais importantes a tomar imediatamente (lista de strings)"""

    for attempt in range(3):
        t = time.monotonic()
        raw = await _call_ollama({
            "model": ANALYSIS_MODEL,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": round(0.1 + attempt * 0.05, 2),
                "num_predict": 2048,
            },
        })
        _log(f"tool_improve_resume (tentativa {attempt + 1})", time.monotonic() - t)
        print(f"[AGENTE] resposta bruta:", raw[:400])

        try:
            data = json.loads(raw)
            return _normalize_improvement(data)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    return _normalize_improvement(data)
                except json.JSONDecodeError:
                    continue

    raise ValueError("Agente não conseguiu gerar JSON válido após 3 tentativas")


def _normalize_improvement(data: dict) -> dict:
    return {
        "pontuacao_geral": _to_int(data.get("pontuacao_geral", 0)),
        "resumo_diagnostico": str(data.get("resumo_diagnostico", data.get("summary", ""))),
        "melhorias_por_secao": _normalize_sections(data.get("melhorias_por_secao", data.get("sections", []))),
        "habilidades_recomendadas": _to_list(data.get("habilidades_recomendadas", data.get("recommended_skills", []))),
        "palavras_chave_faltantes": _to_list(data.get("palavras_chave_faltantes", data.get("missing_keywords", []))),
        "acoes_prioritarias": _to_list(data.get("acoes_prioritarias", data.get("priority_actions", []))),
    }


def _normalize_sections(secoes) -> list:
    if not isinstance(secoes, list):
        return []
    normalized = []
    for item in secoes:
        if not isinstance(item, dict):
            continue
        normalized.append({
            "secao": str(item.get("secao", item.get("section", ""))),
            "problemas": _to_list(item.get("problemas", item.get("problems", []))),
            "sugestoes": _to_list(item.get("sugestoes", item.get("suggestions", []))),
        })
    return normalized


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
