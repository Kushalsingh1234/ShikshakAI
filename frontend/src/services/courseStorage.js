// Persistent storage and syllabus generator for multi-topic courses

const STORAGE_KEY = "shikshak_user_courses";

export const DEFAULT_CURATED_COURSES = [
  {
    id: "course_c_language",
    title: "C Language: Complete Systems & Memory Mastery",
    topic: "c language",
    category: "Computer Science",
    level: "Beginner to Advanced",
    duration: "3.5 hours",
    description: "Master C from first principles: hardware memory layouts, pointer arithmetic, dynamic heap allocation, and native compilation.",
    tags: ["C", "Pointers", "Memory", "Compilers", "Systems"],
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: "c_t1",
        number: 1,
        title: "C Program Architecture, Native Compilation & main()",
        description: "How the preprocessor, compiler, assembler, and linker generate native machine code from main().",
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: "c_t2",
        number: 2,
        title: "Variables, Primitive Types & Memory Formats",
        description: "Byte representations of int, char, float, double, format specifiers, and printf/scanf.",
        duration: "22 min",
        isCompleted: false,
      },
      {
        id: "c_t3",
        number: 3,
        title: "Operators, Bitwise Logic & Expression Evaluation",
        description: "Arithmetic precedence, relational checks, and low-level bitwise masking (&, |, ^, ~).",
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: "c_t4",
        number: 4,
        title: "Control Flow: Conditionals, Switch & Iteration Loops",
        description: "Predictable branching with if-else and switch; optimizing for, while, and do-while loops.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "c_t5",
        number: 5,
        title: "Functions, Call Stack Frames & Scope Rules",
        description: "Stack allocation, passing arguments by value vs reference, and recursive execution.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "c_t6",
        number: 6,
        title: "Pointers & Physical Memory Address Referencing",
        description: "The '&' address-of operator, '*' dereferencing, hex pointers, and memory manipulation.",
        duration: "30 min",
        isCompleted: false,
      },
      {
        id: "c_t7",
        number: 7,
        title: "Arrays, Pointer Arithmetic & Null-Terminated Strings",
        description: "Contiguous RAM array layouts, pointer step sizes, and string manipulation without buffer overflows.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "c_t8",
        number: 8,
        title: "Dynamic Heap Allocation (malloc, free) & Structs",
        description: "Manual heap memory management, preventing memory leaks, and composite struct definitions.",
        duration: "30 min",
        isCompleted: false,
      },
    ],
  },
  {
    id: "course_linear_algebra",
    title: "Linear Equations & Algebra Foundations",
    topic: "linear equations",
    category: "Mathematics",
    level: "Beginner",
    duration: "2.0 hours",
    description: "Systematic isolation of unknown variables, balanced scale transformations, slope-intercept equations, and systems of linear equations.",
    tags: ["Algebra", "Equations", "Slope", "Variables"],
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: "lin_t1",
        number: 1,
        title: "The Balanced Scale Principle & One-Step Equations",
        description: "Maintaining equivalence by applying identical inverse operations to both sides.",
        duration: "18 min",
        isCompleted: false,
      },
      {
        id: "lin_t2",
        number: 2,
        title: "Multi-Step Linear Equations & Isolating x",
        description: "Combining like terms, peeling off constants, and canceling coefficients systematically.",
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: "lin_t3",
        number: 3,
        title: "Variables on Both Sides & Identity Equations",
        description: "Resolving expressions with variable terms on left and right, and detecting infinite/no solution cases.",
        duration: "22 min",
        isCompleted: false,
      },
      {
        id: "lin_t4",
        number: 4,
        title: "Slope-Intercept Form (y = mx + b) & Graphing",
        description: "Visualizing rate of change (m) and starting intercept (b) on the Cartesian coordinate plane.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "lin_t5",
        number: 5,
        title: "Systems of Linear Equations: Substitution & Elimination",
        description: "Finding intersection coordinates where two linear equations evaluate to identical solutions.",
        duration: "30 min",
        isCompleted: false,
      },
    ],
  },
  {
    id: "course_python_oop",
    title: "Python & Object-Oriented Software Design",
    topic: "python oop",
    category: "Computer Science",
    level: "Intermediate",
    duration: "2.5 hours",
    description: "From blueprints to production software: classes, instances, inheritance, encapsulation, polymorphism, and magic methods.",
    tags: ["Python", "OOP", "Classes", "Architecture"],
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: "py_t1",
        number: 1,
        title: "Classes vs Instances: The Blueprint Model",
        description: "Class definitions, self references, __init__ constructors, and instance attributes.",
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: "py_t2",
        number: 2,
        title: "Encapsulation & Private State Invariants",
        description: "Information hiding, public vs private attributes, and @property getter/setter patterns.",
        duration: "22 min",
        isCompleted: false,
      },
      {
        id: "py_t3",
        number: 3,
        title: "Inheritance Hierarchies & super() Methods",
        description: "Extending parent class behaviors, method overriding, and DRY code reusability.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "py_t4",
        number: 4,
        title: "Polymorphism & Duck Typing in Python",
        description: "Uniform interfaces across diverse classes and writing flexible, decoupled software.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "py_t5",
        number: 5,
        title: "Special Dunder Methods (__repr__, __len__, __eq__)",
        description: "Hooking into Python's native operators and object data model.",
        duration: "25 min",
        isCompleted: false,
      },
    ],
  },
  {
    id: "course_physics_newton",
    title: "Newtonian Mechanics & Laws of Motion",
    topic: "newton's laws of motion",
    category: "Physics",
    level: "Beginner",
    duration: "2.0 hours",
    description: "The classical laws governing mass, dynamic acceleration, frictional opposition, and reaction forces across systems.",
    tags: ["Physics", "Mechanics", "Forces", "Inertia"],
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: "newt_t1",
        number: 1,
        title: "Newton's First Law: Inertia & Net Force Zero",
        description: "Why objects maintain constant velocity unless disrupted by an unbalanced external force.",
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: "newt_t2",
        number: 2,
        title: "Newton's Second Law: Force, Mass & Acceleration (F = ma)",
        description: "Direct proportionality of net force to acceleration, and inverse proportionality to mass.",
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: "newt_t3",
        number: 3,
        title: "Newton's Third Law: Action-Reaction Force Pairs",
        description: "Equal magnitude and opposite direction interactions between contacting bodies.",
        duration: "22 min",
        isCompleted: false,
      },
      {
        id: "newt_t4",
        number: 4,
        title: "Friction, Drag & Terminal Velocity Equilibrium",
        description: "Resistive forces, normal forces, and calculating net acceleration in real environments.",
        duration: "25 min",
        isCompleted: false,
      },
    ],
  },
];

