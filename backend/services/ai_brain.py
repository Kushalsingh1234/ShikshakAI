import os
import json
import re
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from services.lesson_service import LessonPlan, LessonStep, VisualContent, get_sample_lesson_plan

load_dotenv()

def is_valid_key(key: Optional[str]) -> bool:
    if not key:
        return False
    k = key.strip()
    if not k or k.startswith("your_") or "api_key_here" in k or len(k) < 8:
        return False
    return True

def get_gemini_client() -> Optional[genai.Client]:
    api_key = os.getenv("GEMINI_API_KEY")
    if is_valid_key(api_key):
        try:
            return genai.Client(api_key=api_key)
        except Exception as e:
            print(f"Error creating Gemini client: {e}")
            return None
    return None

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
    Generates a structured, adaptive, pedagogical lesson plan using Google Gemini or Groq/OpenAI.
    Follows human educator cycle: Understand -> Plan -> Explain -> Demonstrate -> Question -> Evaluate -> Adapt.
    """
    system_instruction = """
You are ShikshakAI, an elite, highly detailed, empathetic, and master-level AI Professor and Educator.
Your mission is to provide deep, exhaustive, intuitive, and mathematically/conceptually rigorous lessons on the given topic.

CRITICAL PEDAGOGICAL REQUIREMENTS:
1. DEPTH & DETAIL IS MANDATORY:
   - Avoid shallow or 1-sentence summaries.
   - For every single step, the `teacher_script` MUST be a comprehensive, engaging, multi-paragraph master lecture (at least 3-5 rich sentences or paragraphs) explaining:
     a) The first-principles intuition and core definition.
     b) A relatable real-world physical/computational analogy.
     c) Step-by-step mechanisms, variables, or execution flow.
     d) Practical applications and why this matters in real-world systems.
2. RICH VISUAL ARTIFACTS:
   - For Mathematics / Physics: Use type='katex' with complete LaTeX formulas, derivations, and variable definitions, or type='mermaid' with multi-node flowcharts.
   - For Programming / Computer Science: Use type='code' with complete, clean, runnable code snippets with comments and docstrings.
   - For Biology / Chemistry / Science: Use type='mermaid' for detailed reaction/biological pathways or type='bullet_points' for in-depth structured breakdowns.
   - For General / Humanities: Use type='mermaid' for conceptual mind maps or type='bullet_points' for structured analytical pillars.
3. ADAPTIVE CHECKPOINTS:
   - Must include at least 1 rigorous step with step_type='checkpoint'.
   - The checkpoint must include a high-yield conceptual question, 4 realistic options, the correct_answer, and a detailed `misconception_guide` explaining WHY common wrong answers are incorrect and how to reason to the right answer.
