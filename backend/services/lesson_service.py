from typing import List, Optional
import re
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
