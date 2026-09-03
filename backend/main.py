import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict

from services.tts_service import generate_speech
from services.lesson_service import LessonPlan
from services.ai_brain import generate_pedagogical_lesson, evaluate_student_response
from services.rag_service import extract_document_content

app = FastAPI(
    title="ShikshakAI Engine",
    description="Zero-budget pedagogical AI educator for AI Innovation Hackathon 2026",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/audio", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory document storage for current active uploaded content
ACTIVE_DOCUMENTS: Dict[str, str] = {}

class LessonRequest(BaseModel):
    topic: str = "Ohm's Law"
    learner_level: str = "beginner"          # beginner | intermediate | advanced
    target_duration_minutes: int = 20       # 5 | 20 | 60 | 7-day
    language: str = "en"                    # en | hi | hinglish
    uploaded_filename: Optional[str] = None

class EvaluationRequest(BaseModel):
    question: str
    student_answer: str
    correct_answer: str
    misconception_guide: Optional[str] = None
    language: str = "en"

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ShikshakAI Engine",
        "zero_cost_stack": {
            "tts": "Edge-TTS Neural (Free)",
            "llm": "Google Gemini 3.6 Flash (Free Tier)",
            "fallback_llm": "Groq (Free Tier)",
            "rag": "Multi-format Document Extraction (PDF, DOCX, PPTX)"
        }
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Accepts PDF, DOCX, PPTX, TXT files, extracts content for RAG grounding."""
    allowed_exts = [".pdf", ".docx", ".pptx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {file_ext}. Allowed: {allowed_exts}")
        
    save_path = os.path.join("uploads", file.filename)
    content = await file.read()
    with open(save_path, "wb") as buffer:
        buffer.write(content)
        
    # Extract readable text
    extracted_text = extract_document_content(save_path)
    ACTIVE_DOCUMENTS[file.filename] = extracted_text

    return {
        "filename": file.filename,
        "saved_path": save_path,
        "extracted_length": len(extracted_text),
        "message": f"Successfully parsed {file.filename} ({len(extracted_text)} characters). Grounding ready."
    }

@app.post("/api/lesson/plan", response_model=LessonPlan)
async def create_lesson_plan(request: LessonRequest):
    """
    Generates structured lesson plan using Google Gemini with Groq fallback.
    Understands topic or uploaded document, creates subject-aware visuals (KaTeX, Mermaid, Code),
    and sets up checkpoints for misconception detection.
    """
    doc_context = None
    if request.uploaded_filename and request.uploaded_filename in ACTIVE_DOCUMENTS:
        doc_context = ACTIVE_DOCUMENTS[request.uploaded_filename]

    plan = generate_pedagogical_lesson(
        topic=request.topic,
        level=request.learner_level,
        duration_minutes=request.target_duration_minutes,
        language=request.language,
        document_context=doc_context
    )
    return plan

@app.post("/api/tts/speak")
async def text_to_speech(text: str = Form(...), language: str = Form("en")):
    """Generates lifelike AI teacher voice audio using free Edge-TTS."""
    audio_url = await generate_speech(text=text, language=language)
    return {"audio_url": audio_url}

@app.post("/api/evaluate")
async def evaluate_answer(req: EvaluationRequest):
    """
    Pedagogically evaluates student response:
    Detects conceptual misconceptions, explains intuition with fresh analogies, and adapts next steps.
    """
    result = evaluate_student_response(
        question=req.question,
        student_answer=req.student_answer,
        correct_answer=req.correct_answer,
        misconception_guide=req.misconception_guide,
        language=req.language
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