4. TONE & MULTILINGUAL:
   - If language is 'hi' (Hindi): The teacher_script MUST be in rich, natural, fluent academic Hindi (Devanagari script).
   - If language is 'hinglish': The teacher_script MUST be in engaging conversational Hinglish.
   - If language is 'en': Highly articulate, clear, encouraging English.

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
      "teacher_script": "Comprehensive multi-paragraph spoken lecture by the AI professor",
      "visual": {
        "type": "katex" | "mermaid" | "code" | "bullet_points",
        "title": "Display Title for Blackboard",
        "content": "formula string, mermaid diagram code, code snippet, or bullet points"
      },
      "question": "Only if checkpoint: Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option matching the correct answer",
      "misconception_guide": "In-depth explanation of common student misconceptions and the intuitive fix"
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

    # 1. Try Primary: Google Gemini (gemini-2.0-flash with fallback to gemini-1.5-flash)
    gemini_client = get_gemini_client()
    if gemini_client:
        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = gemini_client.models.generate_content(
                    model=model_name,
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
                print(f"Gemini generation error with {model_name}: {e}. Trying next...")

    # 2. Try Fallback: Groq or OpenAI via installed openai package
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if is_valid_key(groq_key):
        try:
            from openai import OpenAI
            groq_client = OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            raw_text = clean_json_string(chat_completion.choices[0].message.content)
            data = json.loads(raw_text)
            return LessonPlan(**data)
        except Exception as groq_err:
            print(f"Groq fallback error: {groq_err}")

    if is_valid_key(openai_key):
        try:
            from openai import OpenAI
            oa_client = OpenAI(api_key=openai_key)
            chat_completion = oa_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            raw_text = clean_json_string(chat_completion.choices[0].message.content)
            data = json.loads(raw_text)
            return LessonPlan(**data)
        except Exception as oa_err:
            print(f"OpenAI fallback error: {oa_err}")

    # 3. Graceful Subject-Aware Pedagogical Synthesizer (Zero-API Fallback)
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
   - If incorrect: Do not simply say 'wrong'. Explain the underlying intuition using a fresh real-world analogy and guide them to the right path.

Output strictly valid JSON:
{{
  "is_correct": boolean,
  "misconception_detected": boolean,
  "detected_misconception": "string describing misconception if any",
  "feedback": "Conversational, encouraging teacher feedback (in the requested language)",
  "adaptive_action": "proceed" | "re_explain_with_analogy"
}}
"""

    gemini_client = get_gemini_client()
    if gemini_client:
        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=eval_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.4,
                    )
                )
                raw = clean_json_string(response.text)
                return json.loads(raw)
            except Exception as e:
                print(f"Gemini evaluation error with {model_name}: {e}")

    # Fallback to Groq / OpenAI if configured
    groq_key = os.getenv("GROQ_API_KEY")
    if is_valid_key(groq_key):
        try:
            from openai import OpenAI
            groq_client = OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are ShikshakAI, an empathetic educator providing constructive feedback."},
                    {"role": "user", "content": eval_prompt}
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.4,
            )
            raw = clean_json_string(chat_completion.choices[0].message.content)
            return json.loads(raw)
        except Exception as e:
            print(f"Groq evaluation error: {e}")

    # Intelligent Local Pedagogical Diagnostician (No pre-recorded Ohm's law!)
    norm_student = student_answer.strip().lower()
    norm_correct = correct_answer.strip().lower()

    # Strip prefixes like "A)", "Option A: ", etc.
    clean_s = re.sub(r"^[a-d][\)\.:\-]\s*", "", norm_student)
    clean_c = re.sub(r"^[a-d][\)\.:\-]\s*", "", norm_correct)

    is_correct = (
        clean_s == clean_c or
        clean_s in clean_c or
        clean_c in clean_s or
        norm_student == norm_correct
    )

    # Check if student answered with single letter option (e.g., 'A', 'B') matching the answer
    if len(norm_student) == 1 and norm_student in "abcd":
        is_correct = norm_correct.startswith(norm_student)

    lang_lower = (language or "en").lower()

    if is_correct:
        if lang_lower == "hi":
            feedback = f"बहुत बढ़िया! '{correct_answer}' बिल्कुल सही उत्तर है। आपने इस सिद्धांत को गहराई से समझ लिया है।"
        elif lang_lower == "hinglish":
            feedback = f"Shabash! '{correct_answer}' bilkul correct answer hai. Aapka concept bilkul clear hai."
        else:
            feedback = f"Spot on! '{correct_answer}' is completely correct. You've grasped the underlying concept accurately."

        return {
            "is_correct": True,
            "misconception_detected": False,
            "detected_misconception": None,
            "feedback": feedback,
            "adaptive_action": "proceed"
        }
    else:
        # Build contextual misconception feedback tailored to this specific question
        if misconception_guide and misconception_guide.strip():
            guide_text = misconception_guide.strip()
            if lang_lower == "hi":
                feedback = f"ध्यान दें: आपने '{student_answer}' चुना। {guide_text} अतः सही उत्तर '{correct_answer}' है।"
            elif lang_lower == "hinglish":
                feedback = f"Thoda dhyan dijiye: aapne '{student_answer}' select kiya. {guide_text} Isliye sahi answer '{correct_answer}' hai."
            else:
                feedback = f"Not quite. You selected '{student_answer}'. {guide_text} Therefore, the accurate answer is '{correct_answer}'."
            detected_disc = guide_text
        else:
            if lang_lower == "hi":
                feedback = f"आइए इसे फिर से समझें। आपने '{student_answer}' चुना, जबकि सही उत्तर '{correct_answer}' है।"
            elif lang_lower == "hinglish":
                feedback = f"Chaliye isko dobara dekhte hain. Aapne '{student_answer}' choose kiya, par sahi concept '{correct_answer}' hai."
            else:
                feedback = f"Let's reflect on this. You selected '{student_answer}', but the correct answer is '{correct_answer}'."
            detected_disc = f"Conceptual mismatch between '{student_answer}' and expected '{correct_answer}'"

        return {
            "is_correct": False,
            "misconception_detected": True,
            "detected_misconception": detected_disc,
            "feedback": feedback,
            "adaptive_action": "re_explain_with_analogy"
        }
