import React, { useState, useEffect, useRef } from "react";
import TeacherAvatar from "./components/TeacherAvatar";
import SmartBoard from "./components/SmartBoard";
import LessonRecorder from "./components/LessonRecorder";
import StudyNotesModal from "./components/StudyNotesModal";
import Landing from "./pages/Landing";
import WelcomeTransition from "./components/welcome/WelcomeTransition";
import StudioShell from "./components/studio/StudioShell";
import AppShell from "./components/home/AppShell";
import HomeWorkspace from "./components/home/HomeWorkspace";
import MyLearningView from "./components/views/MyLearningView";
import MaterialsView from "./components/views/MaterialsView";
import ProgressView from "./components/views/ProgressView";
import AssessmentsView from "./components/views/AssessmentsView";
import CoursesCatalogView from "./components/views/CoursesCatalogView";
import AITutorView from "./components/views/AITutorView";
import ScheduleView from "./components/views/ScheduleView";
import SettingsView from "./components/views/SettingsView";
import { getSearchHistory, addSearchHistoryItem } from "./utils/learningHistory";
import { TEACHERS, DEFAULT_TEACHER } from "./constants/teachers";
import { checkBackendHealth, fetchLessonPlan, generateTTS } from "./services/api";
import {
  Sparkles,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  BarChart2,
  Award,
  Layers,
  Film,
  ArrowLeft,
  FileText,
} from "lucide-react";
import "./App.css";

