import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict

from services.tts_service import generate_speech
from services.lesson_service import LessonPlan, synthesize_scene_script
from services.ai_brain import (
    generate_pedagogical_lesson,
    evaluate_student_response,
    is_valid_key,
    ask_contextual_teacher,
    generate_adaptive_scene
)
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

class AskTeacherRequest(BaseModel):
    topic: str
    scene_title: str
    teacher_name: str = "Dr. Maya"
    current_visual_content: Optional[str] = None
    question: str
    language: str = "en"

class AdaptRequest(BaseModel):
    topic: str
    misconception: str
    original_question: str
    student_answer: str
    language: str = "en"

class ExplanationScriptRequest(BaseModel):
    topic: str = "Lesson Concept"
    teacher_script: str
    step_type: str = "explanation"
    visual_type: Optional[str] = None
    visual_title: Optional[str] = None
    visual_content: Optional[str] = None
    language: str = "en"

class KeyConfigRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

@app.get("/api/config")
async def get_config():
    gemini_valid = is_valid_key(os.getenv("GEMINI_API_KEY"))
    groq_valid = is_valid_key(os.getenv("GROQ_API_KEY"))
    openai_valid = is_valid_key(os.getenv("OPENAI_API_KEY"))
    
    if gemini_valid:
        mode = "Google Gemini 2.0 Live"
    elif groq_valid:
        mode = "Groq Llama-3.3 Live"
    elif openai_valid:
        mode = "OpenAI Live"
    else:
        mode = "Adaptive Smart Engine (Zero-Key Active)"

    return {
        "gemini_configured": gemini_valid,
        "groq_configured": groq_valid,
        "openai_configured": openai_valid,
        "active_ai_mode": mode,
        "live_ai_connected": gemini_valid or groq_valid or openai_valid
    }

@app.post("/api/config/key")
async def set_api_key(req: KeyConfigRequest):
    env_path = ".env"
    existing_vars = {}
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.strip().split("=", 1)
                    existing_vars[k] = v

    if req.gemini_api_key is not None:
        clean_key = req.gemini_api_key.strip()
        existing_vars["GEMINI_API_KEY"] = clean_key
        os.environ["GEMINI_API_KEY"] = clean_key
    if req.groq_api_key is not None:
        clean_key = req.groq_api_key.strip()
        existing_vars["GROQ_API_KEY"] = clean_key
        os.environ["GROQ_API_KEY"] = clean_key
    if req.openai_api_key is not None:
        clean_key = req.openai_api_key.strip()
        existing_vars["OPENAI_API_KEY"] = clean_key
        os.environ["OPENAI_API_KEY"] = clean_key

    with open(env_path, "w") as f:
        for k, v in existing_vars.items():
            f.write(f"{k}={v}\n")

    return await get_config()

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ShikshakAI Engine",
        "zero_cost_stack": {
            "tts": "Edge-TTS Neural (Free)",
            "llm": "Google Gemini 2.0 Flash (Free Tier)",
            "fallback_llm": "Groq / OpenAI (Free Tier)",
            "smart_engine": "Adaptive Pedagogical Synthesizer (Active)",
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
def create_lesson_plan(request: LessonRequest):
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

from services.course_service import generate_curated_course, CourseModel

class CourseGenerateRequest(BaseModel):
    topic: str
    learner_level: str = "beginner"
    language: str = "en"

@app.post("/api/course/generate", response_model=CourseModel)
def create_course(req: CourseGenerateRequest):
    """
    Generates a full comprehensive course syllabus for any topic,
    breaking it down into structured, learnable modules with duration, objectives, and order.
    """
    if not req.topic or not req.topic.strip():
        raise HTTPException(
            status_code=400,
            detail="Topic is required. Please type a topic in the search bar to generate a course."
        )
    course = generate_curated_course(topic=req.topic.strip(), level=req.learner_level)
    return course

@app.post("/api/tts/speak")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("en"),
    teacher_id: str = Form("dr-maya")
):
    """Generates lifelike AI teacher voice audio using free Edge-TTS matching teacher persona."""
    audio_url = await generate_speech(text=text, language=language, teacher_id=teacher_id)
    return {"audio_url": audio_url}

@app.post("/api/evaluate")
def evaluate_answer(req: EvaluationRequest):
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

@app.post("/api/studio/ask")
def ask_teacher(req: AskTeacherRequest):
    """
    Context-aware teacher answering live doubts during an active scene.
    """
    return ask_contextual_teacher(
        topic=req.topic,
        scene_title=req.scene_title,
        teacher_name=req.teacher_name,
        current_visual_content=req.current_visual_content,
        student_question=req.question,
        language=req.language
    )

@app.post("/api/studio/adapt")
def adapt_lesson(req: AdaptRequest):
    """
    Generates an adaptive explanation scene tailored to resolve a detected student misconception.
    """
    return generate_adaptive_scene(
        topic=req.topic,
        misconception=req.misconception,
        original_question=req.original_question,
        student_answer=req.student_answer,
        language=req.language
    )

@app.post("/api/explanation/script")
def create_explanation_script(req: ExplanationScriptRequest):
    """
    Post-processing engine converting raw explanation/script into a synchronized 3Blue1Brown-style
    scene script timeline with 3D/formula/diagram visual payloads, camera, and presenter focus instructions.
    """
    scenes = synthesize_scene_script(
        teacher_script=req.teacher_script,
        topic=req.topic,
        step_type=req.step_type,
        visual_type=req.visual_type,
        visual_title=req.visual_title,
        visual_content=req.visual_content,
        language=req.language
    )
    total_duration = sum(s.duration for s in scenes)
    return {
        "topic": req.topic,
        "total_duration": round(total_duration, 2),
        "total_scenes": len(scenes),
        "scene_script": [s.model_dump() for s in scenes]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
