import ollama

def adaptar_curriculo_llm(texto_curriculo, texto_vaga):
    instrucoes_sistema = """
    Você é um especialista em Recrutamento e Seleção de alto nível. 
    Sua tarefa é analisar o currículo do candidato e reescrevê-lo para se alinhar à vaga.
    
    REGRAS ABSOLUTAMENTE OBRIGATÓRIAS:
    1. RESPONDA EXCLUSIVAMENTE EM PORTUGUÊS DO BRASIL (PT-BR). NUNCA use inglês.
    2. Destaque as habilidades compatíveis com a vaga. 
    3. NÃO invente experiências, formações ou habilidades que não estão no currículo original.
    4. Entregue apenas o currículo pronto, sem introduções como "Aqui está o currículo".
    """
    
    mensagem = f"VAGA:\n{texto_vaga}\n\nCURRÍCULO ORIGINAL:\n{texto_curriculo}\n\nAdapte o currículo."
    
    try:
        # A RTX 2060 vai trabalhar aqui!
        resposta = ollama.chat(
            model='llama3', 
            messages=[
                {'role': 'system', 'content': instrucoes_sistema},
                {'role': 'user', 'content': mensagem}
            ],
            options={'temperature': 0.1}
        )
        return resposta['message']['content']
    except Exception as e:
        return f"Erro ao processar na IA: {e}"