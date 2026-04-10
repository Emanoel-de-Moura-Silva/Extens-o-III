def build_vision_prompt(resume_text: str) -> str:
    return f"""Você é um especialista em recrutamento e seleção.

Analise a imagem da vaga de emprego fornecida e o currículo abaixo.

CURRÍCULO:
{resume_text}

Faça duas coisas:
1. Extraia as informações da vaga na imagem (título, requisitos, experiência necessária)
2. Analise a compatibilidade entre o currículo e a vaga

Responda SOMENTE com este JSON válido, sem texto adicional:
{{
  "titulo_vaga": "<título da vaga extraído da imagem>",
  "habilidades_vaga": ["<requisito 1>", "<requisito 2>"],
  "nivel_compatibilidade": <0 a 100>,
  "pontos_fortes": ["<ponto forte 1>", "<ponto forte 2>"],
  "pontos_fracos": ["<ponto fraco 1>", "<ponto fraco 2>"],
  "habilidades_faltantes": ["<skill ausente 1>"],
  "recomendacao": "<Aprovado para entrevista | Requer desenvolvimento | Não recomendado>",
  "resumo": "<resumo em 2 frases do perfil do candidato>"
}}"""