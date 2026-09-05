"""
ShikshakAI Visual Storyboard & Educational Planning Engine
Translates user questions into structured pedagogical storyboards
conforming to strict JSON schema with validator, auto-repair, and Grok critic.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import json
import re
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("shikshak.storyboard")

# -------------------------------------------------------------
# Strict Storyboard Pydantic Schema
# -------------------------------------------------------------

class VisualElement(BaseModel):
    id: str
    type: str  # text, shape, box, arrow, node, formula, code_line, pointer, cell
    label: str
    value: Optional[str] = None
    coords: Optional[Dict[str, float]] = Field(default_factory=lambda: {"x": 50.0, "y": 50.0})
    highlight: bool = False
    style: Optional[Dict[str, Any]] = None

class SceneAction(BaseModel):
    action_type: str  # "reveal", "highlight", "compare", "transform", "pointer", "animate"
    target_id: str
    start_time: float = 0.0
    duration: float = 2.0
    payload: Dict[str, Any] = Field(default_factory=dict)

class StoryboardScene(BaseModel):
    id: int
    type: str  # concept, process, diagram, comparison, timeline, equation, graph, code, map, anatomy, molecule, simulation, summary
    title: str
    objective: str
    duration: float = 5.0
    component: str  # ConceptReveal, Definition, ProcessFlow, StepByStep, Comparison, CauseEffect, Timeline, EquationBuild, Graph, Diagram, Flowchart, CodeExecution, DataStructure, Architecture, Map, Molecule, Anatomy, Highlight, Zoom, BeforeAfter, Summary
    component_props: Dict[str, Any] = Field(default_factory=dict)
    elements: List[VisualElement] = Field(default_factory=list)
    actions: List[SceneAction] = Field(default_factory=list)
    narration: str
    emphasis: List[str] = Field(default_factory=list)
    transition: str = "fade"  # fade, slide-left, zoom, morph

class Storyboard(BaseModel):
    title: str
    subject: str  # Mathematics, Physics, Chemistry, Biology, History, Geography, Programming, Computer Science, General
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    user_intent: str
    core_concept: str
    prerequisites: List[str] = Field(default_factory=list)
    important_facts: List[str] = Field(default_factory=list)
    summary: str
    scenes: List[StoryboardScene]

# -------------------------------------------------------------
# Step 1: Educational Planner Prompt
# -------------------------------------------------------------

STORYBOARD_SYSTEM_PROMPT = """
You are the Chief Visual Director & Master Pedagogue for ShikshakAI's First-Class AI Visual Answer Engine.
Your job is NOT to write an essay or a ChatGPT chat answer.
Your job is to design a VISUAL TEACHING STORY where the student understands the concept primarily by WATCHING.

Given a user question, topic, or lesson requirement, you must output a STRICT, VALID JSON Storyboard.

CRITICAL RULES:
1. VISUAL HIERARCHY:
   - Every scene must have ONE primary learning objective.
   - Minimal on-screen text. Transform paragraphs into visual steps, flow arrows, comparisons, equations, or data structures.
   - For example, instead of explaining binary search in text, show an ARRAY of sorted numbers, highlight LOW/MID/HIGH, compare target, and eliminate half.
2. SUBJECT-SPECIFIC VISUAL COMPONENTS:
   Assign the exact component for each scene from this catalog:
   - "ConceptReveal": Core definition, big idea, initial intuition.
   - "Definition": Key terminology with breakdown and invariants.
   - "ProcessFlow": Multi-step cyclical or sequential flow with directional arrows.
   - "StepByStep": Sequential mathematical or logical derivation steps.
   - "Comparison": Side-by-side comparative analysis (A vs B).
   - "CauseEffect": Trigger -> Mechanism -> Impact chain.
   - "Timeline": Chronological milestones with dates/periods.
   - "EquationBuild": Math formulas, variable isolation, KaTeX expressions.
   - "Graph": 2D function curve, coordinate system, tangent line, or data points.
   - "Diagram": Flowchart, system nodes, or Mermaid syntax.
   - "Flowchart": Decision trees, conditional branching, algorithms.
   - "CodeExecution": Syntax-highlighted code with step pointer and variable watch.
   - "DataStructure": Arrays (with pointers), Binary Search, Trees, Stacks, Queues.
   - "Architecture": System layers, CPU/ALU/RAM bus flow, Client-Server pipeline.
   - "Map": Geographic regions, migration routes, spatial relationships.
   - "Molecule": Chemical bonds, molecular structures (H2O, CO2, ATP), reaction steps.
   - "Anatomy": Biological systems (cell organelles, photosynthesis, neuron, heart).
   - "Highlight": Zoomed-in focal inspection of an essential sub-component.
   - "BeforeAfter": Transformation state before vs after an operation.
   - "Summary": 3 high-yield mastery takeaways and memory anchors.
