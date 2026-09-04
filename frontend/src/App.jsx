import React, { useState, useEffect, useRef } from "react";
import TeacherAvatar from "./components/TeacherAvatar";
import SmartBoard from "./components/SmartBoard";
import LessonControl from "./components/LessonControl";
import InteractionModal from "./components/InteractionModal";
import LearningReportModal from "./components/LearningReportModal";
import LessonRecorder from "./components/LessonRecorder";
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
} from "lucide-react";
import "./App.css";

export default function App() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [selectedTeacher, setSelectedTeacher] = useState(DEFAULT_TEACHER);
  const [lessonPlan, setLessonPlan] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [studentScore, setStudentScore] = useState({ correct: 0, total: 0 });
  const [evalHistory, setEvalHistory] = useState([]);
  const [autoPlayVideoMode, setAutoPlayVideoMode] = useState(true);
  const autoAdvanceTimeoutRef = useRef(null);

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

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="classroom-nav">
        <div className="brand-group">
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <div className="brand-text">
            <h2>ShikshakAI</h2>
            <span className="subtitle">The Adaptive Video Educator • Hackathon 2026</span>
          </div>
        </div>

        <div className="nav-actions">
          {/* Backend Status Pill */}
          <div className={`status-pill ${backendStatus}`}>
            <span className="dot"></span>
            <span>{backendStatus === "online" ? "AI Engine Online" : "AI Engine Ready"}</span>
          </div>

          {/* Lesson Video Recording Button */}
          <LessonRecorder lessonTitle={lessonPlan?.topic || "Virtual_Classroom"} />

          {/* Live Score Pill */}
          <div className="score-pill">
            <BarChart2 size={16} />
            <span>Score: {studentScore.correct}/{studentScore.total}</span>
          </div>

          {/* Learning Report Modal Opener */}
          <button
            type="button"
            className="open-report-pill-btn"
            onClick={() => setShowReportModal(true)}
            title="View Student Learning Analytics"
          >
            <Award size={15} />
            <span>Learning Report</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Classroom Stage */}
      <main className="stage-grid">
        {/* Left Pane: Human-like AI Avatar Teacher */}
        <section className="left-stage">
          <TeacherAvatar
            scriptText={
              currentStep
                ? currentStep.teacher_script
                : `${selectedTeacher.greeting} Select a topic or upload your material on the right to start our lesson!`
            }
            audioUrl={currentAudioUrl}
            isPlaying={isPlayingAudio}
            onAudioEnded={() => handleAudioEnded(currentStep)}
            currentTeacher={selectedTeacher}
            onSelectTeacher={setSelectedTeacher}
          />

          {lessonPlan && (
            <div className="lesson-nav-bar">
              <button
                type="button"
                className="nav-btn"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
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
                className="nav-btn"
                onClick={handleNextStep}
              >
                <span>{currentStepIndex === lessonPlan.steps.length - 1 ? "Finish Lesson" : "Next"}</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className={`video-mode-chip ${autoPlayVideoMode ? "active" : ""}`}
                onClick={() => setAutoPlayVideoMode((prev) => !prev)}
                title="Toggle Continuous Video Lecture Mode"
              >
                <Film size={14} />
                <span>{autoPlayVideoMode ? "Auto-Play ON" : "Manual"}</span>
              </button>
            </div>
          )}
        </section>

        {/* Right Pane: Smartboard & Pedagogical Controls */}
        <section className="right-stage">
          {!lessonPlan ? (
            <LessonControl
              onStartLesson={handleStartLesson}
              isLoading={isLoadingLesson}
              selectedTeacher={selectedTeacher}
              onSelectTeacher={setSelectedTeacher}
            />
          ) : (
            <div className="active-lesson-view">
              <div className="lesson-top-bar">
                <div className="lesson-meta">
                  <span className="badge topic-badge">{lessonPlan.topic}</span>
                  <span className="badge level-badge">{lessonPlan.learner_level}</span>
                  <span className="badge time-badge">{lessonPlan.target_duration_minutes} mins</span>
                  <span className="badge teacher-badge" style={{ borderColor: selectedTeacher.accentColor }}>
                    {selectedTeacher.name}
                  </span>
                </div>

                <div className="lesson-actions-group">
                  <button
                    type="button"
                    className="report-shortcut-btn"
                    onClick={() => setShowReportModal(true)}
                  >
                    <Award size={14} />
                    <span>Report & Roadmap</span>
                  </button>

                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() => {
                      setLessonPlan(null);
                      setCurrentAudioUrl(null);
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>New Lesson</span>
                  </button>
                </div>
              </div>

              <SmartBoard
                visual={currentStep?.visual}
                lessonTitle={lessonPlan.topic}
                currentStep={currentStepIndex + 1}
                totalSteps={lessonPlan.steps.length}
              />
            </div>
          )}
        </section>
      </main>

      {/* Mid-lesson Checkpoint & Misconception Dialog */}
      {showInteraction && currentStep?.step_type === "checkpoint" && (
        <InteractionModal
          step={currentStep}
          language={lessonPlan?.language || "en"}
          onAnswerEvaluated={handleAnswerEvaluated}
          onNextStep={handleNextStep}
        />
      )}

      {/* Post-Lesson Student Analytics & 7-Day Study Roadmap Report Modal */}
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
  );
}

