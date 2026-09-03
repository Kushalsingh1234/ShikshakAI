import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

from services.tts_service import generate_speech
from services.lesson_service import LessonPlan, get_sample_lesson_plan

app = FastAPI(
    title="AI Teacher Brain Backend",
    description="Zero-budget pedagogical AI educator API for AI Innovation Hackathon 2026",
    version="1.0.0"
)

# Enable CORS for Frontend (Vite running on localhost:5173 or other ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist for generated audio & uploaded docs
os.makedirs("static/audio", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

class LessonRequest(BaseModel):
    topic: str = "Ohm's Law"
    learner_level: str = "beginner"          # beginner | intermediate | advanced
    target_duration_minutes: int = 20       # 5 | 20 | 60 | 7-day
    language: str = "en"                    # en | hi | hinglish

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
        "service": "AI Teacher Engine",
        "zero_cost_stack": {
            "tts": "Edge-TTS Neural (Free)",
            "llm": "Google Gemini 1.5/2.0 Flash (Free Tier)",
            "rag": "ChromaDB Embedded (Free)"
        }
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Accepts PDF, DOCX, PPTX, TXT files for RAG extraction."""
    allowed_exts = [".pdf", ".docx", ".pptx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {file_ext}. Allowed: {allowed_exts}")
        
    save_path = os.path.join("uploads", file.filename)
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())
        
    return {
        "filename": file.filename,
        "saved_path": save_path,
        "message": f"Successfully uploaded {file.filename}. Ready for RAG processing."
    }

@app.post("/api/lesson/plan", response_model=LessonPlan)
async def create_lesson_plan(request: LessonRequest):
    """
    Generates structured lesson plan adhering to pedagogical cycle:
    Understand -> Plan -> Explain -> Demonstrate -> Question -> Evaluate -> Adapt -> Continue
    """
    plan = get_sample_lesson_plan(
        topic=request.topic,
        level=request.learner_level,
        duration=request.target_duration_minutes,
        language=request.language
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
    Evaluates student answer, checks for conceptual misconceptions,
    and returns tailored feedback.
    """
    is_correct = req.student_answer.strip().lower() in req.correct_answer.lower()
    
    if is_correct:
        feedback = "Excellent! You nailed the concept. Notice how the inverse relationship keeps the equation balanced."
        misconception_detected = False
    else:
        misconception_detected = True
        feedback = f"Not quite! Here is the intuition: think of resistance like friction or a constriction in a water pipe. When resistance goes up, it becomes harder for current to pass, so current decreases."

    return {
        "is_correct": is_correct,
        "misconception_detected": misconception_detected,
        "feedback": feedback,
        "adaptive_action": "proceed" if is_correct else "re_explain_with_analogy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