3. SPOKEN NARRATION PURITY:
   - `narration` is spoken by the voice synthesizer.
   - Do NOT include markdown symbols (**, ##, ```, $) or raw LaTeX code in `narration`.
   - Write natural, concise, engaging pedagogical sentences matching what is visually occurring in that scene.
4. STRICT JSON ONLY:
   - Return ONLY raw JSON starting with `{` and ending with `}`. No markdown wrap, no preamble.

STORYBOARD JSON SCHEMA:
{
  "title": "Topic Title",
  "subject": "Mathematics | Physics | Chemistry | Biology | History | Geography | Programming | Computer Science | General",
  "difficulty": "beginner | intermediate | advanced",
  "user_intent": "What the user wants to understand",
  "core_concept": "The foundational principle or axiom",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "important_facts": ["Fact 1", "Fact 2"],
  "summary": "Executive mastery summary",
  "scenes": [
    {
      "id": 1,
      "type": "concept | process | diagram | comparison | timeline | equation | graph | code | map | anatomy | molecule | simulation | summary",
      "title": "Scene Title",
      "objective": "One clear learning objective for this scene",
      "duration": 5.0,
      "component": "One valid component name from above",
      "component_props": {
        "key_details_specific_to_component": "e.g. array: [1, 3, 5, 7, 9], target: 7 for DataStructure"
      },
      "elements": [
        {
          "id": "elem_1",
          "type": "text | box | node | arrow | formula | cell",
          "label": "Display Label",
          "value": "Optional detail",
          "coords": {"x": 50, "y": 40},
          "highlight": true
        }
      ],
      "actions": [
        {
          "action_type": "reveal | highlight | transform | pointer",
          "target_id": "elem_1",
          "start_time": 0.0,
          "duration": 2.0,
          "payload": {}
        }
      ],
      "narration": "Natural concise spoken explanation for this scene.",
      "emphasis": ["Word or term to highlight"],
      "transition": "fade"
    }
  ]
}
"""

VALID_COMPONENTS = {
    "ConceptReveal", "Definition", "ProcessFlow", "StepByStep", "Comparison",
    "CauseEffect", "Timeline", "EquationBuild", "Graph", "Diagram",
    "Flowchart", "CodeExecution", "DataStructure", "Architecture", "Map",
    "Molecule", "Anatomy", "Highlight", "Zoom", "BeforeAfter", "Summary"
}

# -------------------------------------------------------------
# Step 10 & 12: Validator & Auto-Repair Engine
# -------------------------------------------------------------

def validate_and_repair_storyboard(raw_data: Any, topic: str = "Lesson", level: str = "beginner") -> Storyboard:
    """
    Strict validation & auto-repair:
    Guarantees that a completely valid, deterministic Storyboard object is produced,
    repairing missing fields, invalid component types, duration inconsistencies, and empty scenes.
    """
    if not isinstance(raw_data, dict):
        return generate_curated_fallback_storyboard(topic, level)

    title = str(raw_data.get("title") or topic).strip()
    subject = str(raw_data.get("subject") or infer_subject_from_topic(topic)).strip()
    difficulty = str(raw_data.get("difficulty") or level).lower()
    if difficulty not in ["beginner", "intermediate", "advanced"]:
        difficulty = "beginner"

    user_intent = str(raw_data.get("user_intent") or f"Understand {topic} from first principles").strip()
    core_concept = str(raw_data.get("core_concept") or f"Core mechanism and invariants of {topic}").strip()
    prerequisites = [str(p) for p in raw_data.get("prerequisites", []) if p]
    important_facts = [str(f) for f in raw_data.get("important_facts", []) if f]
    summary = str(raw_data.get("summary") or f"Mastery overview of {topic}.").strip()

    raw_scenes = raw_data.get("scenes", [])
    if not isinstance(raw_scenes, list) or len(raw_scenes) == 0:
        return generate_curated_fallback_storyboard(topic, level)

    repaired_scenes: List[StoryboardScene] = []
    for idx, s in enumerate(raw_scenes):
        if not isinstance(s, dict):
            continue
        scene_id = idx + 1
        s_title = str(s.get("title") or f"Step {scene_id}: {topic}").strip()
        s_obj = str(s.get("objective") or f"Grasp stage {scene_id}").strip()
        s_type = str(s.get("type") or "concept").lower()
        duration = float(s.get("duration") or 5.0)
        if duration <= 0:
            duration = 5.0

        # Component validation & normalization
        comp = str(s.get("component") or "").strip()
        if comp not in VALID_COMPONENTS:
            # Infer appropriate component from type and subject
            comp = infer_component_from_type_and_subject(s_type, subject)

        comp_props = s.get("component_props") if isinstance(s.get("component_props"), dict) else {}

        # Repair narration
        narration = str(s.get("narration") or "").strip()
        if not narration:
            narration = f"Now observe the core mechanism of {s_title}."
        # Remove any Markdown/LaTeX from narration for TTS purity
        narration = re.sub(r"[\*#`\$]", "", narration).strip()

        # Elements validation
        elements: List[VisualElement] = []
        for e_idx, e in enumerate(s.get("elements", [])):
            if isinstance(e, dict):
                elem_id = str(e.get("id") or f"elem_{scene_id}_{e_idx + 1}")
                elem_label = str(e.get("label") or f"Item {e_idx + 1}")
                coords = e.get("coords") if isinstance(e.get("coords"), dict) else {"x": 50.0, "y": 50.0}
                cx = max(5.0, min(95.0, float(coords.get("x", 50.0))))
                cy = max(5.0, min(95.0, float(coords.get("y", 50.0))))
                elements.append(VisualElement(
                    id=elem_id,
                    type=str(e.get("type") or "box"),
                    label=elem_label,
                    value=str(e.get("value")) if e.get("value") is not None else None,
                    coords={"x": cx, "y": cy},
                    highlight=bool(e.get("highlight", False)),
                    style=e.get("style") if isinstance(e.get("style"), dict) else None
                ))

        if not elements:
            # Auto-populate 2 default elements for visual renderer
            elements = [
                VisualElement(id=f"elem_{scene_id}_1", type="node", label=s_title, coords={"x": 50.0, "y": 35.0}, highlight=True),
                VisualElement(id=f"elem_{scene_id}_2", type="text", label=s_obj, coords={"x": 50.0, "y": 65.0}, highlight=False)
            ]

        # Actions validation
        actions: List[SceneAction] = []
        for a in s.get("actions", []):
            if isinstance(a, dict):
                act_type = str(a.get("action_type") or "reveal")
                target_id = str(a.get("target_id") or elements[0].id)
                a_start = float(a.get("start_time") or 0.0)
                a_dur = float(a.get("duration") or 2.0)
                actions.append(SceneAction(
                    action_type=act_type,
                    target_id=target_id,
                    start_time=max(0.0, a_start),
                    duration=max(0.5, a_dur),
                    payload=a.get("payload") if isinstance(a.get("payload"), dict) else {}
                ))

        if not actions:
            actions = [
                SceneAction(action_type="reveal", target_id=elements[0].id, start_time=0.0, duration=2.0)
            ]

        emphasis = [str(em) for em in s.get("emphasis", []) if em]
        transition = str(s.get("transition") or "fade")

        repaired_scenes.append(StoryboardScene(
            id=scene_id,
            type=s_type,
            title=s_title,
            objective=s_obj,
            duration=duration,
            component=comp,
            component_props=comp_props,
            elements=elements,
            actions=actions,
            narration=narration,
            emphasis=emphasis,
            transition=transition
        ))

    return Storyboard(
        title=title,
        subject=subject,
        difficulty=difficulty,
        user_intent=user_intent,
        core_concept=core_concept,
        prerequisites=prerequisites,
        important_facts=important_facts,
        summary=summary,
        scenes=repaired_scenes
    )

def infer_subject_from_topic(topic: str) -> str:
    t = (topic or "").lower()
    if re.search(r"math|equation|algebra|calculus|geometry|derivative|integral|matrix|probability", t):
        return "Mathematics"
    if re.search(r"physics|newton|force|motion|energy|gravity|circuit|quantum|thermo|speed", t):
        return "Physics"
    if re.search(r"chem|molecule|acid|reaction|atom|bond|compound|periodic", t):
        return "Chemistry"
    if re.search(r"bio|photosynthesis|cell|dna|gene|organ|protein|evolution|respiration", t):
        return "Biology"
    if re.search(r"history|war|revolution|empire|century|ancient|treaty|ww", t):
        return "History"
    if re.search(r"geography|climate|map|tectonic|volcano|river|ocean|continent", t):
        return "Geography"
    if re.search(r"code|python|java|javascript|programming|function|recursion|class|pointer", t):
        return "Programming"
    if re.search(r"computer|dsa|algorithm|binary|tree|graph|cpu|memory|architecture|cache|process", t):
        return "Computer Science"
    return "General"

def infer_component_from_type_and_subject(scene_type: str, subject: str) -> str:
    s_type = scene_type.lower()
    subj = subject.lower()

    if s_type == "equation" or "math" in subj:
        return "EquationBuild"
    if s_type == "code" or "program" in subj:
        return "CodeExecution"
    if s_type in ["datastructure", "array", "search", "tree"]:
        return "DataStructure"
    if s_type == "architecture" or "cpu" in s_type:
        return "Architecture"
    if s_type == "timeline" or "history" in subj:
        return "Timeline"
    if s_type == "map" or "geograph" in subj:
        return "Map"
    if s_type == "molecule" or "chem" in subj:
        return "Molecule"
    if s_type == "anatomy" or "bio" in subj:
        return "Anatomy"
    if s_type == "comparison":
        return "Comparison"
    if s_type == "process":
        return "ProcessFlow"
    if s_type == "summary":
        return "Summary"
    if s_type == "diagram":
        return "Diagram"
    if s_type == "graph":
        return "Graph"
    return "ConceptReveal"

# -------------------------------------------------------------
# Step 11: AI Critic (Grok)
# -------------------------------------------------------------

def run_ai_critic_pass(storyboard: Storyboard, topic: str) -> Storyboard:
    """
    Evaluates generated storyboard with secondary model (Groq/Grok) as a pedagogical critic:
    - Verifies factual accuracy
    - Enforces that text is converted to visual elements
    - Ensures each scene has 1 clear purpose
    - Returns structured corrections without crashing
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or len(groq_key.strip()) < 10:
        return storyboard

    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_key.strip())
        
        critic_prompt = f"""
You are the Lead Critic & Motion Design Inspector for ShikshakAI.
Review this generated storyboard for topic: "{topic}".

Evaluate:
1. Is it factually accurate?
2. Does each scene have ONE clear visual objective without long paragraphs of text?
3. Are the selected visual components (DataStructure, EquationBuild, Molecule, ProcessFlow, etc.) appropriate?
4. Are all spoken narrations pure speech (no asterisks, no LaTeX syntax)?

If revisions are needed, return the IMPROVED storyboard as STRICT JSON conforming to the exact same schema.
If already excellent, return the identical JSON without alterations.

Storyboard to review:
{storyboard.model_dump_json()}
"""
        critic_models = ["qwen/qwen3.6-27b", "openai/gpt-oss-20b", "groq/compound-mini"]
        for g_model in critic_models:
            try:
                response = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a pedagogical critic. Return only valid JSON adhering to the Storyboard schema."},
                        {"role": "user", "content": critic_prompt}
                    ],
                    model=g_model,
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=1400,
                    timeout=6.0
                )
                content = response.choices[0].message.content or ""
                match = re.search(r"(\{.*\})", content, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(1))
                    return validate_and_repair_storyboard(parsed, topic, storyboard.difficulty)
            except Exception as model_err:
                logger.debug(f"Critic model {g_model} skipped: {model_err}")
                continue
    except Exception as e:
        logger.info(f"Groq Critic skipped: {e}. Using validated primary storyboard.")

    return storyboard

