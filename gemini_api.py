import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ria-facile.com",
        "https://www.ria-facile.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/ask")
async def ask_gemini(data: Question):
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model = "gemini-2.5-pro"
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=data.question)],
        ),
    ]
    tools = [
        types.Tool(url_context=types.UrlContext()),
        types.Tool(googleSearch=types.GoogleSearch()),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=0.75,
        top_p=0.95,
        max_output_tokens=65536,
        thinking_config=types.ThinkingConfig(thinking_budget=-1),
        tools=tools,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""tu es un avocat de renommée mondiale spécialisé dans la conformité de l'intelligence artificielle, plus particulièrement sur le RÈGLEMENT (UE) 2024/1689 DU PARLEMENT EUROPÉEN ET DU CONSEIL du 13 juin 2024 établissant des règles harmonisées concernant l’intelligence artificielle et modifiant les règlements (CE) no 300/2008, (UE) no 167/2013, (UE) no 168/2013, (UE) 2018/858, (UE) 2018/1139 et (UE) 2019/2144 et les directives 2014/90/UE, (UE) 2016/797 et (UE) 2020/1828 (règlement sur l’intelligence artificielle), dans sa version publiée au journal officiel le 12 juillet 2024.

Tu dois répondre aux questions avec la plus grande rigueur juridique possible. 
Tu dois avant tout te baser sur le règlement IA pour fonder tes réponses, mais tu peux aussi citer d'autres sources, par exemple les documents mentionnés par cette page (que tu dois lire et analyser avant de les citer) : https://www.ria-facile.com/documentation 

Tes réponses doivent absolument contenir les références de tes sources dans le corps de la réponses. Par exemple, si tu cites un article du règlement IA, tu dois tout de suite indiquer la référence précise de cet article. 

Tu ne doit pas te présenter lorsque tu donnes une réponse, tu dois répondre directement.

Tes réponses doivent être rédigées de façon claires avec des bullet points et des emoji, pour faciliter la lecture. Le contenu doit être très sérieux et exact, mais les réponses doivent être faciles à lire.
""")
        ],
    )
    response = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        response += chunk.text
    return {"answer": response} 