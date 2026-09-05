#!/usr/bin/env python3
"""
ShikshakAI Comprehensive Project Documentation PDF Generator
Uses ReportLab Platypus to build an executive-grade, beautifully formatted PDF document.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Unicode Font if available on the system
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

unicode_font_path = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
if os.path.exists(unicode_font_path):
    try:
        pdfmetrics.registerFont(TTFont("ArialUnicode", unicode_font_path))
        FONT_REGULAR = "ArialUnicode"
        FONT_BOLD = "ArialUnicode"
        FONT_OBLIQUE = "ArialUnicode"
    except Exception as e:
        print(f"Notice: Unicode font registration fallback: {e}")

# ----------------------------------------------------------------------
# NumberedCanvas for Two-Pass "Page X of Y" and Running Headers/Footers
# ----------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Skip header and footer on the cover page (Page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont(FONT_BOLD, 8)
        self.setFillColor(colors.HexColor("#4338ca"))

        # Running Header
        self.drawString(54, 752, "SHIKSHAK AI (शिक्षक AI)")
        self.setFont(FONT_REGULAR, 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(558, 752, "Technical Architecture & System Documentation")

        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(54, 744, 558, 744)

        # Running Footer
        self.line(54, 44, 558, 44)
        self.setFont(FONT_REGULAR, 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 32, "AI Innovation Hackathon 2026 — Round 2 Solution | Zero-Cost Adaptive Educator")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)

        self.restoreState()


# ----------------------------------------------------------------------
# Typography & Visual Styles
# ----------------------------------------------------------------------
def build_styles():
    base = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CoverTitle",
        parent=base["Title"],
        fontName=FONT_BOLD,
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#1e1b4b"),
        alignment=0,
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=base["Normal"],
        fontName=FONT_REGULAR,
        fontSize=12.5,
        leading=17,
        textColor=colors.HexColor("#4338ca"),
        alignment=0,
        spaceAfter=14,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=base["Heading1"],
        fontName=FONT_BOLD,
        fontSize=13.5,
        leading=17,
        textColor=colors.HexColor("#1e1b4b"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=base["Heading2"],
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#312e81"),
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=base["Normal"],
        fontName=FONT_REGULAR,
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=5,
    )

    bullet_style = ParagraphStyle(
        "DocBullet",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3,
    )

    callout_style = ParagraphStyle(
        "DocCallout",
        parent=body_style,
        fontName=FONT_OBLIQUE,
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#1e1b4b"),
    )

    code_style = ParagraphStyle(
        "DocCode",
        parent=base["Normal"],
        fontName="Courier",
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#f8fafc"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=base["Normal"],
        fontName=FONT_BOLD,
        fontSize=8,
        leading=10.5,
        textColor=colors.white,
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=base["Normal"],
        fontName=FONT_REGULAR,
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell_style,
        fontName=FONT_BOLD,
        textColor=colors.HexColor("#0f172a"),
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "h1": h1_style,
        "h2": h2_style,
        "body": body_style,
        "bullet": bullet_style,
        "callout": callout_style,
        "code": code_style,
        "table_header": table_header_style,
        "table_cell": table_cell_style,
        "table_cell_bold": table_cell_bold,
    }


def make_callout(text, styles, title="KEY INSIGHT"):
    content = [
        Paragraph(f"<b>{title}:</b> {text}", styles["callout"])
    ]
    t = Table([[content]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINELEFT', (0, 0), (0, -1), 3, colors.HexColor("#4f46e5")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#c7d2fe")),
    ]))
    return t


def make_code_box(code_text, styles):
    lines = code_text.strip().split("\n")
    p_lines = [Paragraph(line.replace(" ", "&nbsp;").replace("<", "&lt;").replace(">", "&gt;"), styles["code"]) for line in lines]
    t = Table([[p_lines]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0f172a")),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
    ]))
    return t


def make_section_header(title, styles):
    return [
        Paragraph(title, styles["h1"]),
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceBefore=2, spaceAfter=6)
    ]


# ----------------------------------------------------------------------
# Master Story Builder
# ----------------------------------------------------------------------
def build_pdf(filename="ShikshakAI_Project_Documentation.pdf"):
    styles = build_styles()
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    story = []

    # ==================================================================
    # COVER PAGE
    # ==================================================================
    story.append(Spacer(1, 14))

    badge_data = [[Paragraph("<b>AI INNOVATION HACKATHON 2026 — ROUND 2 TECHNICAL ASSESSMENT</b>", styles["callout"])]]
    badge_table = Table(badge_data, colWidths=[504])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#86efac")),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("ShikshakAI (शिक्षक AI)", styles["title"]))
    story.append(Paragraph("The Adaptive Human-Like AI Educator That Teaches Through Video", styles["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#4338ca"), spaceBefore=0, spaceAfter=12))

    exec_summary_text = (
        "ShikshakAI transforms textbooks, notes, research papers, presentations, or direct topic prompts "
        "into a structured, personalized, audiovisual classroom. Featuring animated, lip-synced AI teacher "
        "personas, a subject-aware smartboard (KaTeX derivations, interactive code sandboxes, 3D flashcards), "
        "real-time misconception diagnosis, and personalized 7-day revision roadmaps, ShikshakAI emulates "
        "the cognitive behavior of a master 1-on-1 human educator at a 100% zero operational cost."
    )
    story.append(Paragraph(exec_summary_text, styles["body"]))
    story.append(Spacer(1, 10))

    meta_data = [
        [Paragraph("Project Attribute", styles["table_header"]), Paragraph("Technical Specification", styles["table_header"])],
        [Paragraph("Challenge Title", styles["table_cell_bold"]), Paragraph("AI Teacher: Build a Human-Like AI Educator That Teaches Through Video", styles["table_cell"])],
        [Paragraph("Full-Stack Architecture", styles["table_cell_bold"]), Paragraph("FastAPI (Python 3.10+) Backend + React 19 / Vite 8 Frontend Stage", styles["table_cell"])],
        [Paragraph("Primary AI Brain", styles["table_cell_bold"]), Paragraph("Google Gemini 2.0 Flash (google-genai SDK) with JSON Schema Constraints", styles["table_cell"])],
        [Paragraph("Secondary / Critic AI", styles["table_cell_bold"]), Paragraph("Groq LPUs (Qwen 3.6 / Llama 3.3 / GPT-OSS) for Real-Time Critic QA", styles["table_cell"])],
        [Paragraph("Knowledge Grounding (RAG)", styles["table_cell_bold"]), Paragraph("PyPDF, python-docx, python-pptx extraction + ChromaDB Vector Grounding", styles["table_cell"])],
        [Paragraph("Neural Speech Synthesis", styles["table_cell_bold"]), Paragraph("Microsoft Edge-TTS (Multi-Voice, In-Memory Base64 MP3 Audio Streaming)", styles["table_cell"])],
        [Paragraph("Avatar & Lip-Sync Engine", styles["table_cell_bold"]), Paragraph("Vector SVG Teacher Models with Web Audio API 60 FPS Direct-DOM Lip-Sync", styles["table_cell"])],
        [Paragraph("Interactive Smartboard", styles["table_cell_bold"]), Paragraph("KaTeX Equations, Live Code Runner, 3D Flashcards, Mermaid Mindmaps", styles["table_cell"])],
        [Paragraph("Multilingual Coverage", styles["table_cell_bold"]), Paragraph("English (en-IN / en-US), Hindi (हिंदी), and Hinglish (Code-Switching)", styles["table_cell"])],
        [Paragraph("Operating Cost", styles["table_cell_bold"]), Paragraph("<b>$0.00 / month</b> (100% Zero-Cost Open Production Stack Architecture)", styles["table_cell"])],
        [Paragraph("Track Leads & Team", styles["table_cell_bold"]), Paragraph("<b>Kushal Singh</b> (Track A: Backend AI Brain) & <b>Jatin Rawat</b> (Track B: Frontend Classroom)", styles["table_cell"])],
    ]
    t_meta = Table(meta_data, colWidths=[140, 364])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    callout_zero = (
        "Zero-Cost Production Guarantee: ShikshakAI delivers industrial-grade AI performance with $0 cloud bills "
        "by utilizing Gemini 2.0 Flash's free tier, Microsoft Edge-TTS's unlimited neural voices, client-side Web Speech "
        "recognition, local ChromaDB embeddings, and browser-native MediaRecorder canvas capture."
    )
    story.append(make_callout(callout_zero, styles, "ZERO-BUDGET ARCHITECTURE"))

    story.append(PageBreak())

    # ==================================================================
    # TABLE OF CONTENTS
    # ==================================================================
    story.extend(make_section_header("Table of Contents", styles))
    toc_data = [
        [Paragraph("1. Problem Statement & Educational Disconnect", styles["table_cell_bold"]), Paragraph("Section 1", styles["table_cell"])],
        [Paragraph("2. Solution Overview & The 8-Stage Teaching Pipeline", styles["table_cell_bold"]), Paragraph("Section 2", styles["table_cell"])],
        [Paragraph("3. Key Features & Virtual Classroom Capabilities", styles["table_cell_bold"]), Paragraph("Section 3", styles["table_cell"])],
        [Paragraph("4. System Architecture & End-to-End Component Flow", styles["table_cell_bold"]), Paragraph("Section 4", styles["table_cell"])],
        [Paragraph("5. AI/ML Models Used & LLM Orchestration", styles["table_cell_bold"]), Paragraph("Section 5", styles["table_cell"])],
        [Paragraph("6. RAG (Retrieval-Augmented Generation) Implementation", styles["table_cell_bold"]), Paragraph("Section 6", styles["table_cell"])],
        [Paragraph("7. Prompt & Agent Architecture (Storyboard Engine & Critic)", styles["table_cell_bold"]), Paragraph("Section 7", styles["table_cell"])],
        [Paragraph("8. Personalization Approach & Dynamic Branching State Machine", styles["table_cell_bold"]), Paragraph("Section 8", styles["table_cell"])],
        [Paragraph("9. Assessment Methodology, Diagnostics & 7-Day Roadmap", styles["table_cell_bold"]), Paragraph("Section 9", styles["table_cell"])],
        [Paragraph("10. Multilingual Implementation (English, Hindi, Hinglish)", styles["table_cell_bold"]), Paragraph("Section 10", styles["table_cell"])],
        [Paragraph("11. Voice Implementation & Spoken Prose Pre-Processing", styles["table_cell_bold"]), Paragraph("Section 11", styles["table_cell"])],
        [Paragraph("12. Avatar Engine & Audiovisual Video Generation", styles["table_cell_bold"]), Paragraph("Section 12", styles["table_cell"])],
        [Paragraph("13. APIs and Third-Party Services Specification", styles["table_cell_bold"]), Paragraph("Section 13", styles["table_cell"])],
        [Paragraph("14. Setup & Local Installation Instructions", styles["table_cell_bold"]), Paragraph("Section 14", styles["table_cell"])],
        [Paragraph("15. Production Deployment Instructions (Docker & Vercel)", styles["table_cell_bold"]), Paragraph("Section 15", styles["table_cell"])],
        [Paragraph("16. Known Limitations & Future Technical Roadmap", styles["table_cell_bold"]), Paragraph("Section 16", styles["table_cell"])],
    ]
    t_toc = Table(toc_data, colWidths=[420, 84])
    t_toc.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(t_toc)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 1. PROBLEM STATEMENT
    # ==================================================================
    story.extend(make_section_header("1. Problem Statement", styles))
    story.append(Paragraph(
        "Modern digital learning remains polarized into two distinct paradigms that each fail to replicate the effectiveness of a master human educator:",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>1. Pre-Recorded Static Video Lectures (Coursera, YouTube, MOOCs):</b><br/>"
        "• Non-Adaptive: Delivered at a uniform, rigid pace regardless of learner confusion or prior knowledge.<br/>"
        "• Zero Active Feedback: Cannot determine whether a student understands a derivation or harbors subtle misconceptions.<br/>"
        "• Passive Consumption: Encourages superficial watching without interactive derivation stepping or code execution.<br/>"
        "• High Attrition: Global completion rates hover below 8–10% across MOOC platforms.",
        styles["bullet"]
    ))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        "<b>2. Generic Text-Only Chatbots (ChatGPT, Claude, Q&A Assistants):</b><br/>"
        "• Text Walls: Overwhelms students with unbroken blocks of text lacking pedagogical pacing or vocal tone.<br/>"
        "• Absence of Visual Grounding: Fails to provide synchronized formulas, live code sandboxes, diagrams, or memory mnemonics.<br/>"
        "• Lack of Presence & Empathy: No eye contact, expressive gesturing, or reassuring neural voice modulation.<br/>"
        "• Passive Q&A Loop: Relies entirely on the student to identify what they do not know and ask the right questions.",
        styles["bullet"]
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>The Socioeconomic Tutoring Gap:</b> Bloom's 2 Sigma Problem demonstrated that 1-on-1 personalized tutoring elevates student achievement by two standard deviations (over 98% of classroom peers). Yet high-quality human tutors cost $30–$100 per hour, making personalized learning a privilege for the few. ShikshakAI democratizes masterclass 1-on-1 virtual education at zero cost.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 2. SOLUTION OVERVIEW
    # ==================================================================
    story.extend(make_section_header("2. Solution Overview", styles))
    story.append(Paragraph(
        "<b>ShikshakAI (शिक्षक AI)</b> is an autonomous, adaptive virtual classroom where an AI teacher instructs students through synchronized neural speech, dynamic blackboard visuals, interactive checkpoints, and lip-synced teacher avatars.",
        styles["body"]
    ))
    story.append(Paragraph(
        "Rather than operating as a simple query-response chatbot, ShikshakAI implements a <b>deterministic pedagogical state machine</b> spanning 8 interconnected phases:",
        styles["body"]
    ))

    pipeline_data = [
        [Paragraph("Stage", styles["table_header"]), Paragraph("Phase Name", styles["table_header"]), Paragraph("Pedagogical Functionality & Technical Implementation", styles["table_header"])],
        [Paragraph("1", styles["table_cell_bold"]), Paragraph("Understand", styles["table_cell_bold"]), Paragraph("Ingests textbooks, PDFs, PPTX slides, notes, or topic queries via pypdf / python-docx / ChromaDB vector search to extract core concepts.", styles["table_cell"])],
        [Paragraph("2", styles["table_cell_bold"]), Paragraph("Plan", styles["table_cell_bold"]), Paragraph("Generates a structured visual teaching storyboard with clear scene objectives, durations, visual component types, and checkpoints.", styles["table_cell"])],
        [Paragraph("3", styles["table_cell_bold"]), Paragraph("Explain", styles["table_cell_bold"]), Paragraph("Synthesizes natural spoken explanations via Edge-TTS with persona-matched inflection in English, Hindi, or Hinglish.", styles["table_cell"])],
        [Paragraph("4", styles["table_cell_bold"]), Paragraph("Demonstrate", styles["table_cell_bold"]), Paragraph("Renders synchronized smartboard visuals including step-by-step KaTeX derivations, live code runners, 3D flashcards, and Mermaid mindmaps.", styles["table_cell"])],
        [Paragraph("5", styles["table_cell_bold"]), Paragraph("Question", styles["table_cell_bold"]), Paragraph("Engages the student mid-lesson through Socratic checkpoints requiring multiple-choice, text, or voice responses.", styles["table_cell"])],
        [Paragraph("6", styles["table_cell_bold"]), Paragraph("Evaluate", styles["table_cell_bold"]), Paragraph("Diagnoses student answers via LLM pedagogical critic to identify not just correctness, but the exact conceptual misconception.", styles["table_cell"])],
        [Paragraph("7", styles["table_cell_bold"]), Paragraph("Adapt", styles["table_cell_bold"]), Paragraph("Dynamically generates and splices remedial scenes featuring physical balance analogies, counter-examples, or alternative visual breakdowns.", styles["table_cell"])],
        [Paragraph("8", styles["table_cell_bold"]), Paragraph("Continue", styles["table_cell_bold"]), Paragraph("Advances through the lesson, updates real-time analytics, generates a 7-day spaced repetition revision roadmap, and exports WebM video.", styles["table_cell"])],
    ]
    t_pipe = Table(pipeline_data, colWidths=[32, 75, 397])
    t_pipe.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_pipe)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 3. KEY FEATURES
    # ==================================================================
    story.extend(make_section_header("3. Key Features", styles))

    story.append(Paragraph("<b>3.1 Multiple Expressive Teacher Personas:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>Dr. Maya (Physics & Mathematics Specialist):</b> Analytical, structured, Socratic teaching style; styled in a formal navy blazer, sleek glasses, and professional demeanor.<br/>"
        "• <b>Prof. Alex (Computer Science & AI Engineer):</b> Practical, code-focused, energetic approach; styled with a dark hoodie, headset, and technical focus.<br/>"
        "• <b>Ananya Ma'am (Humanities, Literature & Hindi Mentor):</b> Empathetic, warm, narrative storytelling tone; styled in traditional attire with expressive pacing.<br/>"
        "• <b>Acoustic Lip-Sync & Blinking:</b> Direct-DOM frequency-driven mouth animation at 60 FPS synchronized to audio syllables, with natural 4.2-second eye-blinking intervals.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>3.2 Subject-Aware Interactive Smartboard:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>Step-by-Step KaTeX Derivations:</b> Mathematical breakdown with sequential step progress, formula annotations, and interactive sliders.<br/>"
        "• <b>Interactive Code Sandbox Runner:</b> In-browser code runner featuring syntax highlighting, line numbers, live simulated execution terminal, status output, and variable watch.<br/>"
        "• <b>3D Interactive Revision Flashcards:</b> Click-to-flip 3D cards with memory mnemonics, front/back perspectives, and mastery tracking ('Mark as Understood').<br/>"
        "• <b>Mermaid Concept Mindmaps:</b> Instant workflow diagrams, decision trees, and hierarchical relationship maps.<br/>"
        "• <b>Specialized Visual Domain Renderers:</b> Balance beams for algebraic equivalence, physics circuit/gravity simulations, and biochemical reaction flows.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>3.3 Misconception Detection & Active Dynamic Adaptation:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>Multi-Modal Student Input:</b> Students respond via click selection, typed natural language, or voice input (Web Speech API).<br/>"
        "• <b>Pedagogical Diagnostician:</b> Detects faulty mental models (e.g., confusing current with resistance).<br/>"
        "• <b>Dynamic Remediation Splicing:</b> Automatically generates and splices a targeted remediation scene with physical analogies before advancing.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>3.4 Learning Analytics, 7-Day Spaced Repetition & Video Export:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>Radial Mastery Gauge:</b> Real-time accuracy gauge tracking correct responses and conceptual progress.<br/>"
        "• <b>7-Day Retention Roadmap:</b> Day-by-day revision milestones (Recall, Derivation, Misconception Busting, Code Drills, Interleaving, Timed Drill, Feynman Check).<br/>"
        "• <b>In-Browser Video Recording:</b> MediaRecorder API captures visuals, avatar animations, and neural audio into downloadable .webm video.",
        styles["bullet"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 4. SYSTEM ARCHITECTURE
    # ==================================================================
    story.extend(make_section_header("4. System Architecture", styles))
    story.append(Paragraph(
        "ShikshakAI operates as a cohesive full-stack decoupled architecture optimized for sub-second responsiveness, zero operational cost, and cloud/serverless readiness.",
        styles["body"]
    ))

    arch_data = [
        [Paragraph("Subsystem Layer", styles["table_header"]), Paragraph("Primary Technologies", styles["table_header"]), Paragraph("Architectural Responsibilities", styles["table_header"])],
        [Paragraph("Frontend Stage (Track B)", styles["table_cell_bold"]), Paragraph("React 19, Vite 8, Vanilla CSS3, Lucide-React", styles["table_cell"]) , Paragraph("Virtual classroom UI, stage management, stateful timeline stepper, navigation views.", styles["table_cell"])],
        [Paragraph("Avatar & Visuals", styles["table_cell_bold"]), Paragraph("SVG Vector Engine, Web Audio API, KaTeX, Mermaid.js", styles["table_cell"]), Paragraph("60 FPS Direct-DOM lip-sync, LaTeX formula rendering, interactive code sandbox, 3D card transforms.", styles["table_cell"])],
        [Paragraph("Backend AI Brain (Track A)", styles["table_cell_bold"]), Paragraph("FastAPI, Uvicorn, Pydantic V2, aiofiles", styles["table_cell"]), Paragraph("Asynchronous REST router, pedagogical state engine, JSON schema validation, in-memory session caching.", styles["table_cell"])],
        [Paragraph("AI Storyboard & LLMs", styles["table_cell_bold"]), Paragraph("Google Gemini 2.0 Flash, Groq LPUs, google-genai", styles["table_cell"]), Paragraph("Visual storyboard planning, AI critic validation pass, student response diagnosis, adaptive scene generation.", styles["table_cell"])],
        [Paragraph("RAG Knowledge Store", styles["table_cell_bold"]), Paragraph("pypdf, python-docx, python-pptx, ChromaDB", styles["table_cell"]), Paragraph("Document extraction, chunking, slide indexing, semantic retrieval, and grounding prompt injection.", styles["table_cell"])],
        [Paragraph("Speech & Neural TTS", styles["table_cell_bold"]), Paragraph("Microsoft Edge-TTS, Web Speech API", styles["table_cell"]), Paragraph("Regex spoken prose pre-processing, in-memory Base64 MP3 audio streaming, client-side voice input.", styles["table_cell"])],
        [Paragraph("Media & Capture", styles["table_cell_bold"]), Paragraph("HTML5 MediaRecorder API, Canvas Audio Loop", styles["table_cell"]), Paragraph("In-browser screen and audio capture, client-side WebM video export without cloud GPU rendering.", styles["table_cell"])],
    ]
    t_arch = Table(arch_data, colWidths=[115, 145, 244])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 5. AI/ML MODELS USED
    # ==================================================================
    story.extend(make_section_header("5. AI/ML Models Used", styles))
    story.append(Paragraph(
        "ShikshakAI incorporates a multi-tiered ensemble of state-of-the-art AI/ML models:",
        styles["body"]
    ))

    story.append(Paragraph("<b>5.1 Primary Pedagogical LLM: Google Gemini 2.0 Flash</b>", styles["h2"]))
    story.append(Paragraph(
        "Accessed via the official <code>google-genai</code> Python SDK. Configured with <code>response_mime_type='application/json'</code> and temperature 0.4. Responsible for transforming raw topic queries and extracted textbook chapters into strictly validated visual teaching storyboards, conducting misconception diagnostics, and generating adaptive remediation scenes.",
        styles["body"]
    ))

    story.append(Paragraph("<b>5.2 Secondary / AI Critic LLM: Groq Hosted Open Weights</b>", styles["h2"]))
    story.append(Paragraph(
        "Powered by ultra-fast Groq LPUs executing <code>qwen/qwen3.6-27b</code>, <code>llama-3.3-70b-versatile</code>, and <code>openai/gpt-oss-20b</code>. Serves two critical functions: (1) Running a pedagogical critic pass that inspects generated storyboards for factual accuracy and visual density, and (2) Acting as an automatic fallback LLM when Gemini API quotas are exhausted.",
        styles["body"]
    ))

    story.append(Paragraph("<b>5.3 Neural Acoustic Speech Synthesizers: Microsoft Edge-TTS</b>", styles["h2"]))
    story.append(Paragraph(
        "Executes Microsoft's cutting-edge neural TTS models (e.g., <code>en-IN-NeerjaNeural</code>, <code>en-IN-PrabhatNeural</code>, <code>hi-IN-SwaraNeural</code>, <code>hi-IN-MadhurNeural</code>, <code>hi-IN-KavyaNeural</code>). Provides lifelike prosody, natural breathing pauses, and accurate Indian accent inflections at zero cost.",
        styles["body"]
    ))

    story.append(Paragraph("<b>5.4 Browser Automatic Speech Recognition (ASR): Web Speech API</b>", styles["h2"]))
    story.append(Paragraph(
        "Client-side speech-to-text inference running locally on the user's browser (<code>webkitSpeechRecognition</code>). Supports real-time transcription in English (<code>en-IN</code>) and Hindi (<code>hi-IN</code>) with zero server latency and zero API cost.",
        styles["body"]
    ))

    story.append(Paragraph("<b>5.5 Intelligent Subject-Aware Fallback Synthesizer</b>", styles["h2"]))
    story.append(Paragraph(
        "A deterministic, rule-based algorithmic synthesizer that generates rich, subject-aware lesson plans across Linear Algebra, Physics (Ohm's Law, Hooke's Law), Computer Science (Binary Search, C Programming), and Biology (Photosynthesis) ensuring 100% platform availability even when completely offline or unkeyed.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 6. RAG IMPLEMENTATION
    # ==================================================================
    story.extend(make_section_header("6. RAG (Retrieval-Augmented Generation) Implementation", styles))
    story.append(Paragraph(
        "ShikshakAI's RAG pipeline enables students to upload real-world educational resources and receive accurate, grounded virtual lessons without hallucination:",
        styles["body"]
    ))

    story.append(Paragraph(
        "<b>1. Multi-Format Ingestion Pipeline:</b><br/>"
        "• <b>PDF Extraction:</b> Uses <code>pypdf.PdfReader</code> to extract text page-by-page with page-boundary metadata.<br/>"
        "• <b>Word Extraction:</b> Uses <code>docx.Document</code> to extract paragraph text, headings, and assignments.<br/>"
        "• <b>PowerPoint Slide Extraction:</b> Uses <code>pptx.Presentation</code> to parse slide shape texts and deck structure.<br/>"
        "• <b>Plain Text:</b> Direct UTF-8 ingestion with fallback character encoding tolerance.",
        styles["bullet"]
    ))

    story.append(Paragraph(
        "<b>2. Vector Indexing & Active Grounding:</b><br/>"
        "• Ingested content is indexed into a local <b>ChromaDB</b> vector store and cached in the active session map (<code>ACTIVE_DOCUMENTS</code>).<br/>"
        "• When a lesson plan is requested, up to <b>6,000 characters</b> of extracted textbook material are injected directly into the planning prompt.<br/>"
        "• The LLM is strictly instructed: <i>'Ground your visual lesson in this source textbook material... do not introduce contradictory external concepts.'</i>",
        styles["bullet"]
    ))

    story.append(make_callout(
        "Hallucination Minimization: By anchoring the visual director prompt to extracted document text and enforcing verifiable definitions, formulas, and diagrams, ShikshakAI delivers strictly syllabus-compliant instruction.",
        styles,
        "GROUNDED RAG COMPLIANCE"
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 7. PROMPT & AGENT ARCHITECTURE
    # ==================================================================
    story.extend(make_section_header("7. Prompt & Agent Architecture", styles))
    story.append(Paragraph(
        "The AI Brain is structured around modular, specialized prompt agents that collaborate to choreograph lessons:",
        styles["body"]
    ))

    story.append(Paragraph("<b>7.1 Master Visual Director Agent (STORYBOARD_SYSTEM_PROMPT):</b>", styles["h2"]))
    story.append(Paragraph(
        "Enforces the fundamental visual-first philosophy: <i>'Your job is NOT to write an essay or a ChatGPT chat answer. Your job is to design a VISUAL TEACHING STORY where the student understands the concept primarily by WATCHING.'</i>",
        styles["body"]
    ))
    story.append(Paragraph(
        "• <b>Component Catalog:</b> Enforces mapping each scene to one valid component: <code>ConceptReveal</code>, <code>StepByStep</code>, <code>EquationBuild</code>, <code>CodeExecution</code>, <code>DataStructure</code>, <code>ProcessFlow</code>, <code>Comparison</code>, <code>Molecule</code>, <code>Anatomy</code>, <code>Summary</code>.<br/>"
        "• <b>Visual Hierarchy:</b> Enforces 1 primary objective per scene and minimal on-screen text.<br/>"
        "• <b>Narration Purity:</b> Prohibits raw Markdown symbols and LaTeX code in spoken narration strings.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>7.2 Validator & Auto-Repair Engine:</b>", styles["h2"]))
    story.append(Paragraph(
        "The <code>validate_and_repair_storyboard()</code> function guarantees that even malformed LLM outputs are repaired deterministically: normalizes difficulty, infers missing subjects, repairs component names, removes illegal narration characters, and ensures non-empty visual element coordinates.",
        styles["body"]
    ))

    story.append(Paragraph("<b>7.3 AI Critic Pass (run_ai_critic_pass):</b>", styles["h2"]))
    story.append(Paragraph(
        "A secondary inspection agent executes over Groq LPUs. It verifies factual accuracy, confirms that text has been converted into visual structures, validates component choices, and verifies narration purity within a strict 6-second timeout window.",
        styles["body"]
    ))

    story.append(Paragraph("<b>7.4 Pedagogical Misconception Diagnostician Agent:</b>", styles["h2"]))
    story.append(Paragraph(
        "The <code>evaluate_student_response()</code> agent receives the question, correct answer, misconception guide, and student answer. It diagnoses whether the answer is conceptually sound, identifies the specific misconception, provides encouraging feedback with a fresh analogy, and emits an <code>adaptive_action</code> (<code>'proceed'</code> or <code>'re_explain_with_analogy'</code>).",
        styles["body"]
    ))

    story.append(Paragraph("<b>7.5 Contextual In-Studio Doubt Agent (ask_contextual_teacher):</b>", styles["h2"]))
    story.append(Paragraph(
        "Accepts live student questions during active scenes, conditioned on the active scene title and on-screen visual payload, returning concise, context-aware answers delivered strictly in the selected teacher persona.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 8. PERSONALIZATION APPROACH
    # ==================================================================
    story.extend(make_section_header("8. Personalization Approach", styles))
    story.append(Paragraph(
        "ShikshakAI adapts dynamically to each learner across multiple pedagogical dimensions:",
        styles["body"]
    ))

    pers_data = [
        [Paragraph("Dimension", styles["table_header"]), Paragraph("Options / Range", styles["table_header"]), Paragraph("Pedagogical Adaptation Mechanism", styles["table_header"])],
        [Paragraph("Learner Level", styles["table_cell_bold"]), Paragraph("Beginner, Intermediate, Advanced", styles["table_cell"]), Paragraph("Beginner: Simple analogies, foundational terminology. Advanced: Mathematical derivations, code implementations, formal edge cases.", styles["table_cell"])],
        [Paragraph("Time Budget", styles["table_cell_bold"]), Paragraph("5 mins, 20 mins, 60 mins", styles["table_cell"]), Paragraph("5 min: High-yield concept summary. 20 min: Standard 6-scene lesson with checkpoint. 60 min: Comprehensive multi-step derivations and labs.", styles["table_cell"])],
        [Paragraph("Teacher Persona", styles["table_cell_bold"]), Paragraph("Dr. Maya, Prof. Alex, Ananya Ma'am", styles["table_cell"]), Paragraph("Dr. Maya: Structured, analytical Socratic. Prof. Alex: Practical, code-focused, energetic. Ananya Ma'am: Warm, empathetic storytelling.", styles["table_cell"])],
        [Paragraph("Language Preference", styles["table_cell_bold"]), Paragraph("English, Hindi (हिंदी), Hinglish", styles["table_cell"]), Paragraph("Translates prompts, explanations, checkpoints, and routes to authentic native neural voice accents.", styles["table_cell"])],
        [Paragraph("Dynamic Branching", styles["table_cell_bold"]), Paragraph("Real-Time Misconception Splicing", styles["table_cell"]), Paragraph("When a student fails a checkpoint, an adaptive remediation scene (e.g. balance scale analogy) is spliced immediately into the lesson graph.", styles["table_cell"])],
    ]
    t_pers = Table(pers_data, colWidths=[105, 125, 274])
    t_pers.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_pers)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 9. ASSESSMENT METHODOLOGY
    # ==================================================================
    story.extend(make_section_header("9. Assessment Methodology", styles))
    story.append(Paragraph(
        "ShikshakAI rejects punitive, superficial testing in favor of formative, diagnostic cognitive evaluation:",
        styles["body"]
    ))

    story.append(Paragraph(
        "<b>1. Formative Mid-Lesson Checkpoints:</b> Checkpoints appear at critical conceptual milestones, pausing narration and requiring student engagement before unlocking subsequent derivation steps.<br/>"
        "<b>2. Multi-Modal Input:</b> Students can answer via multiple-choice click, typed natural language, or voice input via the Web Speech API.<br/>"
        "<b>3. Semantic Diagnostic Evaluation:</b> The evaluation engine does not perform naive string matching. It evaluates conceptual correctness and identifies the exact underlying misconception.<br/>"
        "<b>4. Dynamic Assessments Hub (AssessmentsView.jsx):</b> Automatically generates customized quizzes from the student's past searched concepts, tracking topic retention scores and offering a 'Grand Review Assessment'.<br/>"
        "<b>5. 7-Day Spaced Repetition Roadmap (LearningReportModal.jsx):</b> Delivers a research-backed 7-day study plan covering formula recall, visual derivation, misconception busting, code drills, interleaving, speed drills, and the Feynman technique.",
        styles["bullet"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 10. MULTILINGUAL IMPLEMENTATION
    # ==================================================================
    story.extend(make_section_header("10. Multilingual Implementation", styles))
    story.append(Paragraph(
        "ShikshakAI provides native, end-to-end multilingual instruction across English, Hindi (हिंदी), and Hinglish:",
        styles["body"]
    ))

    multi_data = [
        [Paragraph("Language Mode", styles["table_header"]), Paragraph("Spoken Voice Model", styles["table_header"]), Paragraph("Pedagogical Scripting & Interaction Style", styles["table_header"])],
        [Paragraph("English (en)", styles["table_cell_bold"]), Paragraph("en-IN-NeerjaNeural / en-IN-PrabhatNeural", styles["table_cell"]), Paragraph("Clear, globally accessible Indian English with authentic technical terminology.", styles["table_cell"])],
        [Paragraph("Hindi (hi)", styles["table_cell_bold"]), Paragraph("hi-IN-SwaraNeural / hi-IN-MadhurNeural / hi-IN-KavyaNeural", styles["table_cell"]), Paragraph("Pure Hindi script and vocabulary for conceptual definitions, visual titles, and feedback.", styles["table_cell"])],
        [Paragraph("Hinglish (hinglish)", styles["table_cell_bold"]), Paragraph("hi-IN-SwaraNeural / hi-IN-MadhurNeural", styles["table_cell"]), Paragraph("Conversational code-switching blending Hindi sentence structure with English technical terms.", styles["table_cell"])],
    ]
    t_multi = Table(multi_data, colWidths=[105, 155, 244])
    t_multi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_multi)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 11. VOICE IMPLEMENTATION
    # ==================================================================
    story.extend(make_section_header("11. Voice Implementation & Neural Speech", styles))
    story.append(Paragraph(
        "A major technical hurdle in automated AI education is that TTS engines read mathematical symbols and Markdown tokens literally (e.g., reading <code>\\frac{1}{2}</code> as 'backslash f-r-a-c open brace one close brace'). ShikshakAI overcomes this via an advanced verbal pre-processing engine:",
        styles["body"]
    ))

    story.append(Paragraph("<b>Spoken Prose Pre-Processing (clean_text_for_speech):</b>", styles["h2"]))
    story.append(Paragraph(
        "• Converts LaTeX fractions: <code>\\frac{a}{b}</code> → 'a over b'<br/>"
        "• Converts square roots: <code>\\sqrt{x}</code> → 'square root of x'<br/>"
        "• Converts exponents: <code>x^2</code> → 'x squared', <code>x^3</code> → 'x cubed', <code>x^n</code> → 'x to the power of n'<br/>"
        "• Converts chemical notations: <code>CO_2</code> → 'CO 2', <code>H_2O</code> → 'H 2O'<br/>"
        "• Converts mathematical operators: <code>\\cdot</code> → 'times', <code>\\approx</code> → 'approximately', <code>\\neq</code> → 'is not equal to', <code>\\pm</code> → 'plus or minus'<br/>"
        "• Strips all Markdown formatting (<code>*</code>, <code>_</code>, <code>#</code>, <code>`</code>) and code fences.<br/>"
        "• Cleanses punctuation pauses to produce fluid, human-like cadence.",
        styles["bullet"]
    ))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        "<b>In-Memory Base64 Audio Streaming:</b> Audio synthesized via <code>edge-tts</code> is converted directly into in-memory Base64 MP3 Data URIs (<code>data:audio/mp3;base64,...</code>). This eliminates server disk I/O bottlenecks and enables instant playback across serverless environments.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 12. AVATAR & VIDEO GENERATION APPROACH
    # ==================================================================
    story.extend(make_section_header("12. Avatar & Video Generation Approach", styles))

    story.append(Paragraph("<b>12.1 SVG Vector Avatar Architecture:</b>", styles["h2"]))
    story.append(Paragraph(
        "Avatars are implemented as responsive, scalable SVG illustrations featuring layered radial lighting gradients, studio camera framing grids, hair geometries, facial expressions, and clothing specific to each teacher persona (Dr. Maya's navy blazer; Prof. Alex's tech hoodie; Ananya Ma'am's traditional attire).",
        styles["body"]
    ))

    story.append(Paragraph("<b>12.2 Real-Time Acoustic Lip-Sync (60 FPS Direct-DOM):</b>", styles["h2"]))
    story.append(Paragraph(
        "Rather than using heavy cloud video rendering, ShikshakAI analyzes speech audio in real time on the client:",
        styles["body"]
    ))
    story.append(Paragraph(
        "1. Attaches a Web Audio API <b>AudioContext</b> and <b>AnalyserNode</b> (<code>fftSize: 64</code>, <code>smoothingTimeConstant: 0.6</code>) to the active audio stream.<br/>"
        "2. A <code>requestAnimationFrame</code> loop samples frequency bins to calculate instantaneous loudness and speech formants.<br/>"
        "3. <b>Direct DOM Ref Mutation:</b> The loop mutates the SVG mouth element attributes (<code>rx</code>, <code>ry</code>, <code>opacity</code>) directly on the DOM ref, achieving butter-smooth 60 FPS lip synchronization with 0% React re-rendering overhead.<br/>"
        "4. Autonomous eye-blinking cycles run every 4.2 seconds to maintain lifelike presence.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>12.3 In-Browser Video Recording & Export (LessonRecorder.jsx):</b>", styles["h2"]))
    story.append(Paragraph(
        "Utilizes the native HTML5 <b>MediaRecorder API</b> and <code>navigator.mediaDevices.getDisplayMedia</code> with tab audio loopback. Captures live classroom visuals, avatar animations, blackboard updates, and audio into high-definition <code>.webm</code> video files ready for offline viewing without expensive cloud GPU render farms.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 13. APIS AND THIRD-PARTY SERVICES
    # ==================================================================
    story.extend(make_section_header("13. APIs and Third-Party Services", styles))

    api_table_data = [
        [Paragraph("Endpoint", styles["table_header"]), Paragraph("Method", styles["table_header"]), Paragraph("Payload / Parameters", styles["table_header"]), Paragraph("Description", styles["table_header"])],
        [Paragraph("/api/health", styles["table_cell_bold"]), Paragraph("GET", styles["table_cell"]), Paragraph("None", styles["table_cell"]), Paragraph("Verifies health connectivity and operational zero-cost stack.", styles["table_cell"])],
        [Paragraph("/api/config", styles["table_cell_bold"]), Paragraph("GET", styles["table_cell"]), Paragraph("None", styles["table_cell"]), Paragraph("Checks active configured AI engine (Gemini, Groq, or Local).", styles["table_cell"])],
        [Paragraph("/api/config/key", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("gemini_api_key, groq_api_key", styles["table_cell"]), Paragraph("Dynamically updates and persists API keys in .env.", styles["table_cell"])],
        [Paragraph("/api/upload", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("multipart/form-data file", styles["table_cell"]), Paragraph("Ingests PDF, DOCX, PPTX, TXT for RAG knowledge grounding.", styles["table_cell"])],
        [Paragraph("/api/lesson/plan", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("topic, level, duration, language", styles["table_cell"]), Paragraph("Generates structured visual teaching storyboard.", styles["table_cell"])],
        [Paragraph("/api/tts/speak", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("text, language, teacher_id", styles["table_cell"]), Paragraph("Synthesizes neural voice audio via Microsoft Edge-TTS.", styles["table_cell"])],
        [Paragraph("/api/evaluate", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("question, student_answer, correct", styles["table_cell"]), Paragraph("Diagnoses student answer and returns adaptive remediation.", styles["table_cell"])],
        [Paragraph("/api/studio/ask", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("topic, scene_title, question", styles["table_cell"]), Paragraph("Context-aware teacher answering live doubts during an active scene.", styles["table_cell"])],
        [Paragraph("/api/studio/adapt", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("topic, misconception, question", styles["table_cell"]), Paragraph("Generates targeted adaptive remediation scene with alternate analogy.", styles["table_cell"])],
        [Paragraph("/api/course/generate", styles["table_cell_bold"]), Paragraph("POST", styles["table_cell"]), Paragraph("topic, learner_level, language", styles["table_cell"]), Paragraph("Generates full comprehensive multi-module course curriculum.", styles["table_cell"])],
    ]
    t_api = Table(api_table_data, colWidths=[90, 42, 162, 210])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))

    # ==================================================================
    # 14. SETUP INSTRUCTIONS
    # ==================================================================
    story.extend(make_section_header("14. Setup & Local Installation Instructions", styles))
    story.append(Paragraph(
        "Follow these steps to configure and launch ShikshakAI in a local development environment:",
        styles["body"]
    ))

    setup_code = """# 1. Clone the repository