# -------------------------------------------------------------
# Master High-Fidelity Curated Fallbacks for Instant / Offline Zero-Cost Execution
# -------------------------------------------------------------

def generate_curated_fallback_storyboard(topic: str, level: str = "beginner") -> Storyboard:
    """
    Produces masterclass visual storyboards for foundational concepts
    (e.g., Linear Equations, Binary Search, Photosynthesis, Newton's Laws, CPU Architecture)
    and algorithmic generator for custom topics.
    """
    t_lower = (topic or "").lower()

    # 0. C Language / Systems Programming / Pointers
    if any(k in t_lower for k in ["c language", "c programming", "pointer", "memory management", "\\bc\\b", "c++", "pointers", "malloc"]):
        return Storyboard(
            title="C Language: Pointers & Direct Memory Architecture",
            subject="Computer Science & Systems Programming",
            difficulty=level,
            user_intent="Master how C manipulates memory directly via pointers and hardware addresses",
            core_concept="In C, variables occupy physical memory addresses, and pointers store those addresses to enable direct hardware manipulation.",
            prerequisites=["Binary memory representations", "Variable declarations (int, float, char)"],
            important_facts=[
                "Every variable in C has a memory address accessible with '&'",
                "A pointer variable (e.g. int *ptr) holds the memory address of another variable",
                "Dereferencing (*ptr) reads or writes directly to the memory address stored in ptr",
                "C compiles directly into native CPU machine instructions with zero runtime overhead"
            ],
            summary="C bridges high-level algorithms and hardware by letting programmers manipulate memory addresses directly through pointers and explicit allocation.",
            scenes=[
                StoryboardScene(
                    id=1,
                    type="concept",
                    title="The C Memory Model & Physical Addresses",
                    objective="Understand computer RAM as indexed memory cells with unique hex addresses",
                    duration=5.5,
                    component="Architecture",
                    component_props={
                        "system_name": "System RAM & Physical Memory Layout",
                        "layers": [
                            {"name": "Stack Memory", "role": "Automatic local variables & function frames"},
                            {"name": "Heap Memory", "role": "Dynamic manual allocation via malloc() and free()"},
                            {"name": "Code Segment", "role": "Compiled native CPU machine instructions"}
                        ]
                    },
                    elements=[
                        VisualElement(id="cell_1004", type="box", label="Address 0x1004: int val = 42", coords={"x": 35.0, "y": 45.0}, highlight=True),
                        VisualElement(id="cell_1008", type="box", label="Address 0x1008: int *ptr = 0x1004", coords={"x": 65.0, "y": 45.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="cell_1004", start_time=0.0, duration=2.0),
                        SceneAction(action_type="reveal", target_id="cell_1008", start_time=2.0, duration=2.0),
                    ],
                    narration="In C, every variable lives at a specific physical memory address in RAM. An integer variable like val occupies memory, and a pointer is simply another variable that stores that exact address.",
                    emphasis=["physical memory address", "pointer is simply another variable that stores that exact address"],
                    transition="fade"
                ),
                StoryboardScene(
                    id=2,
                    type="code",
                    title="Pointers & Address Referencing in Action",
                    objective="Trace pointer assignment and memory dereferencing line by line",
                    duration=6.5,
                    component="CodeExecution",
                    component_props={
                        "language": "c",
                        "code": "#include <stdio.h>\n\nint main() {\n    int val = 42;      // Allocated in RAM at 0x1004\n    int *ptr = &val;   // ptr holds address 0x1004\n\n    *ptr = 99;         // Dereference: write 99 directly to 0x1004\n    printf(\"val = %d\\n\", val); // Outputs: val = 99\n    return 0;\n}",
                        "steps": [
                            {"line": 4, "explanation": "val is allocated 4 bytes in RAM storing 42"},
                            {"line": 5, "explanation": "&val retrieves the address 0x1004 and stores it in pointer ptr"},
                            {"line": 7, "explanation": "*ptr dereferences the address, updating val to 99 directly in memory!"}
                        ]
                    },
                    elements=[
                        VisualElement(id="code_var", type="box", label="val: 42 -> 99", coords={"x": 30.0, "y": 50.0}, highlight=True),
                        VisualElement(id="code_ptr", type="node", label="ptr -> &val (0x1004)", coords={"x": 70.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="highlight", target_id="code_var", start_time=0.0, duration=2.5),
                        SceneAction(action_type="highlight", target_id="code_ptr", start_time=2.5, duration=2.5),
                    ],
                    narration="Observe this C code execution. The ampersand operator retrieves the memory address of val. When we write star ptr equals ninety-nine, C follows that address and modifies val directly in hardware memory.",
                    emphasis=["ampersand retrieves the memory address", "star ptr equals ninety-nine", "modifies val directly in hardware memory"],
                    transition="slide-left"
                ),
                StoryboardScene(
                    id=3,
                    type="process",
                    title="The C Compilation Pipeline",
                    objective="Understand how C transforms into bare-metal machine code",
                    duration=5.5,
                    component="ProcessFlow",
                    component_props={
                        "stages": [
                            {"name": "1. Preprocessor", "desc": "Expands #include & header files"},
                            {"name": "2. Compiler", "desc": "Translates C to CPU assembly instructions"},
                            {"name": "3. Assembler", "desc": "Converts assembly to machine object code (.o)"},
                            {"name": "4. Linker", "desc": "Combines object files into native binary executable"}
                        ]
                    },
                    elements=[
                        VisualElement(id="c_pipe1", type="box", label="Source (.c)", coords={"x": 20.0, "y": 50.0}, highlight=False),
                        VisualElement(id="c_pipe2", type="box", label="Compiler", coords={"x": 50.0, "y": 50.0}, highlight=True),
                        VisualElement(id="c_pipe3", type="box", label="Native Binary", coords={"x": 80.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="c_pipe1", start_time=0.0, duration=1.5),
                        SceneAction(action_type="reveal", target_id="c_pipe2", start_time=1.5, duration=1.5),
                        SceneAction(action_type="reveal", target_id="c_pipe3", start_time=3.0, duration=1.5),
                    ],
                    narration="Unlike interpreted languages, C compiles ahead-of-time through four rigorous phases: preprocessing, compilation, assembly, and linking. The result is pure machine code running directly on the CPU.",
                    emphasis=["pure machine code", "running directly on the CPU"],
                    transition="slide-left"
                ),
                StoryboardScene(
                    id=4,
                    type="summary",
                    title="C Language Systems Mastery",
                    objective="Retain the fundamental invariants of C systems programming",
                    duration=5.0,
                    component="Summary",
                    component_props={
                        "takeaways": [
                            "Direct Memory Control: Pointers hold memory addresses; '*' accesses stored values.",
                            "Predictable Performance: No hidden runtime or garbage collection pauses.",
                            "Foundational Power: Underpins operating systems, hardware drivers, and high-speed engines."
                        ]
                    },
                    elements=[
                        VisualElement(id="c_sum_node", type="node", label="C Systems Mastery", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="c_sum_node", start_time=0.0, duration=2.5),
                    ],
                    narration="To master C, remember this foundation: you are in direct control of the machine's memory. Pointers store addresses, dereferencing accesses values, and compilation produces bare-metal performance.",
                    emphasis=["direct control of the machine's memory", "bare-metal performance"],
                    transition="zoom"
                )
            ]
        )

    # 1. Linear Equations (Algebra / Math)
    if any(k in t_lower for k in ["linear", "equation", "algebra", "variable", "solve for x", "leniar"]):
        return Storyboard(
            title="Solving Linear Equations via Inverses",
            subject="Mathematics",
            difficulty=level,
            user_intent="Master isolating an unknown variable systematically",
            core_concept="Equality is preserved by applying identical inverse operations to both sides.",
            prerequisites=["Basic arithmetic", "Inverse operations (addition/subtraction, multiplication/division)"],
            important_facts=[
                "Goal: isolate x on one side: x = value",
                "Addition cancels subtraction; division cancels multiplication",
                "Always verify by substituting the root back into the original expression"
            ],
            summary="By systematically peeling off constants through subtraction and coefficients through division, any linear equation is resolved in linear steps.",
            scenes=[
                StoryboardScene(
                    id=1,
                    type="concept",
                    title="The Balance Scale Principle",
                    objective="Understand an equation as a perfectly balanced scale",
                    duration=5.0,
                    component="ConceptReveal",
                    component_props={
                        "concept_title": "Equation as a Balance Scale",
                        "equation": "3x + 6 = 15",
                        "analogy": "Whatever you remove from the left side must be removed from the right to preserve equilibrium."
                    },
                    elements=[
                        VisualElement(id="scale_left", type="box", label="Left Pan: 3x + 6", coords={"x": 30.0, "y": 45.0}, highlight=True),
                        VisualElement(id="scale_eq", type="node", label="EQUALS (=)", coords={"x": 50.0, "y": 45.0}, highlight=False),
                        VisualElement(id="scale_right", type="box", label="Right Pan: 15", coords={"x": 70.0, "y": 45.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="scale_left", start_time=0.0, duration=1.5),
                        SceneAction(action_type="reveal", target_id="scale_right", start_time=1.5, duration=1.5),
                    ],
                    narration="Think of this equation as a balanced physical scale. On the left we have three x plus six, and on the right we have fifteen. Our goal is to isolate the unknown variable.",
                    emphasis=["balanced physical scale", "isolate the unknown"],
                    transition="fade"
                ),
                StoryboardScene(
                    id=2,
                    type="equation",
                    title="Inverse Operation 1: Subtract 6",
                    objective="Eliminate the constant term from the variable side",
                    duration=6.0,
                    component="EquationBuild",
                    component_props={
                        "steps": [
                            {"step": "Initial State", "latex": "3x + 6 = 15"},
                            {"step": "Subtract 6 from both sides", "latex": "3x + 6 - 6 = 15 - 6"},
                            {"step": "Simplified Equality", "latex": "3x = 9"}
                        ],
                        "active_step_index": 1,
                        "highlight_term": "- 6"
                    },
                    elements=[
                        VisualElement(id="eq_step1", type="formula", label="3x + 6 = 15", coords={"x": 50.0, "y": 30.0}, highlight=False),
                        VisualElement(id="eq_step2", type="formula", label="3x = 9", coords={"x": 50.0, "y": 60.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="transform", target_id="eq_step1", start_time=0.0, duration=2.0),
                        SceneAction(action_type="reveal", target_id="eq_step2", start_time=2.5, duration=2.0),
                    ],
                    narration="To remove the positive six, we apply its inverse operation: subtracting six from both sides. Fifteen minus six leaves nine, simplifying our relationship to three x equals nine.",
                    emphasis=["subtracting six", "three x equals nine"],
                    transition="slide-left"
                ),
                StoryboardScene(
                    id=3,
                    type="equation",
                    title="Inverse Operation 2: Divide by 3",
                    objective="Isolate x by dividing by the variable's coefficient",
                    duration=5.0,
                    component="StepByStep",
                    component_props={
                        "operation": "Division by Coefficient",
                        "formula": "\\frac{3x}{3} = \\frac{9}{3}",
                        "result": "x = 3"
                    },
                    elements=[
                        VisualElement(id="sol_box", type="box", label="x = 3", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="highlight", target_id="sol_box", start_time=0.0, duration=3.0),
                    ],
                    narration="Finally, because x is multiplied by three, we divide both sides by three. Nine divided by three yields x equals three. The unknown is isolated.",
                    emphasis=["divide both sides by three", "x equals three"],
                    transition="zoom"
                ),
                StoryboardScene(
                    id=4,
                    type="summary",
                    title="Verification & Core Mastery",
                    objective="Verify solution and retain the inverse operation pattern",
                    duration=4.5,
                    component="Summary",
                    component_props={
                        "takeaways": [
                            "Step 1: Cancel constant terms via addition or subtraction",
                            "Step 2: Cancel coefficients via multiplication or division",
                            "Step 3: Test root: 3(3) + 6 = 9 + 6 = 15 (Confirmed)"
                        ]
                    },
                    elements=[
                        VisualElement(id="sum_check", type="node", label="Root Verified: x = 3", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="sum_check", start_time=0.0, duration=2.0),
                    ],
                    narration="To verify, substitute three back in: three times three is nine, plus six equals fifteen. The method is universal and exact.",
                    emphasis=["universal and exact"],
                    transition="fade"
                )
            ]
        )

    # 2. Binary Search (Computer Science / Programming)
    if any(k in t_lower for k in ["binary search", "binary", "dsa", "search algorithm"]):
        return Storyboard(
            title="Binary Search: Divide & Conquer",
            subject="Computer Science",
            difficulty=level,
            user_intent="Visualize how logarithmic search achieves O(log n) efficiency",
            core_concept="By halving a sorted search space at each step, items are located exponentially faster than linear scanning.",
            prerequisites=["Sorted array invariant", "Array indexing (0 to N-1)"],
            important_facts=[
                "Requires array to be in sorted order",
                "Middle index: mid = low + (high - low) / 2",
                "Time complexity: O(log n), space: O(1)"
            ],
            summary="Binary search eliminates half of all remaining candidates with every single comparison, shrinking 1,000,000 items to just 20 comparisons.",
            scenes=[
                StoryboardScene(
                    id=1,
                    type="datastructure",
                    title="The Sorted Array Invariant",
                    objective="Establish pointers on a sorted array of elements",
                    duration=5.0,
                    component="DataStructure",
                    component_props={
                        "array": [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91],
                        "target": 23,
                        "low": 0,
                        "mid": 5,
                        "high": 10,
                        "eliminated": []
                    },
                    elements=[
                        VisualElement(id="ds_arr", type="cell", label="Sorted Array [2...91]", coords={"x": 50.0, "y": 40.0}, highlight=True),
                        VisualElement(id="ds_tgt", type="text", label="Target Value: 23", coords={"x": 50.0, "y": 70.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="ds_arr", start_time=0.0, duration=1.5),
                        SceneAction(action_type="highlight", target_id="ds_tgt", start_time=1.5, duration=1.5),
                    ],
                    narration="Binary search begins with a sorted array. We establish a low pointer at the start, a high pointer at the end, and aim to find twenty three.",
                    emphasis=["sorted array", "low pointer", "high pointer"],
                    transition="fade"
                ),
                StoryboardScene(
                    id=2,
                    type="datastructure",
                    title="Inspect Middle & Discard Lower Half",
                    objective="Compare target against middle element and eliminate half the array",
                    duration=6.0,
                    component="DataStructure",
                    component_props={
                        "array": [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91],
                        "target": 23,
                        "low": 0,
                        "mid": 5,
                        "high": 10,
                        "comparison": "23 == 23 (Match Found!)",
                        "eliminated": []
                    },
                    elements=[
                        VisualElement(id="mid_pointer", type="pointer", label="Mid Index [5] = 23", coords={"x": 54.0, "y": 30.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="pointer", target_id="mid_pointer", start_time=0.0, duration=3.0),
                    ],
                    narration="We compute the midpoint. In this step, the element at the midpoint exactly matches our target value of twenty three. If it were smaller, the entire left half would be discarded immediately.",
                    emphasis=["midpoint", "entire left half discarded"],
                    transition="slide-left"
                ),
                StoryboardScene(
                    id=3,
                    type="diagram",
                    title="Logarithmic Efficiency: O(log n)",
                    objective="Understand why halving yields logarithmic time complexity",
                    duration=5.0,
                    component="Comparison",
                    component_props={
                        "left_title": "Linear Search: O(n)",
                        "left_metric": "1,000,000 Comparisons worst case",
                        "right_title": "Binary Search: O(log n)",
                        "right_metric": "Only 20 Comparisons worst case"
                    },
                    elements=[
                        VisualElement(id="cmp_lin", type="box", label="Linear Scan: 1,000,000 ops", coords={"x": 30.0, "y": 50.0}, highlight=False),
                        VisualElement(id="cmp_bin", type="box", label="Binary Search: 20 ops", coords={"x": 70.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="compare", target_id="cmp_bin", start_time=0.0, duration=2.5),
                    ],
                    narration="Notice the extraordinary efficiency. While linear scan could examine a million elements, binary search finds any target in just twenty comparisons.",
                    emphasis=["twenty comparisons", "extraordinary efficiency"],
                    transition="zoom"
                )
            ]
        )

    # 3. Newton's Laws of Motion (Physics)
    if any(k in t_lower for k in ["newton", "motion", "force", "f=ma", "gravity"]):
        return Storyboard(
            title="Newton's Laws of Motion & Forces",
            subject="Physics",
            difficulty=level,
            user_intent="Grasp the relationship between force, mass, and proportional acceleration",
            core_concept="Force is an interaction that changes an object's state of motion: F = m * a.",
            prerequisites=["Inertia", "Vectors (magnitude and direction)"],
            important_facts=[
                "First Law: Objects resist velocity changes (Inertia)",
                "Second Law: Acceleration is proportional to Net Force: a = F / m",
                "Third Law: Action-reaction force pairs are equal and opposite"
            ],
            summary="Motion does not require continuous force; force is only required to change velocity.",
            scenes=[
                StoryboardScene(
                    id=1,
                    type="concept",
                    title="The Law of Inertia",
                    objective="Understand an object's natural resistance to acceleration",
                    duration=5.0,
                    component="ConceptReveal",
                    component_props={
                        "principle": "Newton's First Law: Inertia",
                        "equation": "\\sum F = 0 \\implies a = 0",
                        "takeaway": "An object maintains its constant velocity unless a net external force intervenes."
                    },
                    elements=[
                        VisualElement(id="block_inertia", type="box", label="Mass (m) at Constant Velocity", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="block_inertia", start_time=0.0, duration=2.0),
                    ],
                    narration="Newton's first law states that an object naturally preserves its state of motion. Without an unbalanced net force, velocity cannot change.",
                    emphasis=["preserves its state of motion", "net force"],
                    transition="fade"
                ),
                StoryboardScene(
                    id=2,
                    type="equation",
                    title="Fundamental Dynamics: F = ma",
                    objective="Deconstruct the proportional vector equation",
                    duration=6.0,
                    component="EquationBuild",
                    component_props={
                        "steps": [
                            {"step": "Proportionality", "latex": "a \\propto \\frac{F_{net}}{m}"},
                            {"step": "Governing Law", "latex": "F_{net} = m \\cdot a"},
                            {"step": "Vector Form", "latex": "\\vec{F} = m \\frac{d\\vec{v}}{dt}"}
                        ]
                    },
                    elements=[
                        VisualElement(id="f_ma_box", type="formula", label="F = m * a", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="highlight", target_id="f_ma_box", start_time=0.0, duration=3.0),
                    ],
                    narration="The second law defines force mathematically: net force equals mass times acceleration. Doubling the force doubles acceleration, while doubling mass cuts acceleration in half.",
                    emphasis=["net force equals mass times acceleration"],
                    transition="slide-left"
                )
            ]
        )

    # 4. Photosynthesis (Biology / Natural Sciences)
    if any(k in t_lower for k in ["photo", "photosynthesis", "plant", "chloroplast"]):
        return Storyboard(
            title="Photosynthesis: Light to Chemical Energy",
            subject="Biology",
            difficulty=level,
            user_intent="Trace photon capture, electron transport, and glucose synthesis",
            core_concept="Chloroplasts convert sunlight, water, and CO2 into glucose and oxygen.",
            prerequisites=["Cellular structure", "Chemical equations"],
            important_facts=[
                "Light-dependent reactions occur in the thylakoid membranes",
                "Light-independent Calvin cycle occurs in the stroma",
                "Overall equation: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2"
            ],
            summary="Solar photons energize electrons extracted from water, synthesizing ATP and NADPH to fuel carbon fixation into carbohydrates.",
            scenes=[
                StoryboardScene(
                    id=1,
                    type="anatomy",
                    title="The Chloroplast Architecture",
                    objective="Locate thylakoid discs and stroma within the plant cell",
                    duration=5.0,
                    component="Anatomy",
                    component_props={
                        "organelle": "Chloroplast",
                        "structures": [
                            {"name": "Thylakoid Granum", "role": "Site of light reactions & chlorophyll"},
                            {"name": "Stroma", "role": "Fluid space where Calvin cycle fixates carbon"}
                        ]
                    },
                    elements=[
                        VisualElement(id="chloroplast_box", type="node", label="Chloroplast Organelle", coords={"x": 50.0, "y": 45.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="chloroplast_box", start_time=0.0, duration=2.0),
                    ],
                    narration="Photosynthesis takes place inside the chloroplast. The thylakoid membrane captures incoming sunlight, while the surrounding stroma synthesizes sugar.",
                    emphasis=["thylakoid membrane", "stroma synthesizes sugar"],
                    transition="fade"
                ),
                StoryboardScene(
                    id=2,
                    type="process",
                    title="Two-Stage Energy Conversion Pathway",
                    objective="Map light reactions to the Calvin cycle",
                    duration=6.0,
                    component="ProcessFlow",
                    component_props={
                        "stages": [
                            {"name": "1. Light Reactions", "inputs": "Photons + H2O", "outputs": "ATP + NADPH + O2"},
                            {"name": "2. Calvin Cycle", "inputs": "CO2 + ATP + NADPH", "outputs": "Glucose (C6H12O6)"}
                        ]
                    },
                    elements=[
                        VisualElement(id="proc_light", type="box", label="Stage 1: Light Reactions", coords={"x": 30.0, "y": 50.0}, highlight=True),
                        VisualElement(id="proc_calvin", type="box", label="Stage 2: Calvin Cycle", coords={"x": 70.0, "y": 50.0}, highlight=True),
                    ],
                    actions=[
                        SceneAction(action_type="reveal", target_id="proc_light", start_time=0.0, duration=2.0),
                        SceneAction(action_type="reveal", target_id="proc_calvin", start_time=2.0, duration=2.0),
                    ],
                    narration="The process splits into two coupled phases: light reactions generate chemical energy carriers, which the Calvin cycle uses to assemble carbon atoms into glucose.",
                    emphasis=["light reactions", "Calvin cycle", "assemble carbon atoms into glucose"],
                    transition="slide-left"
                )
            ]
        )

    # 5. Algorithmic Generator for General Custom Topics
    subj = infer_subject_from_topic(topic)
    comp1 = "ConceptReveal"
    comp2 = "ProcessFlow" if "Science" in subj or "Biology" in subj else "StepByStep"
    comp3 = "Summary"

    return Storyboard(
        title=f"First-Principles Visual Breakdown: {topic}",
        subject=subj,
        difficulty=level,
        user_intent=f"Understand the mechanics and applications of {topic}",
        core_concept=f"The governing rules and state transitions of {topic}.",
        prerequisites=["Foundational definitions", "Systematic reasoning"],
        important_facts=[
            f"Core definition and governing axioms of {topic}",
            f"Key relationships and step-by-step mechanisms",
            f"Primary applications and validation criteria"
        ],
        summary=f"{topic} explained through visual decomposition, logical step transitions, and core invariants.",
        scenes=[
            StoryboardScene(
                id=1,
                type="concept",
                title=f"Core Definition of {topic}",
                objective=f"Grasp the foundational definition of {topic}",
                duration=5.0,
                component=comp1,
                component_props={
                    "concept": topic,
                    "subject": subj,
                    "insight": f"Understanding {topic} begins by isolating its primary invariant."
                },
                elements=[
                    VisualElement(id="gen_c1", type="node", label=topic, coords={"x": 50.0, "y": 40.0}, highlight=True),
                    VisualElement(id="gen_c2", type="text", label=f"Subject Domain: {subj}", coords={"x": 50.0, "y": 65.0}, highlight=False),
                ],
                actions=[
                    SceneAction(action_type="reveal", target_id="gen_c1", start_time=0.0, duration=2.0)
                ],
                narration=f"To understand {topic}, we begin with its foundational definition. Every system operates under clear governing rules.",
                emphasis=[topic, "governing rules"],
                transition="fade"
            ),
            StoryboardScene(
                id=2,
                type="process",
                title=f"Mechanism & Dynamic Flow of {topic}",
                objective=f"Visualize the step-by-step causal mechanism of {topic}",
                duration=6.0,
                component=comp2,
                component_props={
                    "steps": [
                        {"step": "Initial State", "latex": f"\\text{{Input: {topic}}}"},
                        {"step": "Core Mechanism", "latex": "\\text{Transform: } f(x) \\to y"},
                        {"step": "Output State", "latex": "\\text{Verified Output}"}
                    ],
                    "stages": [
                        {"name": "1. Input", "desc": f"Initial State of {topic}"},
                        {"name": "2. Mechanism", "desc": "Primary State Transition"},
                        {"name": "3. Output", "desc": "Verified Result State"}
                    ]
                },
                elements=[
                    VisualElement(id="gen_step1", type="box", label="Input State", coords={"x": 25.0, "y": 50.0}, highlight=True),
                    VisualElement(id="gen_step2", type="box", label="Core Mechanism", coords={"x": 50.0, "y": 50.0}, highlight=True),
                    VisualElement(id="gen_step3", type="box", label="Result State", coords={"x": 75.0, "y": 50.0}, highlight=True),
                ],
                actions=[
                    SceneAction(action_type="reveal", target_id="gen_step1", start_time=0.0, duration=1.5),
                    SceneAction(action_type="reveal", target_id="gen_step2", start_time=1.5, duration=1.5),
                    SceneAction(action_type="reveal", target_id="gen_step3", start_time=3.0, duration=1.5),
                ],
                narration=f"Now observe how {topic} operates in sequence. Starting from initial inputs, the core mechanism transforms the system into the verified final state.",
                emphasis=["operates in sequence", "core mechanism"],
                transition="slide-left"
            ),
            StoryboardScene(
                id=3,
                type="summary",
                title="Mastery Synthesis",
                objective=f"Consolidate mental models of {topic}",
                duration=4.5,
                component=comp3,
                component_props={
                    "takeaways": [
                        f"Identify foundational parameters of {topic}",
                        "Apply the systematic step transformation",
                        "Verify edge cases against governing rules"
                    ]
                },
                elements=[
                    VisualElement(id="gen_sum", type="node", label=f"{topic} Mastered", coords={"x": 50.0, "y": 50.0}, highlight=True),
                ],
                actions=[
                    SceneAction(action_type="reveal", target_id="gen_sum", start_time=0.0, duration=2.0)
                ],
                narration=f"By following this structured approach, {topic} transitions from abstract theory into an intuitive, verifiable visual framework.",
                emphasis=["structured approach", "intuitive visual framework"],
                transition="zoom"
            )
        ]
    )
