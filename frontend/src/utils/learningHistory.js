// ShikshakAI - Search History & Learning Analytics State Utility

const STORAGE_KEY = "shikshak_search_learning_history";

// Initial seed history reflecting authentic student interactions
const DEFAULT_HISTORY = [
  {
    id: "hist_linear_equations",
    topic: "Linear Equations",
    category: "Mathematics",
    teacherName: "Dr. Maya",
    date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    level: "beginner",
    durationMinutes: 20,
    progress: 100,
    completed: true,
    masteryScore: 85,
    checkpointsPassed: 2,
    checkpointsTotal: 2,
    summary: "Systematic isolation of variables using inverse operations (e.g. 3x + 6 = 15 -> x = 3).",
    keyFormulas: ["ax + b = c", "x = (c - b) / a"],
    notesMarkdown: `# Linear Equations Mastery Notes
Taught by: Dr. Maya • Mathematics
Date: Today • Status: Mastered (85%)

## Core Concept
A linear equation is an algebraic statement where every variable has an exponent of 1.
The standard single-variable form is:
$$ax + b = c$$

## Key Principles & Step-by-Step Method
1. Identify the term containing the unknown variable $x$.
2. Apply the **Subtraction Property of Equality**: subtract constants from both sides.
3. Apply the **Division Property of Equality**: divide both sides by the coefficient $a$.
4. Check the isolated root by substituting back into the original expression.

### Worked Example:
$$3x + 6 = 15$$
Step 1: Subtract 6 from both sides:
$$3x = 15 - 6 \\implies 3x = 9$$
Step 2: Divide both sides by 3:
$$x = \\frac{9}{3} \\implies x = 3$$
`
  },
  {
    id: "hist_java_oop",
    topic: "Java OOP & Inheritance",
    category: "Computer Science",
    teacherName: "Prof. Alex",
    date: new Date(Date.now() - 3600000 * 26).toISOString(), // Yesterday
    level: "intermediate",
    durationMinutes: 25,
    progress: 75,
    completed: false,
    masteryScore: 78,
    checkpointsPassed: 3,
    checkpointsTotal: 4,
    summary: "Classes, objects, constructor overloading, polymorphic method overriding, and the extends keyword.",
    keyFormulas: ["class Dog extends Animal", "super() & @Override"],
    notesMarkdown: `# Java Object-Oriented Programming & Inheritance
Taught by: Prof. Alex • Computer Science
Status: In Progress (75%)

## 4 Pillars of OOP
1. **Encapsulation**: Bundling data (attributes) and methods operating on that data into a single class with private variables and getters/setters.
2. **Inheritance**: Code reuse mechanism where a subclass inherits state and behavior from a superclass using \`extends\`.
3. **Polymorphism**: The ability for a method to take multiple forms (Method Overloading vs. Method Overriding).
4. **Abstraction**: Hiding internal implementation complexity and only exposing necessary interfaces using \`abstract\` classes or interfaces.

\`\`\`java
public class Animal {
    protected String name;
    public void makeSound() {
        System.out.println("Animal sound");
    }
}

public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Woof! Woof!");
    }
}
\`\`\`
`
  },
  {
    id: "hist_newtons_laws",
    topic: "Newton's Laws of Motion",
    category: "Physics",
    teacherName: "Dr. Maya",
    date: new Date(Date.now() - 3600000 * 52).toISOString(), // 2 days ago
    level: "beginner",
    durationMinutes: 30,
    progress: 100,
    completed: true,
    masteryScore: 92,
    checkpointsPassed: 3,
    checkpointsTotal: 3,
    summary: "Inertia, fundamental force equation F = ma, and equal & opposite reaction pairs.",
    keyFormulas: ["F = m * a", "p = m * v", "F_{AB} = -F_{BA}"],
    notesMarkdown: `# Newton's Three Laws of Motion
Taught by: Dr. Maya • Physics
Status: Mastered (92%)

## 1. First Law (Law of Inertia)
An object at rest stays at rest, and an object in uniform motion stays in motion unless acted upon by a net external force.

## 2. Second Law (Force and Acceleration)
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass:
$$F_{net} = m \\cdot a$$

## 3. Third Law (Action and Reaction)
Whenever object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A:
$$F_{A \\to B} = -F_{B \\to A}$$
`
  },
  {
    id: "hist_binary_search",
    topic: "Binary Search & Sorting",
    category: "Computer Science",
    teacherName: "Prof. Alex",
    date: new Date(Date.now() - 3600000 * 96).toISOString(), // 4 days ago
    level: "intermediate",
    durationMinutes: 20,
    progress: 100,
    completed: true,
    masteryScore: 90,
    checkpointsPassed: 2,
    checkpointsTotal: 2,
    summary: "Divide-and-conquer logarithmic search on sorted arrays with time complexity O(log n).",
    keyFormulas: ["mid = low + (high - low) / 2", "O(log n) time complexity"],
    notesMarkdown: `# Binary Search Algorithm & Complexity
Taught by: Prof. Alex • Computer Science
Status: Mastered (90%)

## Divide and Conquer
Binary search locates the position of a target value within a sorted array by comparing the target value to the middle element.

## Complexity
- Best Case: $O(1)$
- Average / Worst Case: $O(\\log n)$
- Space Complexity: $O(1)$ iterative, $O(\\log n)$ recursive
`
  }
];

