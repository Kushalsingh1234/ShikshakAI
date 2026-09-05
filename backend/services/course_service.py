import os
import json
import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CourseTopic(BaseModel):
    id: str
    number: int
    title: str
    description: str
    duration: str = "20 min"
    isCompleted: bool = False

class CourseModel(BaseModel):
    id: str
    title: str
    topic: str
    category: str = "General Studies"
    level: str = "Beginner to Advanced"
    duration: str = "3.0 hours"
    description: str
    tags: List[str] = Field(default_factory=list)
    createdAt: Optional[str] = None
    topics: List[CourseTopic] = Field(default_factory=list)

def generate_curated_course(topic: str, level: str = "beginner") -> CourseModel:
    t_clean = (topic or "Foundational Concept").strip()
    t_lower = t_clean.lower()
    cid = f"course_{re.sub(r'[^a-z0-9]+', '_', t_lower)}_{abs(hash(t_clean)) % 10000}"

    # 1. C Language & Systems Programming
    if any(k in t_lower for k in ["c language", "c programming", "pointer", "memory", "\\bc\\b", "c++", "malloc"]):
        return CourseModel(
            id=cid,
            title=f"C Language: Complete Systems & Memory Mastery",
            topic=t_clean,
            category="Computer Science",
            level="Beginner to Advanced",
            duration="3.5 hours",
            description=f"A complete curriculum mastering C: compilation pipeline, memory layouts, pointer arithmetic, dynamic memory, and hardware interfaces.",
            tags=["C", "Systems", "Pointers", "Memory", "Compilers"],
            topics=[
                CourseTopic(
                    id=f"{cid}_1",
                    number=1,
                    title="C Architecture, Compilation Pipeline & main()",
                    description="How the preprocessor, compiler, assembler, and linker create native machine binaries.",
                    duration="20 min"
                ),
                CourseTopic(
                    id=f"{cid}_2",
                    number=2,
                    title="Variables, Primitive Types & RAM Byte Layouts",
                    description="Physical storage sizes of int, char, float, format specifiers, and printf/scanf.",
                    duration="22 min"
                ),
                CourseTopic(
                    id=f"{cid}_3",
                    number=3,
                    title="Operators, Bitwise Masks & Expression Precedence",
                    description="Arithmetic precedence, relational logic, and low-level bitwise operations (&, |, ^).",
                    duration="20 min"
                ),
                CourseTopic(
                    id=f"{cid}_4",
                    number=4,
                    title="Control Flow: Conditionals & Optimized Iteration Loops",
                    description="Branching with if-else/switch, and iterative loops (for, while, do-while) with branch prediction.",
                    duration="25 min"
                ),
                CourseTopic(
                    id=f"{cid}_5",
                    number=5,
                    title="Functions, Call Stack Frames & Scope Rules",
                    description="Function prototypes, stack allocation, passing by value vs reference, and recursion.",
                    duration="25 min"
                ),
                CourseTopic(
                    id=f"{cid}_6",
                    number=6,
                    title="Pointers & Physical Memory Address Referencing",
                    description="The '&' and '*' operators, address arithmetic, hex memory pointers, and inspection.",
                    duration="30 min"
                ),
                CourseTopic(
                    id=f"{cid}_7",
                    number=7,
                    title="Arrays, Pointer Arithmetic & Null-Terminated Strings",
                    description="Contiguous memory layouts, pointer step sizes, and string manipulation without buffer overflow.",
                    duration="25 min"
                ),
                CourseTopic(
                    id=f"{cid}_8",
                    number=8,
                    title="Dynamic Heap Allocation (malloc, free) & Structs",
                    description="Manual heap allocation, avoiding memory leaks, valgrind checks, and composite struct data models.",
                    duration="30 min"
                )
            ]
        )

    # 2. Linear Equations & Mathematics
    if any(k in t_lower for k in ["linear", "equation", "algebra", "calculus", "derivative"]):
        return CourseModel(
            id=cid,
            title=f"{t_clean}: Step-by-Step Mathematical Mastery",
            topic=t_clean,
            category="Mathematics",
            level="Beginner to Intermediate",
            duration="2.5 hours",
            description=f"Master {t_clean} through visual derivations, inverse operations, graphical representations, and problem-solving heuristics.",
            tags=["Mathematics", "Algebra", "Derivations", "Equations"],
            topics=[
                CourseTopic(id=f"{cid}_1", number=1, title="Foundational Axioms & Equality Invariants", description="The balanced scale principle and preserving truth across equals signs.", duration="20 min"),
                CourseTopic(id=f"{cid}_2", number=2, title="Inverse Operations & Variable Isolation", description="Systematic subtraction/addition of constants and division by coefficients.", duration="25 min"),
                CourseTopic(id=f"{cid}_3", number=3, title="Multi-Variable Systems & Graphing", description="Visualizing slopes, rates of change, and coordinate intersections.", duration="25 min"),
                CourseTopic(id=f"{cid}_4", number=4, title="Analytical Problem Solving & Applied Case Studies", description="Translating word problems into mathematical models and verifying roots.", duration="25 min"),
                CourseTopic(id=f"{cid}_5", number=5, title="Mastery Review & Boundary Edge Cases", description="Infinite solutions, no-solution paradoxes, and validation checks.", duration="20 min")
            ]
        )

    # 3. Dynamic General Syllabus for Any Topic
    return CourseModel(
        id=cid,
        title=f"{t_clean}: Complete Comprehensive Course",
        topic=t_clean,
        category="Curriculum Studies",
        level=level.capitalize(),
        duration="2.5 hours",
        description=f"A structured topic-by-topic course covering every foundational concept, mechanism, application, and mastery metric of {t_clean}.",
        tags=[t_clean, "Course", "Curriculum", "Mastery"],
        topics=[
            CourseTopic(
                id=f"{cid}_1",
                number=1,
                title=f"{t_clean}: Foundations, Origins & Core Definitions",
                description=f"Understand the foundational history, scope, and primary axioms of {t_clean}.",
                duration="20 min"
            ),
            CourseTopic(
                id=f"{cid}_2",
                number=2,
                title=f"{t_clean}: Underlying Mechanics & Governing Laws",
                description=f"Deconstruct the internal variables, causal relationships, and state transitions of {t_clean}.",
                duration="25 min"
            ),
            CourseTopic(
                id=f"{cid}_3",
                number=3,
                title=f"{t_clean}: Step-by-Step Methodology & Frameworks",
                description=f"Systematic problem-solving patterns and operational models for {t_clean}.",
                duration="25 min"
            ),
            CourseTopic(
                id=f"{cid}_4",
                number=4,
                title=f"{t_clean}: Practical Applications & Case Studies",
                description=f"How {t_clean} is utilized in engineering, industry, and real-world scenarios.",
                duration="25 min"
            ),
            CourseTopic(
                id=f"{cid}_5",
                number=5,
                title=f"{t_clean}: Common Pitfalls, Edge Cases & Invariants",
                description=f"Address frequent misconceptions and critical boundary conditions in {t_clean}.",
                duration="20 min"
            ),
            CourseTopic(
                id=f"{cid}_6",
                number=6,
                title=f"{t_clean}: Synthesis, Review & Advanced Mastery",
                description=f"Synthesize comprehensive mental models and test applied understanding.",
                duration="25 min"
            )
        ]
    )
