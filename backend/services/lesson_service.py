from typing import List, Optional
from pydantic import BaseModel

class VisualContent(BaseModel):
    type: str  # "katex" | "mermaid" | "code" | "bullet_points" | "image"
    title: str
    content: str

class LessonStep(BaseModel):
    id: int
    step_type: str  # "intro" | "explanation" | "demonstration" | "checkpoint" | "remediation" | "summary"
    teacher_script: str
    teacher_script_audio_url: Optional[str] = None
    visual: Optional[VisualContent] = None
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    misconception_guide: Optional[str] = None

class LessonPlan(BaseModel):
    topic: str
    learner_level: str  # "beginner" | "intermediate" | "advanced"
    target_duration_minutes: int
    language: str  # "en" | "hi" | "hinglish"
    estimated_steps: int
    steps: List[LessonStep]

def get_sample_lesson_plan(topic: str = "Ohm's Law", level: str = "beginner", duration: int = 20, language: str = "en") -> LessonPlan:
    """
    Returns a structured pedagogical lesson plan adhering to the teacher loop:
    Understand -> Plan -> Explain -> Demonstrate -> Question -> Evaluate -> Adapt -> Continue
    """
    if language.lower() in ["hi", "hindi"]:
        return LessonPlan(
            topic=topic,
            learner_level=level,
            target_duration_minutes=duration,
            language="hi",
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script="नमस्ते! आज हम समझेंगे ओम का नियम (Ohm's Law) - विद्युत धारा और वोल्टेज का सबसे बुनियादी सिद्धांत।",
                    visual=VisualContent(
                        type="mermaid",
                        title="विद्युत परिपथ (Circuit Flow)",
                        content="graph LR\n  Battery[वोल्टेज स्रोत V] -->|Current I| Resistor[प्रतिरोध R]\n  Resistor --> Ground[वापसी पथ]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="ओम के नियम के अनुसार, यदि तापमान स्थिर रहे तो किसी चालक में प्रवाहित धारा उसके सिरों के विभवांतर के समानुपाती होती है।",
                    visual=VisualContent(
                        type="katex",
                        title="मुख्य सूत्र (Core Formula)",
                        content="V = I \\times R \\quad \\implies \\quad I = \\frac{V}{R}"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="चलिए देखते हैं कि आपने कितना समझा! अगर वोल्टेज स्थिर रहे और हम प्रतिरोध (Resistance) बढ़ा दें, तो करंट (Current) पर क्या असर पड़ेगा?",
                    question="यदि वोल्टेज स्थिर हो और प्रतिरोध (R) बढ़ जाए, तो विद्युत धारा (I) का क्या होगा?",
                    options=["करंट बढ़ेगा (Increases)", "करंट घटेगा (Decreases)", "करंट समान रहेगा (Remains same)", "शून्य हो जाएगा (Becomes zero)"],
                    correct_answer="करंट घटेगा (Decreases)",
                    misconception_guide="यदि छात्र 'करंट बढ़ेगा' कहता है, तो वह सीधा संबंध समझ रहा है। पानी के पाइप में रुकावट का उदाहरण देकर समझाएं कि रुकावट बढ़ने से बहाव घटता है।"
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="बहुत बढ़िया! प्रतिरोध धारा के प्रवाह में रुकावट है। जितना ज्यादा प्रतिरोध, उतनी कम धारा।",
                    visual=VisualContent(
                        type="bullet_points",
                        title="मुख्य बातें (Key Takeaways)",
                        content="1. V = I * R (Volts = Amperes * Ohms)\n2. धारा (I) प्रतिरोध (R) के व्युत्क्रमानुपाती होती है\n3. वोल्टेज धक्का है, करंट बहाव है, प्रतिरोध रुकावट है"
                    )
                )
            ]
        )
    
    # Default English / Hinglish
    return LessonPlan(
        topic=topic,
        learner_level=level,
        target_duration_minutes=duration,
        language=language,
        estimated_steps=4,
        steps=[
            LessonStep(
                id=1,
                step_type="intro",
                teacher_script=f"Hello and welcome! Today we will explore {topic}. Whether you're preparing for an exam or building foundational intuition, I'll guide you step by step.",
                visual=VisualContent(
                    type="mermaid",
                    title="Concept Overview",
                    content="graph LR\n  Voltage[Voltage V - Push] -->|Drives| Current[Current I - Flow]\n  Resistance[Resistance R - Friction] -.->|Opposes| Current"
                )
            ),
            LessonStep(
                id=2,
                step_type="demonstration",
                teacher_script="Here is the fundamental relationship. Voltage equals Current times Resistance. If you increase the resistance, it restricts the flow of electric charge.",
                visual=VisualContent(
                    type="katex",
                    title="Ohm's Law Formula",
                    content="V = I \\times R \\quad \\iff \\quad I = \\frac{V}{R}"
                )
            ),
            LessonStep(
                id=3,
                step_type="checkpoint",
                teacher_script="Quick checkpoint to verify your intuition: What happens to current if resistance increases while voltage remains constant?",
                question="What happens to current (I) if resistance (R) increases while voltage (V) remains constant?",
                options=["Current increases", "Current decreases", "Current stays the same", "Resistance drops to zero"],
                correct_answer="Current decreases",
                misconception_guide="If the student answers 'Current increases', explain that resistance is like a narrowing pipe or traffic jam - higher resistance slows down the current."
            ),
            LessonStep(
                id=4,
                step_type="summary",
                teacher_script="Great progress! Remember: Voltage is the electrical pressure, Current is the rate of flow, and Resistance is the opposition to that flow.",
                visual=VisualContent(
                    type="bullet_points",
                    title="Summary & Formula Card",
                    content="• V = I * R (Volts = Amps × Ohms)\n• Current is inversely proportional to Resistance\n• Real-world analogy: Water flowing through a constricted pipe"
                )
            )
        ]
    )