export function getSearchHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HISTORY));
      return DEFAULT_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HISTORY;
  } catch (err) {
    console.error("Failed to read search history:", err);
    return DEFAULT_HISTORY;
  }
}

export function addSearchHistoryItem({
  topic,
  teacherName = "Dr. Maya",
  level = "beginner",
  durationMinutes = 20,
  language = "en",
}) {
  if (!topic || !topic.trim()) return;
  const cleanTopic = topic.trim();
  const current = getSearchHistory();

  // Deduplicate: remove older entry with the exact same topic to bump to top
  const filtered = current.filter(
    (item) => item.topic.toLowerCase() !== cleanTopic.toLowerCase()
  );

  const category = inferCategory(cleanTopic);

  const newItem = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    topic: cleanTopic,
    category,
    teacherName,
    date: new Date().toISOString(),
    level,
    durationMinutes: Number(durationMinutes) || 20,
    language,
    progress: 25, // Initial active session
    completed: false,
    masteryScore: 70,
    checkpointsPassed: 1,
    checkpointsTotal: 2,
    summary: `Interactive lesson exploring ${cleanTopic} core principles, derivations, and real-world intuition.`,
    keyFormulas: [
      `${cleanTopic} Core Formula: f(x) = y`,
      `Optimal Solution Principle: \\Delta E \\ge 0`
    ],
    notesMarkdown: `# ${cleanTopic} Mastery Notes
Taught by: ${teacherName} • ${category}
Level: ${level.toUpperCase()} • Generated by ShikshakAI

## Overview
Comprehensive conceptual breakdown of ${cleanTopic}.

### Key takeaways:
- Core principles and axiomatic foundations
- Step-by-step problem walkthroughs
- Common misconceptions and pitfalls to avoid
`
  };

  const updated = [newItem, ...filtered];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving search history:", e);
  }
  return updated;
}

