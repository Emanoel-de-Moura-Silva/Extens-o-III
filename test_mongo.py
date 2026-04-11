from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_url = os.getenv("MONGO_URL")
db_name = os.getenv("DB_NAME")

print("MONGO_URL carregada:", "SIM" if mongo_url else "NAO")
print("DB_NAME:", db_name)

try:
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("Conexao com MongoDB OK!")

    db = client[db_name]
    collection = db["users"]

    result = collection.insert_one({
        "name": "Teste User",
        "email": "teste@email.com"
    })

    print("Documento inserido com sucesso!")
    print("ID:", result.inserted_id)

except Exception as e:
    print("Erro ao conectar/inserir no MongoDB:")
    print(e)