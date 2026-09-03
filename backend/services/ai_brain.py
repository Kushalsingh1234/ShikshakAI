import os
import json
import re
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from services.lesson_service import LessonPlan, LessonStep, VisualContent

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

gemini_client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None

def clean_json_string(raw: str) -> str:
    """Strips markdown code blocks and returns raw json string."""
    raw = raw.strip()
    match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", raw, re.DOTALL)
    if match:
        return match.group(1).strip()
    return raw

def generate_pedagogical_lesson(
    topic: str,
    level: str = "beginner",
    duration_minutes: int = 20,
    language: str = "en",
    document_context: Optional[str] = None
) -> LessonPlan:
    """
    Generates a structured, adaptive, pedagogical lesson plan using Google Gemini.
    Follows human educator cycle: Understand -> Plan -> Explain -> Demonstrate -> Question -> Evaluate -> Adapt.
    """
    system_instruction = """
You are ShikshakAI, a world-class, empathetic, and human-like AI Educator.
Your task is to teach the given topic or uploaded textbook material to a student.

You must follow this pedagogical teaching process:
Understand -> Plan -> Explain -> Demonstrate -> Question -> Evaluate -> Adapt -> Continue

Guidelines:
1. Tone: Warm, encouraging, clear, and pedagogically sound. Like a master teacher, not a boring robot.
2. Learner Level:
   - Beginner: Use everyday terminology, intuitive analogies, fundamental principles.
   - Intermediate: More technical depth and real-world applied examples.
   - Advanced: In-depth mathematics, edge cases, underlying mechanics, and technical rigor.
3. Available Time:
   - 5 mins: 3 quick, high-impact steps.
   - 20 mins: 4-5 well-paced steps with an interactive checkpoint.
   - 60 mins: 6-8 comprehensive steps with deep visual demonstrations and 2 checkpoints.
   - 7 days / Multi-day: Structured syllabus and study roadmap.
4. Multilingual:
   - If language is 'hi' (Hindi): The teacher_script MUST be in natural, fluent Hindi (Devanagari script).
   - If language is 'hinglish': The teacher_script MUST be in natural conversational Hinglish (e.g. "Aaj hum Ohm's Law samjhenge...").
   - If language is 'en': Natural English.
5. Subject-Aware Visuals:
   - For Mathematics / Physics: Use type='katex' with valid LaTeX formulas (e.g., "V = I \\times R") or type='mermaid' for circuit/flow diagrams.
   - For Programming / Computer Science: Use type='code' with syntax and step comments.
   - For Biology / History / General: Use type='mermaid' for flowcharts/timelines or type='bullet_points' for key takeaways.
6. Checkpoint & Misconception:
   - Must include at least 1 step with step_type='checkpoint'.
   - The checkpoint must include a question, 4 options, the correct_answer, and a misconception_guide describing common student misunderstandings.

You MUST respond strictly with valid JSON conforming to this structure:
{
  "topic": "string",
  "learner_level": "beginner" | "intermediate" | "advanced",
  "target_duration_minutes": number,
  "language": "en" | "hi" | "hinglish",
  "estimated_steps": number,
  "steps": [
    {
      "id": 1,
      "step_type": "intro" | "explanation" | "demonstration" | "checkpoint" | "summary",
      "teacher_script": "What the AI teacher speaks aloud to the student",
      "visual": {
        "type": "katex" | "mermaid" | "code" | "bullet_points",
        "title": "Display Title for Blackboard",
        "content": "formula string, mermaid diagram code, code snippet, or bullet points"
      },
      "question": "Only if checkpoint: Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option matching the correct answer",
      "misconception_guide": "Explanation of common misconceptions students make here"
    }
  ]
}
"""

    user_prompt = f"""
Create a structured lesson plan for:
- Topic: {topic}
- Learner Level: {level}
- Target Duration: {duration_minutes} minutes
- Language: {language}
"""
    if document_context:
        user_prompt += f"\n- Ground your lesson in this source textbook material:\n{document_context[:6000]}"

    # 1. Try Primary: Google Gemini 3.6 Flash
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )
            raw_text = clean_json_string(response.text)
            data = json.loads(raw_text)
            return LessonPlan(**data)
        except Exception as e:
            print(f"Gemini generation error: {e}. Attempting fallback...")

    # 2. Try Fallback: Groq
    if GROQ_KEY:
        try:
            from groq import Groq
            groq_client = Groq(api_key=GROQ_KEY)
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                model="qwen/qwen3.8-27b",
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            raw_text = clean_json_string(chat_completion.choices[0].message.content)
            data = json.loads(raw_text)
            return LessonPlan(**data)
        except Exception as groq_err:
            print(f"Groq fallback error: {groq_err}")

    # 3. Graceful Fallback if both APIs fail
    from services.lesson_service import get_sample_lesson_plan
    return get_sample_lesson_plan(topic=topic, level=level, duration=duration_minutes, language=language)


def evaluate_student_response(
    question: str,
    student_answer: str,
    correct_answer: str,
    misconception_guide: Optional[str] = None,
    language: str = "en"
) -> dict:
    """
    Evaluates student answer with genuine pedagogical intelligence:
    Detects misconceptions, identifies knowledge gaps, and provides an adaptive analogy.
    """
    eval_prompt = f"""
You are ShikshakAI, diagnosing a student's answer to a checkpoint question.

Question: {question}
Correct Answer: {correct_answer}
Misconception Guide: {misconception_guide or "Standard conceptual analysis"}
Student's Answer: {student_answer}
Language: {language}

Diagnose the student's answer:
1. Is it conceptually correct? (true/false)
2. If incorrect, what specific misconception or confusion did the student exhibit?
3. Provide encouraging teacher feedback:
   - If correct: Praise their conceptual grasp and reinforce why it works.
   - If incorrect: Do not simply say 'wrong'. Explain the underlying intuition using a fresh real-world analogy (e.g., water pipe, car traffic, sports, daily life) and guide them to the right path.

Output strictly valid JSON:
{{
  "is_correct": boolean,
  "misconception_detected": boolean,
  "detected_misconception": "string describing misconception if any",
  "feedback": "Conversational, encouraging teacher feedback (in the requested language)",
  "adaptive_action": "proceed" | "re_explain_with_analogy"
}}
"""

    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=eval_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4,
                )
            )
            raw = clean_json_string(response.text)
            return json.loads(raw)
        except Exception as e:
            print(f"Gemini evaluation error: {e}")

    # Fallback to standard check
    is_correct = student_answer.strip().lower() in correct_answer.lower()
    return {
        "is_correct": is_correct,
        "misconception_detected": not is_correct,
        "detected_misconception": "Inverse vs Direct relationship confusion" if not is_correct else None,
        "feedback": "Great understanding!" if is_correct else f"Notice that when resistance increases, it restricts current like a narrow pipe restricts water flow.",
        "adaptive_action": "proceed" if is_correct else "re_explain_with_analogy"
    }