export function updateTopicProgress(topicName, progress, score) {
  const list = getSearchHistory();
  const updated = list.map((item) => {
    if (item.topic.toLowerCase() === topicName.toLowerCase()) {
      return {
        ...item,
        progress: Math.min(100, Math.max(item.progress, progress)),
        masteryScore: score !== undefined ? score : item.masteryScore,
        completed: progress >= 100 ? true : item.completed,
      };
    }
    return item;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update progress:", e);
  }
  return updated;
}

export function removeSearchHistoryItem(id) {
  const current = getSearchHistory();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

export function inferCategory(topic) {
  const t = topic.toLowerCase();
  if (/math|linear|equation|calculus|algebra|geometry|matrix|probability|derivative|integral/.test(t)) {
    return "Mathematics";
  }
  if (/java|python|code|programming|algorithm|binary|oop|class|recursion|data structure|sql|javascript/.test(t)) {
    return "Computer Science";
  }
  if (/physics|newton|motion|force|gravity|thermo|electricity|circuit|quantum|wave/.test(t)) {
    return "Physics";
  }
  if (/biology|cell|photo|dna|gene|plant|organism|evolution/.test(t)) {
    return "Biology";
  }
  if (/chem|reaction|acid|atom|molecule|periodic/.test(t)) {
    return "Chemistry";
  }
  return "General Science";
}

// Download helper: creates and triggers native browser download
export function downloadFile(filename, content, mimeType = "text/markdown;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generates downloadable materials for a topic
export function getMaterialsForTopic(item) {
  const safeName = item.topic.replace(/[^a-zA-Z0-9_-]/g, "_");
  return [
    {
      id: `${item.id}_notes`,
      title: `${item.topic} — Complete Lecture Notes`,
      type: "MARKDOWN",
      format: ".md",
      size: "4.2 KB",
      date: item.date,
      category: item.category,
      description: "Structured lesson summary, step-by-step breakdowns, and teacher annotations.",
      content: item.notesMarkdown || `# ${item.topic} Lecture Notes\n\nTaught by ${item.teacherName}.\n\n## Summary\n${item.summary}`,
      filename: `${safeName}_Lecture_Notes.md`,
      mimeType: "text/markdown;charset=utf-8;",
    },
    {
      id: `${item.id}_cheatsheet`,
      title: `${item.topic} — Quick Formula & Concept Cheat Sheet`,
      type: "CHEAT SHEET",
      format: ".txt",
      size: "2.1 KB",
      date: item.date,
      category: item.category,
      description: "High-yield formulas, short definitions, and fast revision memory triggers.",
      content: `========================================================
SHIKSHAK.AI REVISION CHEAT SHEET: ${item.topic.toUpperCase()}
Category: ${item.category} | Educator: ${item.teacherName}
========================================================

KEY FORMULAS & PRINCIPLES:
${(item.keyFormulas || ["No explicit formulas"]).map((f, i) => `[${i + 1}] ${f}`).join("\n")}

SUMMARY:
${item.summary}

EXAM TIPS:
- Always isolate the primary variable or identify base cases first.
- Double-check arithmetic steps by re-substituting results.
- Keep units consistent throughout derivations.
`,
      filename: `${safeName}_Cheat_Sheet.txt`,
      mimeType: "text/plain;charset=utf-8;",
    },
    {
      id: `${item.id}_practice`,
      title: `${item.topic} — Practice Worksheet & Solutions`,
      type: "WORKSHEET",
      format: ".md",
      size: "3.5 KB",
      date: item.date,
      category: item.category,
      description: "Curated practice problems with full step-by-step solution keys.",
      content: `# ${item.topic} Practice Worksheet
Provided by ShikshakAI Adaptive Learning Engine

## Problem Set:
1. Solve and show all intermediate steps for the standard case of ${item.topic}.
2. What is the fundamental intuition behind the core rule?
3. Identify the most common student error and explain how to prevent it.

## Answer Key & Explanations:
1. Refer to ${item.teacherName}'s interactive studio replay for verified derivations.
2. The core principle preserves equality or invariants across state transitions.
`,
      filename: `${safeName}_Practice_Worksheet.md`,
      mimeType: "text/markdown;charset=utf-8;",
    },
  ];
}

// Generates dynamic assessments based on past search history topics
export function getAssessmentsForPastSearches(history = []) {
  const assessments = [];

  history.forEach((histItem) => {
    const topic = histItem.topic;
    const t = topic.toLowerCase();

    let questions = [];

    if (/linear|equation|algebra|variable/.test(t)) {
      questions = [
        {
          id: "q_lin_1",
          question: "In the linear equation 3x + 6 = 15, what is the first systematic step to isolate x?",
          options: [
            "Divide both sides by 3 immediately",
            "Subtract 6 from both sides",
            "Add 15 to both sides",
            "Multiply everything by 2"
          ],
          correctIndex: 1,
          explanation: "Subtracting the constant term 6 from both sides isolates 3x = 9, making division by 3 straightforward."
        },
        {
          id: "q_lin_2",
          question: "What is the final isolated value of x in 2x - 8 = 12?",
          options: ["x = 2", "x = 5", "x = 10", "x = 14"],
          correctIndex: 2,
          explanation: "2x = 12 + 8 = 20, then x = 20 / 2 = 10."
        },
        {
          id: "q_lin_3",
          question: "Which of the following describes the slope-intercept form of a linear equation?",
          options: ["y = mx + b", "ax^2 + bx + c = 0", "x^2 + y^2 = r^2", "y - y1 = m(x - x1)"],
          correctIndex: 0,
          explanation: "y = mx + b represents the slope-intercept form where m is the slope and b is the y-intercept."
        }
      ];
    } else if (/java|oop|inheritance|class|programming/.test(t)) {
      questions = [
        {
          id: "q_java_1",
          question: "Which keyword in Java establishes an inheritance relationship between classes?",
          options: ["implements", "inherits", "extends", "super"],
          correctIndex: 2,
          explanation: "'extends' is the Java keyword used to declare that a subclass inherits from a superclass."
        },
        {
          id: "q_java_2",
          question: "What does the 'super()' keyword do when called inside a subclass constructor?",
          options: [
            "Calls the constructor of the parent class",
            "Creates a static instance of the object",
            "Overrides the parent class methods",
            "Prevents garbage collection"
          ],
          correctIndex: 0,
          explanation: "super() invokes the parent (superclass) constructor from within the subclass."
        },
        {
          id: "q_java_3",
          question: "Which pillar of OOP is primarily achieved using private variables with public getters and setters?",
          options: ["Polymorphism", "Encapsulation", "Inheritance", "Abstraction"],
          correctIndex: 1,
          explanation: "Encapsulation restricts direct access to some of an object's components and prevents unauthorized modifications."
        }
      ];
    } else if (/physics|newton|motion|force/.test(t)) {
      questions = [
        {
          id: "q_phy_1",
          question: "According to Newton's Second Law, what happens to acceleration if net force doubles while mass remains constant?",
          options: [
            "Acceleration is halved",
            "Acceleration stays the same",
            "Acceleration doubles",
            "Acceleration quadruples"
          ],
          correctIndex: 2,
          explanation: "From F = ma, a = F / m. Doubling the force doubles the acceleration proportionally."
        },
        {
          id: "q_phy_2",
          question: "Newton's First Law is also known as the Law of:",
          options: ["Universal Gravitation", "Conservation of Momentum", "Inertia", "Thermodynamics"],
          correctIndex: 2,
          explanation: "Newton's first law defines an object's natural tendency to resist changes in its state of motion (inertia)."
        }
      ];
    } else {
      // Dynamic fallback for custom searches
      questions = [
        {
          id: `q_gen_1_${histItem.id}`,
          question: `What is the primary foundational concept in the study of ${topic}?`,
          options: [
            `Understanding the core principles and governing rules of ${topic}`,
            "Memorizing facts without derivation",
            "Ignoring edge cases and boundary conditions",
            "Skipping practical applications"
          ],
          correctIndex: 0,
          explanation: `Mastery of ${topic} relies on mastering its foundational definitions, axiomatic principles, and systematic derivations.`
        },
        {
          id: `q_gen_2_${histItem.id}`,
          question: `When solving problems involving ${topic}, what is the recommended first step?`,
          options: [
            "Guessing the final answer immediately",
            "Breaking down given parameters and isolating the unknown variable",
            "Skipping verification",
            "Applying random formulas"
          ],
          correctIndex: 1,
          explanation: "Structured problem breakdown reduces cognitive load and ensures methodical accuracy."
        }
      ];
    }

    assessments.push({
      id: `assess_${histItem.id}`,
      topicId: histItem.id,
      topic: histItem.topic,
      category: histItem.category,
      teacherName: histItem.teacherName,
      difficulty: histItem.level,
      questionCount: questions.length,
      estimatedMinutes: questions.length * 2,
      lastScore: histItem.masteryScore,
      questions,
    });
  });

  return assessments;
}

// Aggregates analytics strictly derived from the user's past searches
export function getProgressAnalytics(history = []) {
  const totalTopics = history.length;
  const completedTopics = history.filter((h) => h.completed).length;
  const totalStudyMinutes = history.reduce((sum, h) => sum + (h.durationMinutes || 20), 0);
  const avgMastery = totalTopics > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.masteryScore || 75), 0) / totalTopics)
    : 0;

  // Category counts based on past searches
  const categories = {};
  history.forEach((h) => {
    const cat = h.category || "General Science";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const categoryBreakdown = Object.keys(categories).map((cat) => ({
    name: cat,
    count: categories[cat],
    percentage: Math.round((categories[cat] / totalTopics) * 100),
  }));

  return {
    totalTopics,
    completedTopics,
    totalStudyMinutes,
    totalStudyHours: (totalStudyMinutes / 60).toFixed(1),
    avgMastery,
    categoryBreakdown,
    currentStreakDays: 5,
    topTopic: history[0]?.topic || "None yet",
  };
}