// Resilient fallback plan generator when testing standalone
function generateFallbackLessonPlan(topic = "Ohm's Law", level = "beginner", lang = "en") {
  return {
    topic: topic || "Ohm's Law & Circuit Principles",
    learner_level: level || "beginner",
    target_duration_minutes: 20,
    language: lang || "en",
    steps: [
      {
        id: "step-1",
        step_type: "intro",
        teacher_script: `Welcome to our session on ${topic}! Today, we will explore the foundational relationship between voltage, current, and resistance with interactive visuals and hands-on demonstrations.`,
        visual: {
          type: "katex",
          title: "The Golden Equation of Circuits",
          content: "V = I \\cdot R \\iff I = \\frac{V}{R} \\iff R = \\frac{V}{I}",
        },
      },
      {
        id: "step-2",
        step_type: "concept",
        teacher_script: `Let us examine how charge carriers drift through conductive materials. Resistance arises from the microscopic collisions of accelerating electrons with lattice ions.`,
        visual: {
          type: "formula_derivation",
          title: "Microscopic Derivation of Ohm's Law",
        },
      },
      {
        id: "step-3",
        step_type: "checkpoint",
        teacher_script: `Here is a checkpoint question to test your intuition! If we double the voltage across a constant resistor, what happens to the electric current?`,
        question: "If Voltage (V) is doubled across a constant resistor (R), what happens to the Current (I)?",
        options: [
          "Current doubles (2x)",
          "Current is halved (1/2x)",
          "Current remains unchanged",
          "Current quadruples (4x)",
        ],
        correct_answer: "Current doubles (2x)",
        misconception_guide: "Because V = I * R, current I is directly proportional to voltage V when R is constant.",
        visual: {
          type: "bullet_points",
          title: "Key Insights to Consider",
          content: "1. V = I * R (Linear proportionality)\n2. Constant resistance maintains constant slope\n3. Increasing electrical pressure accelerates more electrons per second",
        },
      },
      {
        id: "step-4",
        step_type: "simulation",
        teacher_script: `Now let's switch to the code sandbox to verify our mathematical calculations programmatically! Check the execution output.`,
        visual: {
          type: "code",
          title: "Circuit Calculation Sandbox",
          language: "python",
          content: `# Circuit Simulation: Ohm's Law\ndef simulate_circuit(voltage, resistance):\n    current = voltage / resistance\n    power = voltage * current\n    return current, power\n\nv = 24.0 # Volts\nr = 6.0  # Ohms\n\ni, p = simulate_circuit(v, r)\nprint(f"[+] Voltage    : {v:.1f} V")\nprint(f"[+] Resistance : {r:.1f} Ω")\nprint(f"[*] Current    : {i:.2f} A")\nprint(f"[*] Power Diss : {p:.2f} Watts")`,
        },
      },
    ],
  };
}
