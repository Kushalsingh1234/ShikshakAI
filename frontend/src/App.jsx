import React, { useState, useEffect } from "react";
import TeacherAvatar from "./components/TeacherAvatar";
import SmartBoard from "./components/SmartBoard";
import LessonControl from "./components/LessonControl";
import InteractionModal from "./components/InteractionModal";
import { checkBackendHealth, fetchLessonPlan, generateTTS } from "./services/api";
import { Sparkles, GraduationCap, ChevronRight, ChevronLeft, RefreshCw, BarChart2 } from "lucide-react";
import "./App.css";

export default function App() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [lessonPlan, setLessonPlan] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [studentScore, setStudentScore] = useState({ correct: 0, total: 0 });

  // Initial backend health check
  useEffect(() => {
    async function check() {
      const res = await checkBackendHealth();
      setBackendStatus(res?.status === "healthy" ? "online" : "offline");
    }
    check();
  }, []);

  // Handle lesson start
  const handleStartLesson = async (params) => {
    setIsLoadingLesson(true);
    try {
      const plan = await fetchLessonPlan(params);
      setLessonPlan(plan);
      setCurrentStepIndex(0);
      playStep(plan.steps[0], plan.language);
    } catch (err) {
      alert("Failed to start lesson: " + err.message);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Play audio for a specific lesson step
  const playStep = async (step, language = "en") => {
    if (!step) return;
    setIsPlayingAudio(true);
    try {
      const audioUrl = await generateTTS(step.teacher_script, language);
      setCurrentAudioUrl(audioUrl);
    } catch (err) {
      console.warn("TTS fallback (browser audio):", err);
      // Fallback to browser synthesis if backend audio generation fails
      const utterance = new SpeechSynthesisUtterance(step.teacher_script);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.onend = () => handleAudioEnded(step);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAudioEnded = (step) => {
    setIsPlayingAudio(false);
    const activeStep = step || lessonPlan?.steps[currentStepIndex];
    if (activeStep?.step_type === "checkpoint") {
      setShowInteraction(true);
    }
  };

  const handleNextStep = () => {
    setShowInteraction(false);
    if (!lessonPlan) return;
    if (currentStepIndex < lessonPlan.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      playStep(lessonPlan.steps[nextIdx], lessonPlan.language);
    }
  };

  const handlePrevStep = () => {
    setShowInteraction(false);
    if (!lessonPlan || currentStepIndex === 0) return;
    const prevIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevIdx);
    playStep(lessonPlan.steps[prevIdx], lessonPlan.language);
  };

  const handleAnswerEvaluated = (result) => {
    setStudentScore(prev => ({
      correct: prev.correct + (result.is_correct ? 1 : 0),
      total: prev.total + 1
    }));
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
            <h2>AI Teacher Studio</h2>
            <span className="subtitle">Adaptive Video Educator • 2026 Hackathon</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className={`status-pill ${backendStatus}`}>
            <span className="dot"></span>
            <span>{backendStatus === "online" ? "AI Engine Online" : "Connecting Backend"}</span>
          </div>

          <div className="score-pill">
            <BarChart2 size={16} />
            <span>Score: {studentScore.correct}/{studentScore.total}</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Classroom Stage */}
      <main className="stage-grid">
        {/* Left Pane: Human-like AI Avatar Teacher */}
        <section className="left-stage">
          <TeacherAvatar
            scriptText={currentStep ? currentStep.teacher_script : "Select a topic or upload your material on the right to start our lesson!"}
            audioUrl={currentAudioUrl}
            isPlaying={isPlayingAudio}
            onAudioEnded={() => handleAudioEnded(currentStep)}
            teacherName="Dr. Maya"
          />

          {lessonPlan && (
            <div className="lesson-nav-bar">
              <button
                className="nav-btn"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <div className="step-dots">
                {lessonPlan.steps.map((s, idx) => (
                  <span
                    key={s.id}
                    className={`dot ${idx === currentStepIndex ? "active" : idx < currentStepIndex ? "completed" : ""}`}
                    title={s.step_type}
                  />
                ))}
              </div>

              <button
                className="nav-btn"
                onClick={handleNextStep}
                disabled={currentStepIndex === lessonPlan.steps.length - 1}
              >
                <span>Next</span>
                <ChevronRight size={18} />
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
            />
          ) : (
            <div className="active-lesson-view">
              <div className="lesson-top-bar">
                <div className="lesson-meta">
                  <span className="badge topic-badge">{lessonPlan.topic}</span>
                  <span className="badge level-badge">{lessonPlan.learner_level}</span>
                  <span className="badge time-badge">{lessonPlan.target_duration_minutes} mins</span>
                </div>
                <button
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
    </div>
  );
}
