   IDEIAS:

Interview Prep IA - Sistema com IA que analisa currículo, compara com uma vaga, simula entrevista e gera feedback personalizado para ajudar candidatos a se prepararem melhor para processos seletivos.

     Duas entradas->Currículo e Vaga.
     Respostas por meio de texto,gerar possíveis questões que podem aparecer na  entrevista.
     Baseado nas respostas, montar um treinamento.
     Linguagem Python com FastApi, integração com IA propria.

     Interface Front-End com React
    Banco de dados não relacional - MongoDB



Fluxograma:
	
entrada: currículo + descrição da vaga
processamento: análise de aderência + geração de perguntas de entrevista
saída: feedback personalizado + plano de treino

# Conceito central

O usuário informa:

* seu currículo;
* a vaga desejada;
* talvez nível de experiência.

O sistema faz:

1. analisa o currículo em relação à vaga;
2. identifica pontos fortes e lacunas;
3. gera perguntas prováveis de entrevista;
4. permite que o usuário responda;
5. devolve feedback personalizado;
6. monta um plano de treino.

---

# Isso é um bom projeto?

Sim, porque resolve um problema concreto:

* muita gente não sabe adaptar currículo;
* muita gente não sabe se preparar para entrevista;
* o sistema gera valor claro e demonstrável.



### 1. Análise de currículo vs vaga

O usuário cola:

* currículo
* descrição da vaga

O sistema retorna:

* compatibilidade geral
* palavras-chave encontradas
* palavras-chave faltantes
* sugestões de melhoria

### 2. Geração de perguntas de entrevista

Com base na vaga, o sistema gera:

* perguntas técnicas
* perguntas comportamentais
* perguntas sobre experiência
* perguntas sobre fit com a vaga

### 3. Respostas do candidato

O usuário responde em texto.

### 4. Feedback e plano de treino

O sistema avalia:

* clareza
* objetividade
* aderência à vaga
* pontos a melhorar

E monta:

* tópicos para estudar
* perguntas para praticar de novo
* competências a reforçar

Isso já fecha um projeto muito bom.
# Arquitetura simples

## Frontend

* React
* MUI

## Backend

* Node.js/Express ou FastAPI

## IA

* API pronta para análise e geração de texto

## Banco

* MongoDB, SQlite, Firebase ou até JSON/local no MVP

---

# Fluxo do usuário

1. Usuário acessa a página.
2. Cola currículo.
3. Cola descrição da vaga.
4. Clica em “Analisar”.
5. Vê aderência e sugestões.
6. Clicar em “Simular entrevista”.
7. O sistema gera de 5 a 10 perguntas.
8. O usuário responde.
9. Sistema devolve feedback.
10. Sistema gera plano de treino.

obs: os itens 6, 7, e 8. pode-se fazer uma melhoria. Uma sugestão mais ativa e melhor seria uma conversa entre usuário e bot, para simular uma entrevista de emprego, isso seria um ponto relevante para próximas versões.

Seguindo a Sugestão na apresentação, de no caso fazer um radar para ver outras vagas que no caso o currículo do usuário seria mais compatível 


# Melhor forma de vender a ideia

Apresentem como uma plataforma de apoio à empregabilidade.

## Problema

Muitos candidatos têm dificuldade em:

* adaptar o currículo à vaga;
* identificar lacunas;
* praticar entrevistas;
* receber feedback estruturado.

## Solução

Uma aplicação com IA que:

* analisa currículo e vaga;
* simula entrevista;
* gera feedback personalizado;
* orienta o treino do candidato.

## Impacto

* melhora a preparação do usuário;
* aumenta confiança;
* organiza o processo de candidatura.

---

# Divisão realista para 2 pessoas ativas

## Pessoa 1

Frontend:

* telas
* fluxo do usuário
* formulários
* exibição dos resultados

## Pessoa 2

Backend/IA:

* integração com modelo
* regras de análise
* geração dos feedbacks
* estrutura dos prompts

## Restante do grupo

* documentação
* slides
* testes
* relatório
* benchmark/manual do usuário

---

# Escopo ideal em 3 meses

## Mês 1

* definir requisitos
* escolher stack
* montar telas principais
* integrar primeira chamada de IA
* fazer análise básica currículo x vaga

## Mês 2

* implementar geração de perguntas
* implementar envio de respostas
* gerar feedback textual
* refinar UX

## Mês 3

* plano de treino
* ajustes finais
* testes
* documentação
* apresentação

## Cronograma
  ![Cronograma](/img/cronograma.png)

---
## Tema final

*Plataforma de preparação para processos seletivos com IA*

## Funcionalidades principais

* análise de currículo com base na vaga;
* geração de perguntas de entrevista;
* feedback textual personalizado;
* plano de treino do candidato.

## Formato da entrevista

*somente texto*

Isso é o ponto-chave para manter viável.