export function getStoredCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CURATED_COURSES));
      return DEFAULT_CURATED_COURSES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CURATED_COURSES));
      return DEFAULT_CURATED_COURSES;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading stored courses:", err);
    return DEFAULT_CURATED_COURSES;
  }
}

export function saveCourse(course) {
  try {
    const courses = getStoredCourses();
    const existingIdx = courses.findIndex((c) => c.id === course.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...courses];
      updated[existingIdx] = course;
    } else {
      updated = [course, ...courses];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error saving course:", err);
    return [];
  }
}

export function updateCourseTopicProgress(courseId, topicId, isCompleted) {
  try {
    const courses = getStoredCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return courses;

    course.topics = course.topics.map((t) =>
      t.id === topicId ? { ...t, isCompleted } : t
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    return courses;
  } catch (err) {
    console.error("Error updating topic progress:", err);
    return getStoredCourses();
  }
}

export function deleteCourse(courseId) {
  try {
    const courses = getStoredCourses();
    const filtered = courses.filter((c) => c.id !== courseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error("Error deleting course:", err);
    return getStoredCourses();
  }
}

/**
 * Creates a comprehensive, structured course curriculum for ANY topic.
 */
export function generateCurriculumForTopic(rawTopic, level = "beginner") {
  if (!rawTopic || !rawTopic.trim()) {
    throw new Error("Cannot generate course without a search topic.");
  }
  const cleanTopic = rawTopic.trim();
  const tLower = cleanTopic.toLowerCase();
  const id = `course_${cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now()}`;

  // 1. C Language & Systems Programming
  if (/\bc\b|c language|c program|pointer|memory|malloc|c\+\+|embedded/i.test(tLower)) {
    return {
      id,
      title: `${cleanTopic}: Complete Systems & Memory Mastery`,
      topic: cleanTopic,
      category: "Computer Science",
      level: "Beginner to Advanced",
      duration: "3.5 hours",
      description: `A complete curriculum mastering ${cleanTopic}: native compilation, memory layouts, pointers, dynamic memory, and hardware interaction.`,
      tags: ["C", "Systems", "Pointers", "Memory", "Performance"],
      createdAt: new Date().toISOString(),
      topics: [
        {
          id: `${id}_t1`,
          number: 1,
          title: `${cleanTopic}: Architecture, Compilation Stages & main()`,
          description: "Explore the preprocessor, compiler, assembler, linker, and native execution flow.",
          duration: "20 min",
          isCompleted: false,
        },
        {
          id: `${id}_t2`,
          number: 2,
          title: "Variables, Primitive Types & Byte Layouts",
          description: "Memory representation of primitive types, sizeof(), and formatted console I/O.",
          duration: "22 min",
          isCompleted: false,
        },
        {
          id: `${id}_t3`,
          number: 3,
          title: "Operators, Bitwise Logic & Expression Precedence",
          description: "Arithmetic, relational, and bitwise manipulation at the physical byte level.",
          duration: "20 min",
          isCompleted: false,
        },
        {
          id: `${id}_t4`,
          number: 4,
          title: "Control Flow: If-Else Branching & Optimized Loops",
          description: "Conditionals, switch-case statements, and iterative loops (for, while, do-while).",
          duration: "25 min",
          isCompleted: false,
        },
        {
          id: `${id}_t5`,
          number: 5,
          title: "Functions, Stack Frames & Parameter Passing",
          description: "Function prototypes, call stack activation records, and scope resolution.",
          duration: "25 min",
          isCompleted: false,
        },
        {
          id: `${id}_t6`,
          number: 6,
          title: "Pointers & Physical Memory Address Referencing",
          description: "Understanding & (address-of), * (dereference), hex memory pointers, and inspection.",
          duration: "30 min",
          isCompleted: false,
        },
        {
          id: `${id}_t7`,
          number: 7,
          title: "Arrays, Pointer Arithmetic & String Manipulation",
          description: "Contiguous array layouts in RAM, pointer arithmetic increments, and null-terminated strings.",
          duration: "25 min",
          isCompleted: false,
        },
        {
          id: `${id}_t8`,
          number: 8,
          title: "Dynamic Heap Allocation (malloc, free) & Structs",
          description: "Manual dynamic memory management, avoiding memory leaks, and composite data structures.",
          duration: "30 min",
          isCompleted: false,
        },
      ],
    };
  }

  // 2. Python & Programming
  if (/python|django|flask|fastapi|pandas|numpy/i.test(tLower)) {
    return {
      id,
      title: `${cleanTopic}: Full Stack Programming Curriculum`,
      topic: cleanTopic,
      category: "Computer Science",
      level: "All Levels",
      duration: "3.0 hours",
      description: `Comprehensive mastery of ${cleanTopic}: syntax, data structures, functional patterns, object-oriented design, and practical applications.`,
      tags: ["Python", "Coding", "Software", "Algorithms"],
      createdAt: new Date().toISOString(),
      topics: [
        { id: `${id}_t1`, number: 1, title: `${cleanTopic}: Setup, Execution Model & Core Syntax`, description: "The Python interpreter, bytecode execution, and variable assignment.", duration: "20 min", isCompleted: false },
        { id: `${id}_t2`, number: 2, title: "Data Structures: Lists, Dictionaries, Sets & Tuples", description: "Time complexity, hash maps, list comprehensions, and mutability.", duration: "25 min", isCompleted: false },
        { id: `${id}_t3`, number: 3, title: "Functions, Scope & Lambda Expressions", description: "First-class functions, args/kwargs, closures, and functional decorators.", duration: "25 min", isCompleted: false },
        { id: `${id}_t4`, number: 4, title: "Object-Oriented Programming (OOP) in Python", description: "Classes, instances, inheritance, encapsulation, and dunder methods.", duration: "25 min", isCompleted: false },
        { id: `${id}_t5`, number: 5, title: "Exception Handling & Robust File I/O", description: "Context managers (with statements), try-except blocks, and JSON parsing.", duration: "22 min", isCompleted: false },
        { id: `${id}_t6`, number: 6, title: "Modules, Packages & Practical Project Architecture", description: "Virtual environments, package imports, and modular architecture.", duration: "25 min", isCompleted: false },
      ],
    };
  }

  // 3. Dynamic General Syllabus for Any Topic (Science, Math, History, Engineering, AI, etc.)
  return {
    id,
    title: `${cleanTopic}: Complete Master Course`,
    topic: cleanTopic,
    category: "General Studies",
    level: level.charAt(0).toUpperCase() + level.slice(1),
    duration: "2.5 hours",
    description: `A structured topic-by-topic course covering every foundational concept, mechanism, application, and mastery metric of ${cleanTopic}.`,
    tags: [cleanTopic, "Curriculum", "Mastery", "Fundamentals"],
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: `${id}_t1`,
        number: 1,
        title: `${cleanTopic}: Foundations, Definitions & Core Axioms`,
        description: `Explore the historical context, primary definition, and core principles of ${cleanTopic}.`,
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: `${id}_t2`,
        number: 2,
        title: `${cleanTopic}: Underlying Mechanisms & Working Rules`,
        description: `Analyze the internal variables, causal relationships, and governing laws of ${cleanTopic}.`,
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: `${id}_t3`,
        number: 3,
        title: `${cleanTopic}: Step-by-Step Problem Solving & Models`,
        description: `Step-by-step methodology and standard framework models applied to ${cleanTopic}.`,
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: `${id}_t4`,
        number: 4,
        title: `${cleanTopic}: Real-World Case Studies & Applications`,
        description: `How ${cleanTopic} is utilized in real-world industry, research, and problem solving.`,
        duration: "25 min",
        isCompleted: false,
      },
      {
        id: `${id}_t5`,
        number: 5,
        title: `${cleanTopic}: Edge Cases, Common Pitfalls & Invariants`,
        description: `Common misconceptions, boundary conditions, and invariant rules to remember.`,
        duration: "20 min",
        isCompleted: false,
      },
      {
        id: `${id}_t6`,
        number: 6,
        title: `${cleanTopic}: Synthesis & Advanced Mastery Review`,
        description: `Consolidate mental models, review key concepts, and prepare for applied challenges.`,
        duration: "25 min",
        isCompleted: false,
      },
    ],
  };
}