export default function App() {
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "home") {
      return "home";
    }
    return "landing";
  });
  const [backendStatus, setBackendStatus] = useState("checking");
  const [selectedTeacher, setSelectedTeacher] = useState(DEFAULT_TEACHER);
  const [topic, setTopic] = useState("");
  const [lessonPlan, setLessonPlan] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [studentScore, setStudentScore] = useState({ correct: 0, total: 0 });
  const [evalHistory, setEvalHistory] = useState([]);
  const [autoPlayVideoMode, setAutoPlayVideoMode] = useState(true);
  const autoAdvanceTimeoutRef = useRef(null);

  // Active workspace sidebar navigation tab & persistent search history
  const [activeNavTab, setActiveNavTab] = useState("home");
  const [selectedCourseNavId, setSelectedCourseNavId] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());

  const handleNavigateTab = (tab, extra = {}) => {
    setActiveNavTab(tab);
    if (tab === "home") {
      setLessonPlan(null);
    }
    if (extra && extra.selectedCourseId) {
      setSelectedCourseNavId(extra.selectedCourseId);
    } else if (tab !== "courses" && tab !== "lessons") {
      setSelectedCourseNavId(null);
    }
  };

  const refreshSearchHistory = () => {
    setSearchHistory(getSearchHistory());
  };

  // Sync view with URL param ?view=home or landing
  const navigateTo = (newView) => {
    setView(newView);
    const url = new URL(window.location);
    if (newView === "home") {
      url.searchParams.set("view", "home");
    } else {
      url.searchParams.delete("view");
    }
    window.history.pushState({}, "", url);
  };

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setView(params.get("view") === "home" ? "home" : "landing");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Initial backend health check
  useEffect(() => {
    async function check() {
      const res = await checkBackendHealth();
      setBackendStatus(res?.status === "healthy" ? "online" : "offline");
    }
    check();
  }, []);

  // Handle lesson start with fallback for offline local testing
  const handleStartLesson = async (params) => {
    setIsLoadingLesson(true);
    // Record into persistent search & learning history immediately
    if (params.topic && params.topic.trim()) {
      addSearchHistoryItem({
        topic: params.topic.trim(),
        teacherName: params.teacher?.name || selectedTeacher?.name || "Dr. Maya",
        level: params.learner_level || "beginner",
        durationMinutes: params.target_duration_minutes || 20,
        language: params.language || "en",
      });
      refreshSearchHistory();
    }

    try {
      if (params.teacher) {
        setSelectedTeacher(params.teacher);
      }
      const plan = await fetchLessonPlan(params);
      setLessonPlan(plan);
      setCurrentStepIndex(0);
    } catch (err) {
      console.warn("Backend lesson plan unavailable, loading rich mock lesson for demo:", err);
      // Fallback local structured plan for demo resilience
      const fallbackPlan = generateFallbackLessonPlan(params.topic, params.learner_level, params.language);
      setLessonPlan(fallbackPlan);
      setCurrentStepIndex(0);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Play audio for a specific lesson step
  const playStep = async (step, language = "en") => {
    if (!step) return;
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    setIsPlayingAudio(true);
    try {
      const audioUrl = await generateTTS(step.teacher_script, language, selectedTeacher?.id);
      setCurrentAudioUrl(audioUrl);
    } catch (err) {
      console.warn("TTS fallback (browser synthesis):", err);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(step.teacher_script);
        utterance.lang = language === "hi" ? "hi-IN" : "en-US";
        utterance.rate = 0.95;
        utterance.onend = () => handleAudioEnded(step);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => handleAudioEnded(step), 3500);
      }
    }
  };

  const handleAudioEnded = (step) => {
    setIsPlayingAudio(false);
    const activeStep = step || lessonPlan?.steps[currentStepIndex];
    if (activeStep?.step_type === "checkpoint") {
      setShowInteraction(true);
    } else if (autoPlayVideoMode && lessonPlan) {
      if (currentStepIndex < lessonPlan.steps.length - 1) {
        // Natural educator breathing transition (1.2s) before auto-advancing to next video slide
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleNextStep();
        }, 1200);
      } else {
        setShowReportModal(true);
      }
    }
  };

  const handleNextStep = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    setShowInteraction(false);
    if (!lessonPlan) return;
    if (currentStepIndex < lessonPlan.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      playStep(lessonPlan.steps[nextIdx], lessonPlan.language);
    }
  };

  const handlePrevStep = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    setShowInteraction(false);
    if (!lessonPlan || currentStepIndex === 0) return;
    const prevIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevIdx);
    playStep(lessonPlan.steps[prevIdx], lessonPlan.language);
  };

  const handleAnswerEvaluated = (result) => {
    setStudentScore((prev) => ({
      correct: prev.correct + (result.is_correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setEvalHistory((prev) => [...prev, result]);
  };

  const currentStep = lessonPlan?.steps[currentStepIndex];

  // Landing Page view option
  if (view === "landing") {
    return <Landing onStart={() => navigateTo("welcome")} />;
  }

  // Premium Welcome Transition Animation
  if (view === "welcome") {
    return (
      <WelcomeTransition
        studentName="Aarav"
        onComplete={() => navigateTo("home")}
      />
    );
  }

  // Active Visual-First AI Classroom Studio View
  if (lessonPlan) {
    return (
      <StudioShell
        lessonPlan={lessonPlan}
        currentTeacher={selectedTeacher}
        onExit={() => {
          setLessonPlan(null);
          setCurrentAudioUrl(null);
        }}
        studentScore={studentScore}
        onUpdateScore={setStudentScore}
        evalHistory={evalHistory}
        onAddEvalRecord={(rec) => setEvalHistory((prev) => [...prev, rec])}
      />
    );
  }

  // REDESIGNED HOME / LESSON SETUP PRODUCTION PAGE
  return (
    <AppShell
      activeNav={activeNavTab}
      onSelectNav={handleNavigateTab}
      backendStatus={backendStatus}
      studentScore={studentScore}
      onOpenReport={() => handleNavigateTab("progress")}
      onGoLanding={() => navigateTo("landing")}
    >
      {/* 1. Dashboard / Lesson Configurator */}
      {activeNavTab === "home" && (
        <HomeWorkspace
          onStartLesson={handleStartLesson}
          isLoading={isLoadingLesson}
          selectedTeacher={selectedTeacher}
          onSelectTeacher={setSelectedTeacher}
          topic={topic}
          setTopic={setTopic}
          backendStatus={backendStatus}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {/* 2. My Learning: Search and Study History */}
      {activeNavTab === "learning" && (
        <MyLearningView
          searchHistory={searchHistory}
          onRefreshHistory={refreshSearchHistory}
          onResumeTopic={(item) => {
            setTopic(item.topic);
            handleStartLesson({
              topic: item.topic,
              learner_level: item.level || "beginner",
              target_duration_minutes: item.durationMinutes || 20,
              language: item.language || "en",
              teacher: selectedTeacher,
            });
          }}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {/* 3. Courses: Interactive Multi-Topic Curriculum Catalog & Topic-by-Topic Learning */}
      {(activeNavTab === "courses" || activeNavTab === "lessons") && (
        <CoursesCatalogView
          onStartLesson={handleStartLesson}
          onNavigateTab={handleNavigateTab}
          initialSelectedCourseId={selectedCourseNavId}
        />
      )}

      {/* 4. Materials: Downloadable Notes, Cheat Sheets & Worksheets from Past Searches */}
      {activeNavTab === "materials" && (
        <MaterialsView
          searchHistory={searchHistory}
          onNavigateTab={setActiveNavTab}
        />
      )}

      {/* 5. Progress: Analytics Computed from Past Searches */}
      {activeNavTab === "progress" && (
        <ProgressView
          searchHistory={searchHistory}
          onResumeTopic={(item) => {
            setTopic(item.topic);
            handleStartLesson({
              topic: item.topic,
              learner_level: item.level || "beginner",
            });
          }}
          onNavigateTab={setActiveNavTab}
        />
      )}

      {/* 6. Assessments: Interactive Practice Quizzes Based on Past Searches */}
      {activeNavTab === "assessments" && (
        <AssessmentsView
          searchHistory={searchHistory}
          onRefreshHistory={refreshSearchHistory}
          onNavigateTab={setActiveNavTab}
        />
      )}

      {/* 7. AI Tutor: Direct 1-on-1 Concept Dialogue */}
      {activeNavTab === "tutor" && (
        <AITutorView
          selectedTeacher={selectedTeacher}
          searchHistory={searchHistory}
          onStartLesson={handleStartLesson}
        />
      )}

      {/* 8. Schedule: 7-Day Spaced Repetition Roadmap */}
      {activeNavTab === "planner" && (
        <ScheduleView
          searchHistory={searchHistory}
          onResumeTopic={(item) => {
            setTopic(item.topic);
            handleStartLesson({ topic: item.topic });
          }}
        />
      )}

      {/* 9. Settings: Educator & Account Preferences */}
      {activeNavTab === "settings" && (
        <SettingsView
          selectedTeacher={selectedTeacher}
          onSelectTeacher={setSelectedTeacher}
          onRefreshHistory={refreshSearchHistory}
        />
      )}
    </AppShell>
  );
}

// Resilient topic-aware fallback plan generator when testing standalone
function generateFallbackLessonPlan(topic = "Linear Equations", level = "beginner", lang = "en") {
  const cleanTopic = topic ? topic.trim() : "Linear Equations";
  const tLower = cleanTopic.toLowerCase();

  // 0. Linear Equations (Hackathon Demo Master Scenario)
  if (/linear|equation|algebra|variable|solve for x|leniar/.test(tLower) || !topic) {
    return {
      topic: cleanTopic || "Linear Equations",
      learner_level: level || "beginner",
      language: lang || "en",
      target_duration_minutes: 10,
      steps: [
        {
          id: 1,
          step_type: "intro",
          teacher_script: "Welcome! Today we will master linear equations. At its core, an algebraic equation is a mathematical sentence asserting that two distinct expressions balance to the exact same value.",
          visual: {
            type: "equation",
            title: "What is an Algebraic Equation?",
            content: "2x + 4 = 10",
          },
        },
        {
          id: 2,
          step_type: "concept",
          teacher_script: "Think of an equation as a physical two-pan balance scale. The equal sign is the central fulcrum. Whatever operation you apply to the left side, you must apply to the right side to keep the scale balanced.",
          visual: {
            type: "balance",
            title: "The Balance Scale Analogy: Symmetrical Equality",
            content: "Left Pan: [2x + 4]  <=== Balances ===>  Right Pan: [10]",
          },
        },
        {
          id: 3,
          step_type: "demonstration",
          teacher_script: "To solve 2x + 4 = 10, our objective is to isolate x. First, eliminate the constant by subtracting 4 from both sides to get 2x = 6. Then divide both sides by 2 to find x = 3.",
          visual: {
            type: "equation",
            title: "Step-by-Step Algebraic Transformation",
            content: "2x + 4 = 10\n2x = 10 - 4\n2x = 6\nx = 6 / 2\nx = 3",
          },
        },
        {
          id: 4,
          step_type: "worked_example",
          teacher_script: "Let us verify our method with another problem: 3x + 6 = 15. Subtracting 6 gives 3x = 9. Dividing by 3 confirms x = 3. Notice the exact same systematic pattern.",
          visual: {
            type: "equation",
            title: "Worked Example: 3x + 6 = 15",
            content: "3x + 6 = 15\n3x = 15 - 6\n3x = 9\nx = 3",
          },
        },
        {
          id: 5,
          step_type: "checkpoint",
          teacher_script: "Now it's your turn! Concept check: If 2x + 4 = 10, what is the value of x?",
          question: "If 2x + 4 = 10, what is the value of x?",
          options: ["x = 3", "x = 2", "x = 7", "x = 5"],
          correct_answer: "x = 3",
          misconception_guide: "First subtract 4 from both sides: 2x = 6. Then divide both sides by 2: x = 3. (Common mistake: subtracting 4 from only one side yields an unbalanced equation).",
        },
        {
          id: 6,
          step_type: "summary",
          teacher_script: "Phenomenal work! You now understand the fundamental principle of linear equations: maintain balanced operations across the equal sign to isolate the unknown variable.",
          visual: {
            type: "bullet_points",
            title: "Linear Equations — Mastered Principles",
            content: "• An equation is a balanced statement of equivalence.\n• Subtract or add constants to both sides first.\n• Divide by the variable's coefficient to isolate x.\n• Always verify by substituting your answer back into the original equation.",
          },
        },
      ],
    };
  }

  // 1. C Language / Systems Programming / Pointers
  if (/\bc\b|c language|c program|pointer|memory|malloc|c\+\+|embedded/i.test(tLower)) {
    return {
      topic: cleanTopic,
      learner_level: level || "beginner",
      language: lang || "en",
      target_duration_minutes: 20,
      steps: [
        {
          id: 1,
          step_type: "intro",
          teacher_script: `Welcome! Today we explore ${cleanTopic}. In C, software maps directly to physical memory addresses and native CPU machine instructions.`,
          visual: {
            type: "code",
            title: "The C Memory Model & Hardware Interface",
            content: "#include <stdio.h>\n\nint main() {\n    int val = 42;      // Allocated in RAM\n    int *ptr = &val;   // Stores address of val\n    printf(\"val = %d at %p\\n\", *ptr, (void*)ptr);\n    return 0;\n}",
          },
        },
        {
          id: 2,
          step_type: "demonstration",
          teacher_script: "A pointer is a variable that stores another variable's memory address. Dereferencing that pointer with an asterisk allows us to read or modify the value directly in hardware RAM.",
          visual: {
            type: "mermaid",
            title: "Memory Address Mapping",
            content: "graph LR\n  Ptr[Pointer 'ptr' at 0x1008] -->|Stores Address 0x1004| Target[RAM Cell 0x1004: 'val = 42']\n  Target --> CPU[CPU Native Execution]",
          },
        },
        {
          id: 3,
          step_type: "checkpoint",
          teacher_script: "Let us pause for a quick concept check on C memory manipulation!",
          question: "In C programming, what does the dereference operator (*ptr) do when ptr holds the address of a variable?",
          options: [
            "Reads or modifies the value stored at the memory address pointed to by ptr",
            "Allocates automatic garbage-collected dynamic memory",
            "Directly converts C source code into interpreted bytecode",
            "Returns the stack address of ptr itself instead of the target variable",
          ],
          correct_answer: "Reads or modifies the value stored at the memory address pointed to by ptr",
          misconception_guide: "In C, the '&' operator retrieves a variable's address, while '*' (dereferencing) accesses the actual value stored at that address.",
          visual: {
            type: "code",
            title: "C Pointer Inspection Context",
            content: "int val = 42;\nint *ptr = &val; // ptr stores address of val\n\n// What happens when this executes?\n*ptr = 99; // Directly modifies val in RAM!",
          },
        },
        {
          id: 4,
          step_type: "summary",
          teacher_script: "Phenomenal work! You now understand how C manipulates memory directly via pointers and compiles into native CPU machine instructions.",
          visual: {
            type: "bullet_points",
            title: `${cleanTopic} — Core Invariants`,
            content: "• Pointers store physical RAM addresses (&).\n• Dereferencing (*) accesses or updates stored values.\n• Ahead-of-time compilation produces zero-overhead machine code.",
          },
        },
      ],
    };
  }

  // 2. Programming / OOP
  if (/oop|class|object|inherit|python|java|program|code|function|encapsul/.test(tLower)) {
    return {
      topic: cleanTopic,
      learner_level: level || "beginner",
      language: lang || "en",
      target_duration_minutes: 20,
      steps: [
        {
          id: 1,
          step_type: "intro",
          teacher_script: `Welcome! Today we explore ${cleanTopic}. Object-Oriented Programming models real-world concepts into modular, reusable software entities.`,
          visual: {
            type: "mermaid",
            title: `${cleanTopic} — Class Model`,
            content: "classDiagram\n  class Blueprint {\n    +String attributes\n    +executeMethod()\n  }\n  class Instance {\n    +state = active\n  }\n  Blueprint <|-- Instance",
          },
        },
        {
          id: 2,
          step_type: "demonstration",
          teacher_script: "Think of a Class as an architectural blueprint, and an Object as the actual house created from that blueprint.",
          visual: {
            type: "code",
            title: "Class Definition & Instantiation",
            content: "# Class Blueprint\nclass Student:\n    def __init__(self, name: str):\n        self.name = name\n        self.__score = 0  # Encapsulated state\n\n    def add_score(self, points: int):\n        self.__score += points\n        return f'{self.name}: {self.__score}'\n\ns = Student('Aarav')\nprint(s.add_score(10))",
          },
        },
        {
          id: 3,
          step_type: "checkpoint",
          teacher_script: "Let us pause for a quick concept check on OOP foundations!",
          question: "Which core OOP pillar allows a child class to inherit and extend methods and attributes from a parent class?",
          options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
          correct_answer: "Inheritance",
          misconception_guide: "If you chose Encapsulation, note that Encapsulation hides state, whereas Inheritance provides hierarchical code reuse.",
          visual: {
            type: "code",
            title: "OOP Inheritance Inspection",
            content: "class Animal:\n    def speak(self): return 'Sound'\n\nclass Dog(Animal):\n    def speak(self): return 'Bark' # Extends behavior",
          },
        },
        {
          id: 4,
          step_type: "summary",
          teacher_script: `Great job! You've mastered how ${cleanTopic} structures software through blueprints and reusable object instances.`,
          visual: {
            type: "bullet_points",
            title: `${cleanTopic} — Core Takeaways`,
            content: "• Classes define state (attributes) and behavior (methods).\n• Objects are independent runtime instances.\n• Inheritance eliminates duplicate logic across modules.",
          },
        },
      ],
    };
  }

  // 3. Physics / Circuits / Ohm's Law
  if (/ohm|circuit|resistor|voltage|current|electric/.test(tLower)) {
    return {
      topic: cleanTopic,
      learner_level: level || "beginner",
      language: lang || "en",
      target_duration_minutes: 20,
      steps: [
        {
          id: 1,
          step_type: "intro",
          teacher_script: `Welcome to our session on ${cleanTopic}! Today we explore the relationship between voltage, current, and electrical resistance.`,
          visual: {
            type: "katex",
            title: "Foundational Relation",
            content: "V = I \\cdot R \\quad \\iff \\quad I = \\frac{V}{R}",
          },
        },
        {
          id: 2,
          step_type: "demonstration",
          teacher_script: "Current is directly proportional to voltage and inversely proportional to resistance. Doubling resistance cuts current in half.",
          visual: {
            type: "mermaid",
            title: "Circuit Loop",
            content: "graph LR\n  Battery[Voltage Source 12V] --> Switch((Closed Switch))\n  Switch --> Resistor[Resistor 6 Ohms]\n  Resistor --> Current((Current 2A))\n  Current --> Battery",
          },
        },
        {
          id: 3,
          step_type: "checkpoint",
          teacher_script: "Concept check: What happens to current if resistance increases while voltage remains constant?",
          question: "If resistance in a circuit increases while voltage remains constant, what happens to current?",
          options: ["Current decreases", "Current increases", "Current remains unchanged", "Current drops to zero immediately"],
          correct_answer: "Current decreases",
          misconception_guide: "Resistance opposes electron flow. When resistance increases, current must decrease.",
          visual: {
            type: "katex",
            title: "Ohm's Law Invariant",
            content: "I = \\frac{V}{R} \\implies R \\uparrow \\quad \\implies \\quad I \\downarrow",
          },
        },
        {
          id: 4,
          step_type: "summary",
          teacher_script: "Awesome work! You understand the fundamental inverse relationship between resistance and current.",
          visual: {
            type: "bullet_points",
            title: `${cleanTopic} — Summary`,
            content: "• V = I * R governs linear electric circuits.\n• Voltage is the driving potential.\n• Current decreases when resistance increases.",
          },
        },
      ],
    };
  }

  // 4. Dynamic General Generator for Any Topic
  return {
    topic: cleanTopic,
    learner_level: level || "beginner",
    language: lang || "en",
    target_duration_minutes: 20,
    steps: [
      {
        id: 1,
        step_type: "intro",
        teacher_script: `Welcome! Today we will break down ${cleanTopic} systematically from first principles.`,
        visual: {
          type: "mermaid",
          title: `${cleanTopic} — Overview`,
          content: `graph TD\n  Concept[${cleanTopic}] --> Mechanism[Core Mechanics]\n  Mechanism --> Application[Practical Outcomes]`,
        },
      },
      {
        id: 2,
        step_type: "demonstration",
        teacher_script: `Let us examine how ${cleanTopic} works in practice through concrete relationships and workflows.`,
        visual: {
          type: "bullet_points",
          title: `${cleanTopic} — Architecture & Flow`,
          content: `• Input: Foundational inputs driving ${cleanTopic}\n• Processing: Core transformation rules\n• Output: Observable, verified results`,
        },
      },
      {
        id: 3,
        step_type: "checkpoint",
        teacher_script: `Let's check your intuition about ${cleanTopic} with a quick checkpoint!`,
        question: `Which of the following best reflects the foundational operational principle of ${cleanTopic}?`,
        options: [
          `Systematically transforming inputs through the core mechanics of ${cleanTopic}`,
          "Executing arbitrary unconstrained operations without causal rules",
          "Terminating execution without producing verifiable state changes",
          "Discarding internal variables randomly at each stage",
        ],
        correct_answer: `Systematically transforming inputs through the core mechanics of ${cleanTopic}`,
        misconception_guide: `Focus on the constructive purpose of ${cleanTopic} in structuring systems predictably.`,
        visual: {
          type: "bullet_points",
          title: `${cleanTopic} — Concept Inspection`,
          content: `• System: ${cleanTopic}\n• Invariant: Governed by predictable, verifiable causal mechanics.`,
        },
      },
      {
        id: 4,
        step_type: "summary",
        teacher_script: `Superb! You now have a solid conceptual foundation for ${cleanTopic}.`,
        visual: {
          type: "bullet_points",
          title: `${cleanTopic} — Mastered Principles`,
          content: `• Grasped core principles of ${cleanTopic}\n• Understood systematic inputs and outputs\n• Ready for applied problem solving`,
        },
      },
    ],
  };
}
