import os
import pdfplumber
import docx
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Importando a função que você criou no agente.py
from agente import adaptar_curriculo_llm 

load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    # O Flask procura automaticamente o index.html dentro da pasta "templates"
    return render_template('index.html')

@app.route('/analisar-vaga', methods=['POST'])
def analisar_vaga():
    # 1. Pegando os dados do front-end (agora usando form-data em vez de JSON)
    # Verifica se a requisição contém o arquivo
    if 'arquivo_curriculo' not in request.files:
        return jsonify({"status": "erro", "mensagem": "Nenhum arquivo de currículo enviado!"}), 400
        
    arquivo = request.files['arquivo_curriculo']
    texto_vaga = request.form.get('texto_vaga')
    
    # Validações básicas
    if arquivo.filename == '' or not texto_vaga:
        return jsonify({"status": "erro", "mensagem": "Arquivo do currículo ou descrição da vaga faltando!"}), 400

    print(f"Processando arquivo: {arquivo.filename}")
    
    # 2. Extrair o texto do arquivo (PDF ou DOCX)
    texto_curriculo = ""
    extensao = arquivo.filename.rsplit('.', 1)[1].lower()
    
    try:
        if extensao == 'pdf':
            # Lê o PDF usando pdfplumber
            with pdfplumber.open(arquivo) as pdf:
                for page in pdf.pages:
                    texto_extraido = page.extract_text()
                    if texto_extraido:
                        texto_curriculo += texto_extraido + "\n"
                        
        elif extensao == 'docx':
            # Lê o DOCX usando python-docx
            doc = docx.Document(arquivo)
            for para in doc.paragraphs:
                texto_curriculo += para.text + "\n"
        else:
            return jsonify({"status": "erro", "mensagem": "Formato não suportado. Envie apenas PDF ou DOCX."}), 400
            
    except Exception as e:
        print(f"Erro na extração: {e}")
        return jsonify({"status": "erro", "mensagem": "Erro ao tentar ler o arquivo do currículo."}), 500

    # 3. Chamar o agente de IA 
    print("Enviando dados para o Llama 3 local...")
    curriculo_final = adaptar_curriculo_llm(texto_curriculo, texto_vaga)
    
    # 4. Devolver para o Front-end
    print("Análise concluída com sucesso!")
    return jsonify({
        "status": "sucesso", 
        "mensagem": "Análise concluída com sucesso!",
        "curriculo_adaptado": curriculo_final
    })

if __name__ == '__main__':
    # Roda o servidor na porta 5000
    app.run(debug=True)