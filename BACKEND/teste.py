from groq import Groq
from dotenv import load_dotenv
import os
 
load_dotenv()
 
api_key = os.getenv("GROQ_API_KEY")
print("GROQ_API_KEY carregada:", "SIM" if api_key else "NÃO — adicione no .env")
 
try:
    client = Groq(api_key=api_key)
 
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Responda apenas: conexão com Groq funcionando!"}
        ],
        max_tokens=20,
    )
 
    print("Conexão com Groq: OK!")
    print("Resposta:", response.choices[0].message.content)
    print("Tokens usados:", response.usage.total_tokens)
 
except Exception as e:
    print("Erro ao conectar com Groq:")
    print(e)
 