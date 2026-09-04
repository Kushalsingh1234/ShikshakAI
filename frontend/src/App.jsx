import React, { useState, useEffect, useRef } from "react";
import TeacherAvatar from "./components/TeacherAvatar";
import SmartBoard from "./components/SmartBoard";
import LearningReportModal from "./components/LearningReportModal";
import LessonRecorder from "./components/LessonRecorder";
import StudyNotesModal from "./components/StudyNotesModal";
import Landing from "./pages/Landing";
import WelcomeTransition from "./components/welcome/WelcomeTransition";
import AppShell from "./components/home/AppShell";
import HomeWorkspace from "./components/home/HomeWorkspace";
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [studentScore, setStudentScore] = useState({ correct: 0, total: 0 });
  const [evalHistory, setEvalHistory] = useState([]);
  const [autoPlayVideoMode, setAutoPlayVideoMode] = useState(true);
  const autoAdvanceTimeoutRef = useRef(null);

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
    try {
      if (params.teacher) {
        setSelectedTeacher(params.teacher);
      }
      const plan = await fetchLessonPlan(params);
      setLessonPlan(plan);
      setCurrentStepIndex(0);
      playStep(plan.steps[0], plan.language);
    } catch (err) {
      console.warn("Backend lesson plan unavailable, loading rich mock lesson for demo:", err);
      // Fallback local structured plan for demo resilience
      const fallbackPlan = generateFallbackLessonPlan(params.topic, params.learner_level, params.language);
      setLessonPlan(fallbackPlan);
      setCurrentStepIndex(0);
      playStep(fallbackPlan.steps[0], fallbackPlan.language);
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
    } else {
      // Reached the end of the lesson -> Show Learning Report Modal!
      setShowReportModal(true);
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

  // Active Lesson Classroom View
  if (lessonPlan) {
    return (
      <AppShell
        activeNav="lessons"
        onSelectNav={(tab) => {
          if (tab === "home") {
            setLessonPlan(null);
            setCurrentAudioUrl(null);
          }
        }}
        backendStatus={backendStatus}
        studentScore={studentScore}
        onOpenReport={() => setShowReportModal(true)}
        onGoLanding={() => navigateTo("landing")}
      >
        <div className="active-classroom-wrapper">
          {/* Top Classroom Action Bar */}
          <div className="active-classroom-topbar">
            <div className="classroom-topbar-left">
              <button
                type="button"
                className="exit-to-setup-btn"
                onClick={() => {
                  setLessonPlan(null);
                  setCurrentAudioUrl(null);
                }}
                title="Return to Lesson Configuration"
              >
                <ArrowLeft size={16} />
                <span>Exit Studio</span>
              </button>

              <div className="classroom-live-meta">
                <span className="live-meta-pill status">
                  <span className="live-status-dot"></span> LIVE CLASSROOM
                </span>
                <span className="live-meta-pill topic">{lessonPlan.topic}</span>
                <span className="live-meta-pill teacher">{selectedTeacher.name}</span>
                <span className="live-meta-pill level">{lessonPlan.learner_level}</span>
                <span className="live-meta-pill progress">
                  Step {currentStepIndex + 1} of {lessonPlan.steps.length}
                </span>
              </div>
            </div>

            <div className="classroom-top-actions">
              <LessonRecorder
                lessonTitle={lessonPlan?.topic || "Virtual_Classroom"}
                onOpenNotes={() => setShowNotesModal(true)}
              />
              <button
                type="button"
                className="notes-topbar-btn"
                onClick={() => setShowNotesModal(true)}
                title="View & Download Structured Study Notes"
              >
                <FileText size={15} />
                <span>Notes</span>
              </button>
              <button
                type="button"
                className="report-open-btn"
                onClick={() => setShowReportModal(true)}
                title="View Student Learning Analytics"
              >
                <Award size={15} />
                <span>Learning Report</span>
              </button>
            </div>
          </div>

          {/* Main Dual-Pane Classroom Stage */}
          <main className="stage-grid">
            {/* Left Stage: AI Avatar Teacher & Controls */}
            <section className="left-stage">
              <TeacherAvatar
                scriptText={
                  currentStep
                    ? currentStep.teacher_script
                    : `${selectedTeacher.greeting} Let's continue our lesson!`
                }
                audioUrl={currentAudioUrl}
                isPlaying={isPlayingAudio}
                onAudioEnded={() => handleAudioEnded(currentStep)}
                currentTeacher={selectedTeacher}
                onSelectTeacher={setSelectedTeacher}
                footer={
                  <div className="lesson-nav-bar">
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                    >
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>

                    <div className="step-dots">
                      {lessonPlan.steps.map((s, idx) => (
                        <button
                          type="button"
                          key={s.id || idx}
                          className={`dot ${
                            idx === currentStepIndex
                              ? "active"
                              : idx < currentStepIndex
                              ? "completed"
                              : ""
                          }`}
                          onClick={() => {
                            setCurrentStepIndex(idx);
                            playStep(lessonPlan.steps[idx], lessonPlan.language);
                          }}
                          title={`Step ${idx + 1}: ${s.step_type}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="nav-btn next-primary"
                      onClick={handleNextStep}
                    >
                      <span>{currentStepIndex === lessonPlan.steps.length - 1 ? "Finish" : "Next"}</span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      type="button"
                      className={`video-mode-chip ${autoPlayVideoMode ? "active" : ""}`}
                      onClick={() => setAutoPlayVideoMode((prev) => !prev)}
                      title="Toggle Continuous Video Lecture Mode"
                    >
                      <Film size={13} />
                      <span>{autoPlayVideoMode ? "Auto" : "Manual"}</span>
                    </button>
                  </div>
                }
              />
            </section>

            {/* Right Stage: Interactive Smartboard & Checkpoint Arena */}
            <section className="right-stage">
              <div className="active-lesson-view">
                <SmartBoard
                  visual={currentStep?.visual}
                  step={currentStep}
                  lessonTitle={lessonPlan.topic}
                  currentStep={currentStepIndex + 1}
                  totalSteps={lessonPlan.steps.length}
                  language={lessonPlan.language || "en"}
                  onAnswerEvaluated={handleAnswerEvaluated}
                  onNextStep={handleNextStep}
                  onOpenNotes={() => setShowNotesModal(true)}
                />
              </div>
            </section>
          </main>

          {/* Complete Study Guide & Notes Modal */}
          <StudyNotesModal
            isOpen={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            lessonPlan={lessonPlan}
            teacherName={selectedTeacher?.name || "Dr. Maya"}
            currentStepIndex={currentStepIndex}
          />

          {/* Learning Report Modal */}
          <LearningReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            lessonTopic={lessonPlan?.topic || "Core Principles"}
            teacherName={selectedTeacher?.name || "Dr. Maya"}
            studentScore={studentScore}
            learnerLevel={lessonPlan?.learner_level || "beginner"}
            evalHistory={evalHistory}
          />
        </div>
      </AppShell>
    );
  }

  // REDESIGNED HOME / LESSON SETUP PRODUCTION PAGE
  return (
    <AppShell
      activeNav="home"
      onSelectNav={(tab) => {
        if (tab === "home") {
          setLessonPlan(null);
        }
      }}
      backendStatus={backendStatus}
      studentScore={studentScore}
      onOpenReport={() => setShowReportModal(true)}
      onGoLanding={() => navigateTo("landing")}
    >
      <HomeWorkspace
        onStartLesson={handleStartLesson}
        isLoading={isLoadingLesson}
        selectedTeacher={selectedTeacher}
        onSelectTeacher={setSelectedTeacher}
        topic={topic}
        setTopic={setTopic}
        backendStatus={backendStatus}
      />

      {/* Learning Analytics Modal accessible from top header */}
      <LearningReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        lessonTopic={topic || "Core Principles"}
        teacherName={selectedTeacher?.name || "Dr. Maya"}
        studentScore={studentScore}
        learnerLevel="beginner"
        evalHistory={evalHistory}
      />
    </AppShell>
  );
}

// Resilient topic-aware fallback plan generator when testing standalone
function generateFallbackLessonPlan(topic = "Core Principles", level = "beginner", lang = "en") {
  const cleanTopic = topic ? topic.trim() : "Core Principles";
  const tLower = cleanTopic.toLowerCase();

  // 1. Programming / OOP
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

  // 2. Physics / Circuits / Ohm's Law
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
          options: ["Current increases", "Current decreases", "Current remains unchanged", "Current drops to zero immediately"],
          correct_answer: "Current decreases",
          misconception_guide: "Resistance opposes electron flow. When resistance increases, current must decrease.",
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

  // 3. Dynamic General Generator for Any Topic
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
        question: `What is the primary role or foundational characteristic of ${cleanTopic}?`,
        options: [
          `Providing structured, modular logic for ${cleanTopic}`,
          "Executing arbitrary random operations without order",
          "Terminating processes without producing any output",
          "Resetting all underlying states to zero permanently",
        ],
        correct_answer: `Providing structured, modular logic for ${cleanTopic}`,
        misconception_guide: `Focus on the constructive purpose of ${cleanTopic} in structuring systems predictably.`,
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
