from typing import List, Optional, Dict, Any
import re
import logging
from pydantic import BaseModel, Field

logger = logging.getLogger("shikshak.accuracy")

class CameraInstruction(BaseModel):
    zoom: float = 1.0
    focus_target: str = "center"
    subtle_pan: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})

class PointerInstruction(BaseModel):
    active: bool = True
    target_id: Optional[str] = None
    label: Optional[str] = None
    coords: Dict[str, float] = Field(default_factory=lambda: {"x": 50.0, "y": 50.0})

class SceneAction(BaseModel):
    id: str
    narration_text: str
    start_time: float
    duration: float
    visual_type: str = "text_reveal"  # "3d_object" | "formula" | "diagram" | "text_reveal" | "chart" | "code_block" | "highlight_pointer"
    visual_payload: Dict[str, Any] = Field(default_factory=dict)
    camera: CameraInstruction = Field(default_factory=CameraInstruction)
    pointer: PointerInstruction = Field(default_factory=PointerInstruction)
    action_type: Optional[str] = None
    target_id: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class VisualContent(BaseModel):
    type: str  # "katex" | "mermaid" | "code" | "bullet_points" | "image" | "3d_object"
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
    scene_script: Optional[List[SceneAction]] = None
    storyboard_scene: Optional[Dict[str, Any]] = None

class LessonPlan(BaseModel):
    topic: str
    learner_level: str  # "beginner" | "intermediate" | "advanced"
    target_duration_minutes: int
    language: str  # "en" | "hi" | "hinglish"
    estimated_steps: int
    steps: List[LessonStep]
    storyboard: Optional[Dict[str, Any]] = None