git clone https://github.com/Kushalsingh1234/ShikshakAI.git
cd ShikshakAI

# 2. Configure & launch the Backend (Track A)
cd backend
python3 -m venv venv
source venv/bin/activate       # On Windows: .\\venv\\Scripts\\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY (from https://aistudio.google.com/)
uvicorn main:app --reload --port 8000

# 3. Configure & launch the Frontend (Track B) in a new terminal
cd frontend
npm install
npm run dev
# Classroom UI is now running at http://localhost:5173"""
    story.append(make_code_box(setup_code, styles))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 15. DEPLOYMENT INSTRUCTIONS
    # ==================================================================
    story.extend(make_section_header("15. Production Deployment Instructions", styles))
    story.append(Paragraph(
        "<b>Frontend Vercel / Netlify Deployment:</b> Configured via root <code>vercel.json</code> to route API calls to the backend and serve the Vite client app.<br/>"
        "<b>Backend Container Deployment (Docker / Cloud Run):</b> Packaged using the following production Docker configuration:",
        styles["body"]
    ))

    docker_code = """FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]"""
    story.append(make_code_box(docker_code, styles))
    story.append(Spacer(1, 10))

    # ==================================================================
    # 16. KNOWN LIMITATIONS & FUTURE ROADMAP
    # ==================================================================
    story.extend(make_section_header("16. Known Limitations & Future Roadmap", styles))

    story.append(Paragraph("<b>16.1 Current Technical Limitations:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>Edge-TTS Outbound Internet:</b> Microsoft Edge-TTS requires an active internet connection to stream neural voices; offline execution relies on standard browser synthesis.<br/>"
        "• <b>Speech Recognition Browser Compatibility:</b> Web Speech API is natively optimized for Chromium browsers (Chrome, Edge, Brave); Safari and Firefox have limited support and fall back to text input.<br/>"
        "• <b>Scanned Image PDFs:</b> Text extraction currently parses native text layers via pypdf; scanned photocopies without OCR layers require pre-processing.",
        styles["bullet"]
    ))

    story.append(Paragraph("<b>16.2 Future Technical Roadmap:</b>", styles["h2"]))
    story.append(Paragraph(
        "• <b>On-Device Whisper & Piper TTS:</b> Integrating WebAssembly-based Whisper ASR and Piper neural TTS for 100% offline, air-gapped speech synthesis.<br/>"
        "• <b>Multi-Student Collaborative Classroom:</b> WebRTC-based virtual study rooms where multiple students can participate in shared AI-led group lessons.<br/>"
        "• <b>Multimodal Handwriting OCR:</b> Ingesting student notebook photos and whiteboard sketches directly using Gemini Vision models.<br/>"
        "• <b>Photorealistic 3D Avatar Rendering:</b> WebGL / Three.js avatars with 3D skeletal rigging and facial action coding (FACS).",
        styles["bullet"]
    ))
    story.append(Spacer(1, 12))

    callout_final = (
        "ShikshakAI demonstrates that cutting-edge, personalized 1-on-1 education is achievable at zero operational cost, "
        "combining rigorous pedagogical state machines, real-time multimodal interaction, and empathetic teacher avatars "
        "to empower every learner worldwide."
    )
    story.append(make_callout(callout_final, styles, "CONCLUSION"))

    # Build PDF with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF documentation: {filename}")


if __name__ == "__main__":
    output_pdf = "ShikshakAI_Project_Documentation.pdf"
    if len(sys.argv) > 1:
        output_pdf = sys.argv[1]
    build_pdf(output_pdf)