def get_sample_lesson_plan(
    topic: str = "Ohm's Law",
    level: str = "beginner",
    duration: int = 20,
    language: str = "en"
) -> LessonPlan:
    """
    Intelligent subject-aware fallback synthesizer that generates real, topic-specific,
    pedagogically rich lesson plans for any subject (Physics, CS, Math, Bio, Chemistry, etc.)
    when an external LLM API key is not configured or offline.
    """
    raw_topic = (topic or "").strip()
    
    # Smart Topic Auto-Resolver for single-letter or shorthand inputs
    topic_aliases = {
        "h": "Hooke's Law of Elasticity",
        "ai": "Artificial Intelligence & Neural Networks",
        "ml": "Machine Learning & Model Training",
        "dsa": "Data Structures & Search Algorithms",
        "ds": "Data Structures & Algorithms",
        "js": "JavaScript Async Event Loop & Promises",
        "py": "Python Object Oriented Programming",
        "db": "Relational Databases & B-Tree Indexing",
        "sql": "SQL Query Optimization & Joins",
        "os": "Operating Systems & Memory Paging",
        "c": "Calculus: Derivatives & Rates of Change",
        "p": "Physics: Conservation of Mechanical Energy",
        "b": "Biology: Photosynthesis & Energy Transfer",
        "chem": "Chemical Bonding & Molecular Orbitals",
        "math": "Calculus: Limits & Derivative Power Rule",
    }
    
    if raw_topic.lower() in topic_aliases:
        clean_topic = topic_aliases[raw_topic.lower()]
    elif not raw_topic:
        clean_topic = "Hooke's Law of Elasticity"
    else:
        clean_topic = raw_topic

    t_lower = clean_topic.lower()
    is_hi = language.lower() in ["hi", "hindi"]
    is_hinglish = language.lower() == "hinglish"

    # -------------------------------------------------------------
    # 0. Linear Equations & Algebraic Problem Solving (Hackathon Demo Master)
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["linear", "equation", "algebra", "variable", "solve for x", "leniar"]):
        return LessonPlan(
            topic=clean_topic if clean_topic else "Linear Equations",
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=6,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script="Welcome! Today we will master linear equations. At its core, an algebraic equation is a mathematical sentence asserting that two distinct expressions balance to the exact same value.",
                    visual=VisualContent(
                        type="equation",
                        title="What is an Algebraic Equation?",
                        content="2x + 4 = 10"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="concept",
                    teacher_script="Think of an equation as a physical two-pan balance scale. The equal sign is the central fulcrum. Whatever operation you apply to the left side, you must apply to the right side to keep the scale balanced.",
                    visual=VisualContent(
                        type="balance",
                        title="The Balance Scale Analogy: Symmetrical Equality",
                        content="Left Pan: [2x + 4]  <=== Balances ===>  Right Pan: [10]"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="demonstration",
                    teacher_script="To solve 2x + 4 = 10, our objective is to isolate x. First, eliminate the constant by subtracting 4 from both sides to get 2x = 6. Then divide both sides by 2 to find x = 3.",
                    visual=VisualContent(
                        type="equation",
                        title="Step-by-Step Algebraic Transformation",
                        content="2x + 4 = 10\n2x = 10 - 4\n2x = 6\nx = 6 / 2\nx = 3"
                    )
                ),
                LessonStep(
                    id=4,
                    step_type="worked_example",
                    teacher_script="Let us verify our method with another problem: 3x + 6 = 15. Subtracting 6 gives 3x = 9. Dividing by 3 confirms x = 3. Notice the exact same systematic pattern.",
                    visual=VisualContent(
                        type="equation",
                        title="Worked Example: 3x + 6 = 15",
                        content="3x + 6 = 15\n3x = 15 - 6\n3x = 9\nx = 3"
                    )
                ),
                LessonStep(
                    id=5,
                    step_type="checkpoint",
                    teacher_script="Now it's your turn! Concept check: If 2x + 4 = 10, what is the value of x?",
                    question="If 2x + 4 = 10, what is the value of x?",
                    options=["x = 3", "x = 2", "x = 7", "x = 5"],
                    correct_answer="x = 3",
                    misconception_guide="First subtract 4 from both sides: 2x = 6. Then divide both sides by 2: x = 3. (Common mistake: subtracting 4 from only one side yields an unbalanced equation)."
                ),
                LessonStep(
                    id=6,
                    step_type="summary",
                    teacher_script="Phenomenal work! You now understand the fundamental principle of linear equations: maintain balanced operations across the equal sign to isolate the unknown variable.",
                    visual=VisualContent(
                        type="bullet_points",
                        title="Linear Equations — Mastered Principles",
                        content="• An equation is a balanced statement of equivalence.\n• Subtract or add constants to both sides first.\n• Divide by the variable's coefficient to isolate x.\n• Always verify by substituting your answer back into the original equation."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 1. Hooke's Law & Elasticity / Mechanics
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["hooke", "elastic", "spring", "restoring force"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are investigating {clean_topic}. When you deform a solid spring or elastic body, it exerts a proportional restoring force pulling back toward equilibrium.",
                    visual=VisualContent(
                        type="mermaid",
                        title=f"{clean_topic} — Mechanical System",
                        content="graph TD\n  Equilibrium[Equilibrium Position x = 0] -->|Applied External Force| Stretch[Displacement +x]\n  Stretch -->|Restoring Spring Force| Spring[F_restoring = -k * x]\n  Spring --> Oscillation[Simple Harmonic Motion]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="Hooke's Law states that the restoring force F is linearly proportional to displacement x, where k is the spring stiffness constant in Newtons per meter.",
                    visual=VisualContent(
                        type="katex",
                        title="Governing Equation & Elastic Energy",
                        content="F = -k \\cdot x \\quad \\implies \\quad U_e = \\frac{1}{2} k x^2"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Let's test your conceptual intuition! What happens to the restoring force if you double the spring displacement from x to 2x?",
                    question="If a spring obeys Hooke's Law and its displacement is doubled from x to 2x, what happens to the magnitude of the restoring force?",
                    options=["Force doubles (2F)", "Force quadruples (4F)", "Force is halved (F/2)", "Force remains constant"],
                    correct_answer="Force doubles (2F)",
                    misconception_guide="Because F = -k·x is a direct linear relationship, doubling the displacement directly doubles the restoring force. (Note: Elastic potential energy quadruples because U = 1/2 k x^2, but force is linear)."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Excellent work! The negative sign denotes that the restoring force always opposes the displacement vector, driving simple harmonic motion.",
                    visual=VisualContent(
                        type="bullet_points",
                        title=f"{clean_topic} — Key Principles",
                        content="• F = -k·x: Force is proportional and opposite to displacement.\n• Spring constant k quantifies stiffness (N/m).\n• Elastic Potential Energy: U = (1/2)kx² stored during deformation.\n• Valid up to the material's elastic limit."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 2. Computer Science / Programming / OOP
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["oop", "class", "object", "programming", "python", "java", "c++", "javascript", "code", "dev", "function", "inheritance"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are exploring {clean_topic}. Object-Oriented Programming models real-world concepts into modular, reusable software entities.",
                    visual=VisualContent(
                        type="mermaid",
                        title=f"{clean_topic} — Class Hierarchy",
                        content="classDiagram\n  class Blueprint {\n    +String name\n    +executeAction()\n  }\n  class ObjectInstance {\n    +state = active\n  }\n  Blueprint <|-- ObjectInstance"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="Think of a Class as an architectural blueprint, and Objects as the actual runtime instances constructed from that blueprint.",
                    visual=VisualContent(
                        type="code",
                        title="Object-Oriented Implementation in Python",
                        content="# Class Blueprint Definition\nclass Student:\n    def __init__(self, name: str, level: str):\n        self.name = name          # Public Attribute\n        self.__score = 0          # Private Encapsulated State\n\n    def submit_task(self, points: int):\n        \"\"\"Mutator method enforcing validation\"\"\"\n        self.__score += points\n        return f\"{self.name} updated score: {self.__score}\"\n\n# Object Instantiation\ns = Student('Aarav', 'Intermediate')\nprint(s.submit_task(95))"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Let's check your understanding of core OOP pillars!",
                    question="Which core OOP pillar allows a child class to inherit and extend methods and attributes from a parent class?",
                    options=["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
                    correct_answer="Inheritance",
                    misconception_guide="If you selected Encapsulation, note that Encapsulation hides state, whereas Inheritance provides hierarchical code reuse."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Outstanding! You've mastered how classes structure state and methods, objects instantiate them, and inheritance eliminates code duplication.",
                    visual=VisualContent(
                        type="bullet_points",
                        title=f"{clean_topic} — Core Takeaways",
                        content="• Classes define schemas; Objects represent concrete runtime instances.\n• Encapsulation hides sensitive internal state.\n• Inheritance builds clean hierarchies and prevents redundant code.\n• Polymorphism enables unified interfaces across distinct implementations."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 3. AI / Machine Learning & Neural Networks
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["ai", "machine learning", "neural", "deep learning", "model", "gradient"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are exploring {clean_topic}. Neural networks learn representations by iteratively minimizing error across training data.",
                    visual=VisualContent(
                        type="mermaid",
                        title=f"{clean_topic} — Training Pipeline",
                        content="graph LR\n  Input[Input Features X] --> Dense[Hidden Layers & Activations]\n  Dense --> Output[Prediction Y_hat]\n  Output --> Loss[Loss Function L]\n  Loss -->|Backpropagation| Optimizer[Gradient Descent Optimizer]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="Weights update via Gradient Descent by computing the partial derivative of the loss with respect to each model parameter.",
                    visual=VisualContent(
                        type="katex",
                        title="Gradient Descent Update Rule",
                        content="\\theta_{t+1} = \\theta_t - \\eta \\cdot \\nabla_\\theta \\mathcal{L}(\\theta)"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Checkpoint time! What role does the learning rate (eta) play in gradient descent?",
                    question="In machine learning gradient descent optimization, what happens if the learning rate is set excessively high?",
                    options=["The model may overshoot the minimum and diverge", "The model always converges faster to the global minimum", "Training stops immediately after 1 epoch", "The loss function automatically becomes zero"],
                    correct_answer="The model may overshoot the minimum and diverge",
                    misconception_guide="An excessively high learning rate causes parameter updates to jump past the local or global minimum, causing oscillations and numerical divergence."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Great job! You've learned how forward passes compute predictions, loss functions quantify error, and backpropagation calculates gradients.",
                    visual=VisualContent(
                        type="bullet_points",
                        title=f"{clean_topic} — Summary",
                        content="• Forward Pass: Computes activations and predicted probabilities.\n• Loss Function: Measures divergence from ground-truth labels.\n• Backpropagation: Computes analytical gradients via the calculus chain rule.\n• Optimization: Adjusts weights along the steepest descent gradient."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 4. Biology / Photosynthesis / Genetics
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["photo", "plant", "bio", "cell", "dna", "gene", "respiration", "chloroplast"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are exploring {clean_topic}. Plants convert solar radiant energy into chemical bond energy stored in glucose molecules.",
                    visual=VisualContent(
                        type="mermaid",
                        title="Photosynthetic Pathway & Organelles",
                        content="graph TD\n  Sun[Sunlight Photons] --> Chloroplast[Thylakoid Membrane]\n  Water[H2O] -->|Photolysis| LightReactions[Light-Dependent Reactions]\n  LightReactions -->|ATP + NADPH| CalvinCycle[Calvin Cycle in Stroma]\n  CO2[Atmospheric CO2] --> CalvinCycle\n  CalvinCycle --> Glucose[Glucose C6H12O6 + Oxygen O2]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="The overall chemical equation demonstrates the balanced transformation of carbon dioxide and water into glucose and oxygen:",
                    visual=VisualContent(
                        type="katex",
                        title="Balanced Chemical Reaction",
                        content="6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\;\\xrightarrow{\\text{chlorophyll}}\\; \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Let's check your conceptual understanding! Where do the light-independent reactions (Calvin cycle) take place?",
                    question="In plant cells, within which specific region of the chloroplast does the light-independent Calvin Cycle take place?",
                    options=["Stroma", "Thylakoid Lumen", "Outer Membrane", "Mitochondrial Matrix"],
                    correct_answer="Stroma",
                    misconception_guide="The light-dependent reactions occur on the thylakoid membranes where chlorophyll resides, while the enzymatic synthesis of sugar (Calvin Cycle) takes place in the surrounding fluid-filled stroma."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Splendid! Photosynthesis sustains nearly all aerobic life by oxygenating the atmosphere and producing the foundational biomass for global food webs.",
                    visual=VisualContent(
                        type="bullet_points",
                        title="Photosynthesis — Key Concepts",
                        content="• Light Reactions: Harvest photons, split water, generate ATP and NADPH.\n• Calvin Cycle: Carbon fixation converting CO2 into sugars in the stroma.\n• Chlorophyll pigments absorb blue and red wavelengths while reflecting green."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 5. Mathematics / Calculus / Derivatives / Rates of Change
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["calc", "deriv", "integral", "limit", "math", "tangent"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are studying {clean_topic}. Calculus gives us the analytical machinery to measure instantaneous rates of continuous change.",
                    visual=VisualContent(
                        type="mermaid",
                        title="Calculus Foundation & Dual Operators",
                        content="graph TD\n  Function[Function f(x)] -->|Differentiation| Derivative[f'(x) Instantaneous Slope]\n  Derivative -->|Integration| AntiDerivative[f(x) Cumulative Area Under Curve]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="The fundamental derivative limit definition and the algebraic Power Rule allow us to differentiate any polynomial curve:",
                    visual=VisualContent(
                        type="katex",
                        title="Limit Definition & Power Rule",
                        content="f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\quad \\implies \\quad \\frac{d}{dx}\\left[x^n\\right] = n x^{n-1}"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Let's test your calculation! What is the derivative of f(x) = 4x^3 - 5x with respect to x?",
                    question="What is the derivative of f(x) = 4x^3 - 5x with respect to x?",
                    options=["12x^2 - 5", "12x^2", "7x^2 - 5", "4x^2 - 5"],
                    correct_answer="12x^2 - 5",
                    misconception_guide="Apply the power rule term by term: d/dx[4x^3] = 4*(3x^2) = 12x^2, and d/dx[-5x] = -5. Thus f'(x) = 12x^2 - 5."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Outstanding! Derivatives reveal rates of change and critical optimization points, while integrals compute accumulated totals.",
                    visual=VisualContent(
                        type="bullet_points",
                        title="Calculus — Core Takeaways",
                        content="• Derivative measures instantaneous rate of change (slope of tangent line).\n• Power Rule: d/dx[x^n] = n*x^(n-1).\n• Critical points occur where f'(x) = 0 (maxima/minima).\n• Fundamental Theorem of Calculus links derivatives and integrals as inverse operators."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 6. Algorithms / Data Structures / Binary Search
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["binary search", "sort", "algorithm", "tree", "graph", "dsa", "recursion", "array", "stack", "queue"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we are dissecting {clean_topic}. In computer science, efficient search and data organization enable systems to scale to billions of records.",
                    visual=VisualContent(
                        type="mermaid",
                        title="Search Space Bisection",
                        content="graph TD\n  Input[Sorted Array O(N)] --> Mid[Inspect Middle Index]\n  Mid -->|Target < Middle| Left[Search Left Half: High = Mid - 1]\n  Mid -->|Target > Middle| Right[Search Right Half: Low = Mid + 1]\n  Mid -->|Target == Middle| Found[Element Found! O(log N)]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="By halving the search space on each comparison, Binary Search achieves logarithmic O(log N) time complexity:",
                    visual=VisualContent(
                        type="code",
                        title="Binary Search Algorithm in Python",
                        content="def binary_search(arr: list, target: int) -> int:\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid          # Target found!\n        elif arr[mid] < target:\n            low = mid + 1       # Discard left half\n        else:\n            high = mid - 1      # Discard right half\n    return -1                   # Target not present"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Quick algorithm check! What is the prerequisite condition for Binary Search to work?",
                    question="What fundamental precondition must an array satisfy before Binary Search can be executed correctly?",
                    options=["The array elements must be strictly sorted", "The array must contain only positive integers", "The array size must be a power of two", "The array must be stored in a hash map"],
                    correct_answer="The array elements must be strictly sorted",
                    misconception_guide="Binary Search relies on sorted order to guarantee whether the target lies in the left or right sub-array. On unsorted data, it will fail."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Brilliant! Binary search turns a million-item search into just 20 comparisons due to log2(1,000,000) ≈ 20.",
                    visual=VisualContent(
                        type="bullet_points",
                        title="Search Algorithms — Takeaways",
                        content="• Binary Search achieves O(log N) runtime vs O(N) linear scan.\n• Crucial Precondition: Array must be sorted beforehand.\n• Space Complexity: O(1) iterative or O(log N) recursive call stack."
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 7. Physics / Circuits & Ohm's Law
    # -------------------------------------------------------------
    if any(k in t_lower for k in ["ohm", "circuit", "resistor", "electricity", "voltage", "current"]):
        return LessonPlan(
            topic=clean_topic,
            learner_level=level,
            target_duration_minutes=duration,
            language=language,
            estimated_steps=4,
            steps=[
                LessonStep(
                    id=1,
                    step_type="intro",
                    teacher_script=f"Welcome! Today we will explore {clean_topic} — the foundational law governing current, voltage, and electrical resistance.",
                    visual=VisualContent(
                        type="mermaid",
                        title=f"{clean_topic} — Circuit Flow",
                        content="graph LR\n  Battery[Voltage Source V] -->|Current I| Resistor[Resistor R]\n  Resistor --> Ground[Ground Return]"
                    )
                ),
                LessonStep(
                    id=2,
                    step_type="demonstration",
                    teacher_script="Ohm's Law states that electric current through a conductor is directly proportional to the potential difference across it.",
                    visual=VisualContent(
                        type="katex",
                        title="Governing Equation",
                        content="V = I \\times R \\quad \\iff \\quad I = \\frac{V}{R}"
                    )
                ),
                LessonStep(
                    id=3,
                    step_type="checkpoint",
                    teacher_script="Quick checkpoint: What happens to current if resistance increases while voltage remains constant?",
                    question="What happens to current (I) if resistance (R) increases while voltage (V) remains constant?",
                    options=["Current decreases", "Current increases", "Current stays the same", "Resistance drops to zero"],
                    correct_answer="Current decreases",
                    misconception_guide="Resistance opposes the flow of electrons. Higher resistance restricts the flow, causing current to decrease."
                ),
                LessonStep(
                    id=4,
                    step_type="summary",
                    teacher_script="Great work! Voltage is the driving potential, current is the electron flow rate, and resistance opposes that flow.",
                    visual=VisualContent(
                        type="bullet_points",
                        title="Ohm's Law Summary",
                        content="• V = I * R (Volts = Amperes × Ohms)\n• Current is inversely proportional to resistance\n• Fundamental to every electronic circuit in the world"
                    )
                )
            ]
        )

    # -------------------------------------------------------------
    # 5. Universal Dynamic Subject Synthesizer
    # -------------------------------------------------------------
    step1_title = f"{clean_topic} — Core Architecture"
    mermaid_diagram = f"""graph TD
  Start["{clean_topic}"] --> Core["Theoretical Foundations"]
  Start --> Dynamics["Mechanism & Operations"]
  Core --> Applications["Applied Problem Solving"]
  Dynamics --> Verification["Evaluation & Validation"]"""

    return LessonPlan(
        topic=clean_topic,
        learner_level=level,
        target_duration_minutes=duration,
        language=language,
        estimated_steps=4,
        steps=[
            LessonStep(
                id=1,
                step_type="intro",
                teacher_script=f"Welcome! Today we are exploring {clean_topic}. Building a strong conceptual model here allows us to analyze complex systems and solve applied problems with confidence.",
                visual=VisualContent(
                    type="mermaid",
                    title=step1_title,
                    content=mermaid_diagram
                )
            ),
            LessonStep(
                id=2,
                step_type="demonstration",
                teacher_script=f"Let's break down the underlying mechanics of {clean_topic}. Every system is defined by its governing laws, key variables, and interaction principles.",
                visual=VisualContent(
                    type="bullet_points",
                    title=f"{clean_topic} — Working Principles",
                    content=f"• Governing Principle: Clear mathematical or conceptual definition of {clean_topic}.\n• Mechanism: How internal variables and boundary conditions interact.\n• Practical Application: How this framework is utilized in research and real-world engineering.\n• Verification Heuristic: Method for checking that results align with first principles."
                )
            ),
            LessonStep(
                id=3,
                step_type="checkpoint",
                teacher_script=f"Let's pause for a quick conceptual checkpoint on {clean_topic}!",
                question=f"Which of the following best reflects the core principle of {clean_topic}?",
                options=[
                    f"Understanding and applying the underlying mechanisms of {clean_topic}",
                    "Memorizing surface facts without analyzing cause and effect",
                    "Assuming outcomes occur randomly without governing rules",
                    "Ignoring contextual constraints and boundary conditions"
                ],
                correct_answer=f"Understanding and applying the underlying mechanisms of {clean_topic}",
                misconception_guide=f"A common pitfall is treating {clean_topic} as disconnected rules. Always trace the causal mechanisms and first principles."
            ),
            LessonStep(
                id=4,
                step_type="summary",
                teacher_script=f"Great job today! You have successfully established the foundational understanding and working intuition for {clean_topic}.",
                visual=VisualContent(
                    type="bullet_points",
                    title=f"{clean_topic} — Executive Summary",
                    content=f"• Core Concept: Master the primary drivers of {clean_topic}.\n• Causal Logic: Understand why each step follows from the previous step.\n• Next Step: Tackle advanced case studies and multi-variable problems."
                )
            )
        ]
    )
    return enrich_plan_with_scene_scripts(plan)


def detect_visual_classification(
    topic: str,
    step_type: str,
    visual_type: Optional[str] = None,
    visual_content: Optional[str] = None
) -> Dict[str, Any]:
    """Detects whether a concept is best expressed as a 3D object, progressive formula, diagram, or code."""
    t_low = (topic or "").lower()
    c_low = (visual_content or "").lower()
    vt_low = (visual_type or "").lower()

    # 1. Explicit Diagram / Flowchart
    if vt_low in ["mermaid", "diagram", "flowchart"] or (visual_content and ("-->" in visual_content or "graph " in visual_content or "classDiagram" in visual_content)):
        return {
            "type": "diagram",
            "mermaid": visual_content or "graph LR\n  A[Input] --> B[Processing] --> C[Output]",
            "description": "Animated Step-by-Step Flowchart"
        }

    # 2. Explicit Formula
    if vt_low in ["katex", "formula", "equation"]:
        formula_str = visual_content.strip() if visual_content else "2x + 4 = 10"
        raw_terms = re.findall(r"([+-]?\s*[\w\^\\]+|[=<>]+)", formula_str)
        terms = [t.strip() for t in raw_terms if t.strip()] or [formula_str]
        return {
            "type": "formula",
            "latex": formula_str,
            "terms": terms,
            "description": "Progressive Animated KaTeX Formula"
        }

    # 3. Explicit Code Block
    if vt_low in ["code", "code_block"]:
        return {
            "type": "code_block",
            "code": visual_content or "# Example Code\ndef solve_problem(n):\n    return n * 2",
            "language": "python" if "python" in t_low else "javascript",
            "description": "Syntax-Highlighted Code Walkthrough"
        }

    # 4. 3D Neural Networks & Machine Learning
    if any(k in t_low or k in c_low for k in ["neural", "perceptron", "deep learning", "gradient descent", "backprop", "weight", "activation layer"]):
        return {
            "type": "3d_object",
            "shape": "neural_net",
            "description": "3D Multilayer Perceptron Synapse Network",
            "layers": [3, 4, 2],
            "rotation_speed": 0.008
        }

    # 5. 3D Vector Space & Linear Transformations
    if any(k in t_low or k in c_low for k in ["vector", "matrix", "basis", "coordinate", "eigen", "dot product", "cross product", "subspace"]):
        return {
            "type": "3d_object",
            "shape": "vector_space",
            "description": "3D Cartesian Basis Vectors & Transformed Plane",
            "vectors": [
                {"name": "i", "coords": [2.5, 0, 0], "color": "#06b6d4"},
                {"name": "j", "coords": [0, 2.5, 0], "color": "#10b981"},
                {"name": "k", "coords": [0, 0, 2.5], "color": "#a855f7"},
                {"name": "v", "coords": [2.0, 1.8, 1.5], "color": "#f59e0b"}
            ],
            "rotation_speed": 0.005
        }

    # 6. 3D Physics Orbits / Gravitation / Harmonic Oscillators
    if any(k in t_low or k in c_low for k in ["orbit", "gravity", "gravitation", "kepler", "satellite", "oscillator", "pendulum", "spring", "kinematics", "solar"]):
        return {
            "type": "3d_object",
            "shape": "physics_orbit",
            "description": "3D Central Body Gravitational Field with Orbit & Velocity Vector",
            "orbit_radius": 3.2,
            "rotation_speed": 0.012
        }

    # 7. 3D Chemistry / Molecules
    if any(k in t_low or k in c_low for k in ["molecule", "bond", "atom", "orbital", "covalent", "h2o", "water", "methane", "ch4", "chemical bond"]):
        return {
            "type": "3d_object",
            "shape": "molecule",
            "description": "3D Ball-and-Stick Molecular Orbital Model",
            "molecule_name": "H2O Polar Molecule" if "water" in t_low or "h2o" in t_low else "Methane CH4",
            "rotation_speed": 0.009
        }

    # 8. 3D Geometry / Polyhedra / Spatial Math
    if any(k in t_low or k in c_low for k in ["geometry", "polyhedron", "dodecahedron", "cube", "sphere", "surface area", "topology", "spatial"]):
        return {
            "type": "3d_object",
            "shape": "geometry_polyhedron",
            "description": "3D Spatial Polyhedral Geometry with Shaded Faces",
            "poly_type": "dodecahedron",
            "rotation_speed": 0.007
        }

    # 9. Inferred KaTeX Formula from content
    if visual_content and ("=" in visual_content or "\\" in visual_content) and len(visual_content) < 180:
        formula_str = visual_content.strip()
        raw_terms = re.findall(r"([+-]?\s*[\w\^\\]+|[=<>]+)", formula_str)
        terms = [t.strip() for t in raw_terms if t.strip()] or [formula_str]
        return {
            "type": "formula",
            "latex": formula_str,
            "terms": terms,
            "description": "Progressive Animated KaTeX Formula"
        }

    # 8. Code Block
    if vt_low == "code" or any(k in t_low for k in ["python", "javascript", "algorithm", "code", "loop", "function"]):
        return {
            "type": "code_block",
            "code": visual_content or "# Example Code\ndef solve_problem(n):\n    return n * 2",
            "language": "python" if "python" in t_low else "javascript",
            "description": "Syntax-Highlighted Code Walkthrough"
        }

    # 9. Default: Pedagogical Text Reveal
    return {
        "type": "text_reveal",
        "description": "Animated Concept Reveal Deck"
    }


def synthesize_scene_script(
    teacher_script: str,
    topic: str = "Lesson",
    step_type: str = "explanation",
    visual_type: Optional[str] = None,
    visual_title: Optional[str] = None,
    visual_content: Optional[str] = None,
    language: str = "en"
) -> List[SceneAction]:
    """
    Transforms any teacher script and visual into a choreographed 3Blue1Brown/Manim style scene script:
    - Sentences mapped to audio-synchronized timestamps.
    - Pedagogical visual types (3D WebGL scenes, progressive formulas, flowcharts, code blocks, animated reveals).
    - Camera zoom/pan instructions.
    - Dynamic virtual presenter pointer coordinates and focus tags.
    """
    clean_script = (teacher_script or "").strip()
    if not clean_script:
        clean_script = f"Welcome to our session on {topic}."

    # Split into spoken sentences
    raw_sentences = re.split(r"(?<=[.!?])\s+", clean_script)
    sentences = [s.strip() for s in raw_sentences if s.strip()]
    if not sentences:
        sentences = [clean_script]

    classification = detect_visual_classification(topic, step_type, visual_type, visual_content)
    primary_visual_type = classification["type"]

    scene_actions: List[SceneAction] = []
    current_time = 0.0

    # Pointer movement paths (X, Y percentage coords moving across canvas like a teacher)
    pointer_choreography = [
        {"x": 42.0, "y": 40.0, "label": "🎯 Core Definition & First Principle"},
        {"x": 58.0, "y": 52.0, "label": "🔍 Variable Relationship & Interaction"},
        {"x": 38.0, "y": 68.0, "label": "⚡ Dynamic Mechanism & State Change"},
        {"x": 62.0, "y": 46.0, "label": "💡 Synthesis & Practical Intuition"},
        {"x": 50.0, "y": 55.0, "label": "🌟 Key Takeaway & Mastery Check"}
    ]

    camera_choreography = [
        CameraInstruction(zoom=1.0, focus_target="overview", subtle_pan={"x": 0.0, "y": 0.0}),
        CameraInstruction(zoom=1.12, focus_target="primary_feature", subtle_pan={"x": -0.04, "y": 0.02}),
        CameraInstruction(zoom=1.22, focus_target="active_detail", subtle_pan={"x": 0.04, "y": -0.03}),
        CameraInstruction(zoom=1.10, focus_target="synthesis", subtle_pan={"x": 0.0, "y": 0.01}),
        CameraInstruction(zoom=1.02, focus_target="full_view", subtle_pan={"x": 0.0, "y": 0.0})
    ]

    total_sentences = len(sentences)

    for i, sentence in enumerate(sentences):
        words = len(sentence.split())
        # Word count duration: ~2.3 words/sec (min 3.0s per sentence cue for deliberate comprehension)
        duration = max(3.0, round(words * 0.44, 2))

        ch_idx = i % len(pointer_choreography)
        ptr_info = pointer_choreography[ch_idx]
        cam_info = camera_choreography[i % len(camera_choreography)]

        # Specific payload customization per scene cue
        payload: Dict[str, Any] = {
            "title": visual_title or topic,
            "sentence_index": i,
            "total_sentences": total_sentences,
            "topic": topic,
            "raw_content": visual_content or "",
        }

        if primary_visual_type == "3d_object":
            payload.update({
                "shape": classification.get("shape", "neural_net"),
                "description": classification.get("description", ""),
                "rotation_speed": classification.get("rotation_speed", 0.008) * (1.0 + (i * 0.15)),
                "focus_element": f"element_{i + 1}",
                "vectors": classification.get("vectors", []),
                "layers": classification.get("layers", [3, 4, 2]),
                "active_layer_index": i % 3
            })
            active_type = "3d_object"

        elif primary_visual_type == "formula":
            terms = classification.get("terms", [])
            active_term_idx = min(i, max(0, len(terms) - 1)) if terms else 0
            active_term = terms[active_term_idx] if terms else classification.get("latex", "")
            payload.update({
                "latex": classification.get("latex", "2x + 4 = 10"),
                "terms": terms,
                "active_term": active_term,
                "active_term_index": active_term_idx,
                "term_intuition": f"Observing component: {active_term}"
            })
            active_type = "formula"

        elif primary_visual_type == "diagram":
            payload.update({
                "mermaid": classification.get("mermaid", ""),
                "active_node_index": i,
                "step_label": f"Phase {i + 1} of process"
            })
            active_type = "diagram"

        elif primary_visual_type == "code_block":
            payload.update({
                "code": classification.get("code", ""),
                "language": classification.get("language", "python"),
                "active_line": i + 1
            })
            active_type = "code_block"

        else:
            # text_reveal
            bullets = [b.strip().lstrip("•-* ") for b in (visual_content or "").split("\n") if b.strip()]
            if not bullets:
                bullets = [sentence]
            active_bullet_idx = min(i, len(bullets) - 1)
            payload.update({
                "heading": visual_title or f"{topic} Key Insight",
                "bullets": bullets,
                "active_bullet_index": active_bullet_idx,
                "active_bullet_text": bullets[active_bullet_idx]
            })
            active_type = "text_reveal"

        action = SceneAction(
            id=f"cue_{i + 1}",
            narration_text=sentence,
            start_time=round(current_time, 2),
            duration=duration,
            visual_type=active_type,
            visual_payload=payload,
            camera=cam_info,
            pointer=PointerInstruction(
                active=True,
                target_id=f"target_elem_{i + 1}",
                label=ptr_info["label"],
                coords={"x": ptr_info["x"], "y": ptr_info["y"]}
            )
        )
        scene_actions.append(action)
        current_time += duration

    return verify_and_refine_scene_actions(scene_actions, topic)


def verify_and_refine_scene_actions(
    actions: List[SceneAction],
    topic: str
) -> List[SceneAction]:
    """
    Lightweight pedagogical verification & content-grounding pass:
    - Verifies formula term grounding: ensures active_term exists in LaTeX string, checks brace balance.
    - Verifies 3D spatial alignment: ensures 3D shape reflects spoken context (molecule vs orbit vs neural net).
    - Verifies Mermaid flowchart syntax: ensures valid directive and safe fallback.
    - Logs discrepancies to surface silent generation failures.
    """
    verified_actions: List[SceneAction] = []

    for idx, act in enumerate(actions):
        v_type = act.visual_type
        payload = act.visual_payload or {}
        narration = (act.narration_text or "").lower()

        # 1. Formula Grounding Verification
        if v_type == "formula":
            latex = payload.get("latex", "")
            active_term = payload.get("active_term", "")

            # Check brace balancing in LaTeX
            if latex.count("{") != latex.count("}"):
                logger.warning(
                    f"[Accuracy Verification Failed]: Scene {idx + 1} ({topic}) has unbalanced LaTeX braces: {latex}. Sanitizing formula."
                )
                # Auto-balance simple brace mismatches
                diff = latex.count("{") - latex.count("}")
                if diff > 0:
                    latex = latex + ("}" * diff)
                payload["latex"] = latex

            # Verify active_term exists in LaTeX string
            clean_term = active_term.strip()
            if clean_term and clean_term not in latex:
                logger.warning(
                    f"[Accuracy Verification]: Scene {idx + 1} active_term '{clean_term}' not found in formula '{latex}'. Falling back to primary equation."
                )
                payload["active_term"] = latex
                payload["term_intuition"] = f"Observing primary relationship: {latex}"

        # 2. 3D Spatial Context Alignment
        elif v_type == "3d_object":
            shape = payload.get("shape", "")
            # Check for concept-to-shape alignment
            if any(k in narration for k in ["molecule", "bond", "atom", "h2o", "water"]) and shape != "molecule":
                logger.info(f"[Accuracy Verification Correction]: Scene {idx + 1} matched chemistry context. Aligning shape to 'molecule'.")
                payload["shape"] = "molecule"
                payload["molecule_name"] = "H2O Polar Molecule"
            elif any(k in narration for k in ["orbit", "planet", "gravity", "gravitation", "kepler"]) and shape != "physics_orbit":
                logger.info(f"[Accuracy Verification Correction]: Scene {idx + 1} matched orbital mechanics context. Aligning shape to 'physics_orbit'.")
                payload["shape"] = "physics_orbit"

        # 3. Diagram Syntax Integrity
        elif v_type == "diagram":
            mermaid_code = payload.get("mermaid", "")
            if not mermaid_code or not any(mermaid_code.strip().startswith(prefix) for prefix in ["graph", "flowchart", "classDiagram", "sequenceDiagram"]):
                logger.warning(f"[Accuracy Verification]: Scene {idx + 1} invalid Mermaid directive. Auto-prefixing 'graph LR'.")
                payload["mermaid"] = f"graph LR\n  {mermaid_code}" if mermaid_code else "graph LR\n  A[Input] --> B[Output]"

        # 4. Pointer Coordinates Bounding
        if act.pointer and act.pointer.coords:
            cx = max(10.0, min(88.0, act.pointer.coords.get("x", 50.0)))
            cy = max(14.0, min(84.0, act.pointer.coords.get("y", 50.0)))
            act.pointer.coords["x"] = cx
            act.pointer.coords["y"] = cy

        act.visual_payload = payload
        verified_actions.append(act)

    return verified_actions


def enrich_plan_with_scene_scripts(plan: LessonPlan) -> LessonPlan:
    """Enriches all steps in a lesson plan with detailed synchronized scene scripts."""
    for step in plan.steps:
        if not step.scene_script:
            v_type = step.visual.type if step.visual else None
            v_title = step.visual.title if step.visual else None
            v_content = step.visual.content if step.visual else None

            step.scene_script = synthesize_scene_script(
                teacher_script=step.teacher_script,
                topic=plan.topic,
                step_type=step.step_type,
                visual_type=v_type,
                visual_title=v_title,
                visual_content=v_content,
                language=plan.language
            )
    return plan


def convert_storyboard_to_lesson_plan(storyboard: Any, language: str = "en") -> LessonPlan:
    """
    Transforms a strict Storyboard object into a LessonPlan with full backwards
    compatibility for existing audio synchronization, checkpoints, and visual rendering.
    """
    steps: List[LessonStep] = []
    scenes = storyboard.scenes if hasattr(storyboard, "scenes") else []

    for idx, scene in enumerate(scenes):
        is_first = (idx == 0)
        is_last = (idx == len(scenes) - 1)
        step_type = "intro" if is_first else ("summary" if is_last else "demonstration")

        comp = scene.component or "ConceptReveal"
        props = scene.component_props or {}

        # Derive visual representation safely handling dict or string steps
        if comp in ["EquationBuild", "StepByStep"]:
            v_type = "katex"
            steps_list = props.get("steps", [])
            if steps_list:
                rendered_steps = []
                for s in steps_list:
                    if isinstance(s, dict):
                        st_label = s.get("step", s.get("label", ""))
                        st_latex = s.get("latex", s.get("formula", s.get("value", "")))
                        rendered_steps.append(f"{st_label}: {st_latex}".strip(": "))
                    else:
                        rendered_steps.append(str(s))
                v_content = "\\begin{aligned} " + " \\\\ ".join(rendered_steps) + " \\end{aligned}"
            else:
                v_content = str(props.get("formula") or scene.title)
        elif comp in ["CodeExecution"]:
            v_type = "code"
            v_content = props.get("code", "# Algorithm execution\nprint('Processing data')")
        elif comp in ["ProcessFlow", "Flowchart", "Diagram"]:
            v_type = "mermaid"
            stages = props.get("stages", props.get("steps", []))
            if stages:
                rendered_stages = []
                for i, st in enumerate(stages):
                    if isinstance(st, dict):
                        st_name = st.get("name", st.get("title", f"Stage {i+1}"))
                    else:
                        st_name = str(st)
                    clean_name = re.sub(r'["\[\]\(\)\{\}]', '', st_name)
                    rendered_stages.append(f'S{i+1}["{clean_name}"]')
                v_content = "graph LR\n  " + " --> ".join(rendered_stages)
            else:
                v_content = props.get("mermaid", "graph LR\n  A[Input] --> B[Processing] --> C[Output]")
        elif comp in ["Molecule", "Anatomy"]:
            v_type = "3d_object"
            v_content = f"Visual model: {comp} - {scene.title}"
        else:
            v_type = "bullet_points"
            v_content = "\n".join([f"• {e.label}: {e.value or ''}".strip(": ") for e in scene.elements])

        # Map scene actions to SceneAction models
        scene_actions: List[SceneAction] = []
        for a_idx, act in enumerate(scene.actions):
            scene_actions.append(SceneAction(
                id=f"cue_{idx+1}_{a_idx+1}",
                narration_text=scene.narration,
                start_time=act.start_time,
                duration=act.duration,
                visual_type=comp.lower(),
                visual_payload={
                    "component": comp,
                    "component_props": props,
                    "elements": [e.model_dump() for e in scene.elements],
                    "title": scene.title,
                    "objective": scene.objective,
                },
                action_type=act.action_type,
                target_id=act.target_id,
                payload=act.payload or {}
            ))

        if not scene_actions:
            scene_actions.append(SceneAction(
                id=f"cue_{idx+1}_1",
                narration_text=scene.narration,
                start_time=0.0,
                duration=scene.duration,
                action_type=comp.lower(),
                payload={
                    "component": comp,
                    "component_props": props,
                    "elements": [e.model_dump() for e in scene.elements],
                    "title": scene.title,
                    "objective": scene.objective,
                }
            ))

        step = LessonStep(
            id=idx + 1,
            step_type=step_type,
            teacher_script=scene.narration,
            visual=VisualContent(
                type=v_type,
                title=scene.title,
                content=v_content
            ),
            scene_script=scene_actions,
            storyboard_scene=scene.model_dump()
        )
        steps.append(step)

    # Inject an interactive checkpoint step before the final summary
    if len(steps) >= 2 and not any(s.step_type == "checkpoint" for s in steps):
        t_lower = (storyboard.title or "").lower()
        
        # 1. C Language / Systems Programming / Pointers
        if any(k in t_lower for k in ["c language", "c programming", "pointer", "memory", "\\bc\\b", "c++", "malloc"]):
            q_text = "In C programming, what does the dereference operator (*ptr) do when ptr holds the address of a variable?"
            opts = [
                "Accesses or modifies the value stored at the memory address pointed to by ptr",
                "Allocates automatic garbage-collected dynamic memory",
                "Directly converts C source code into interpreted bytecode",
                "Returns the stack address of ptr itself instead of the target variable"
            ]
            ans = "Accesses or modifies the value stored at the memory address pointed to by ptr"
            disc = "In C, the '&' operator yields a memory address, while '*' (dereferencing) accesses or modifies the value stored at that address."
            v_chk = VisualContent(
                type="code",
                title="C Pointer & Memory Inspection",
                content="int val = 42;\nint *ptr = &val; // ptr stores address of val (e.g. 0x7ffd)\n\n// What does this operation accomplish?\n*ptr = 99; // Modifies val through its memory address!"
            )
        # 2. Linear Equations & Algebra
        elif "equation" in t_lower or "linear" in t_lower:
            q_text = "In 3x + 6 = 15, what is the first operation to isolate x?"
            opts = ["Subtract 6 from both sides", "Divide by 3", "Multiply by 6", "Add 15"]
            ans = "Subtract 6 from both sides"
            disc = "Subtracting 6 leaves 3x = 9, isolating the variable term first."
            v_chk = VisualContent(
                type="katex",
                title="Equation Checkpoint",
                content="3x + 6 = 15 \\implies 3x = 15 - 6"
            )
        # 3. Binary Search / Data Structures
        elif "binary" in t_lower or "search" in t_lower:
            q_text = "What is the key requirement for binary search to function correctly?"
            opts = ["The array must be sorted", "The array must contain only positive integers", "Array size must be a power of 2", "All elements must be distinct"]
            ans = "The array must be sorted"
            disc = "Binary search requires sorted order to determine whether to discard the left or right half."
            v_chk = VisualContent(
                type="code",
                title="Binary Search Invariant",
                content="// Array must maintain sorted order: A[0] <= A[1] <= ... <= A[n-1]\nint low = 0, high = n - 1;\nint mid = low + (high - low) / 2;"
            )
        # 4. Physics / Forces / Newton's Laws
        elif "newton" in t_lower or "force" in t_lower:
            q_text = "If net force on an object is doubled while mass is constant, what happens to acceleration?"
            opts = ["Acceleration doubles", "Acceleration is halved", "Acceleration stays the same", "Acceleration is quadrupled"]
            ans = "Acceleration doubles"
            disc = "From F = ma, acceleration is directly proportional to net force."
            v_chk = VisualContent(
                type="katex",
                title="Newton's Second Law",
                content="F = m \\cdot a \\implies a = \\frac{F}{m}"
            )
        # 5. Biology / Photosynthesis
        elif "photo" in t_lower or "cell" in t_lower or "chloroplast" in t_lower:
            q_text = "In photosynthesis, where do the light-dependent reactions occur within the chloroplast?"
            opts = ["Thylakoid membranes", "Stroma fluid", "Mitochondrial matrix", "Outer cell wall"]
            ans = "Thylakoid membranes"
            disc = "Light reactions take place in the thylakoid membrane where chlorophyll absorbs sunlight."
            v_chk = VisualContent(
                type="mermaid",
                title="Photosynthesis Site Checkpoint",
                content="graph LR\n  Sunlight[Light Energy] --> Thylakoid[Thylakoid Membrane]\n  Thylakoid --> ATP[ATP + NADPH]\n  ATP --> Stroma[Stroma / Calvin Cycle]"
            )
        else:
            q_text = f"Which mechanism accurately describes the foundational behavior of {storyboard.title}?"
            opts = [
                f"{storyboard.core_concept}",
                "Operating without causal state transitions or predictable rules",
                "Evaluating inputs in reverse order without verifying boundary conditions",
                "Discarding state variables arbitrarily at each execution phase"
            ]
            ans = storyboard.core_concept
            disc = f"{storyboard.title} is governed by {storyboard.core_concept}."
            v_chk = VisualContent(
                type="bullet_points",
                title=f"Concept Check: {storyboard.title}",
                content=f"• Core Invariant: {storyboard.core_concept}\n• Verify comprehension before proceeding."
            )

        chk_step = LessonStep(
            id=len(steps),
            step_type="checkpoint",
            teacher_script=f"Let us test your intuition on {storyboard.title}. {q_text}",
            visual=v_chk,
            question=q_text,
            options=opts,
            correct_answer=ans,
            misconception_guide=disc
        )
        # Insert right before the last summary step
        steps.insert(len(steps) - 1, chk_step)
        # Re-index ids
        for i, s in enumerate(steps):
            s.id = i + 1

    return LessonPlan(
        topic=storyboard.title,
        learner_level=storyboard.difficulty,
        target_duration_minutes=len(steps) * 4,
        language=language,
        estimated_steps=len(steps),
        steps=steps,
        storyboard=storyboard.model_dump()
    )
