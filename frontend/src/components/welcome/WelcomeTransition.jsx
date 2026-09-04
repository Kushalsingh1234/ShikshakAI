import React, { useState, useEffect } from "react";
import { Sparkles, Bot, GraduationCap, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import "./WelcomeTransition.css";

const STAGES = [
  { id: 1, label: "Booting adaptive AI tutor engines", icon: Cpu },
  { id: 2, label: "Calibrating interactive SmartBoard studio", icon: GraduationCap },
  { id: 3, label: "Personalized workspace ready", icon: Sparkles },
];

export default function WelcomeTransition({ onComplete, studentName = "Aarav" }) {
  const [progress, setProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const totalDuration = 2200; // 2.2s total smooth transition
    const intervalTime = 25;
    const stepIncrement = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 35) {
      setCurrentStageIdx(0);
    } else if (progress < 75) {
      setCurrentStageIdx(1);
    } else {
      setCurrentStageIdx(2);
    }

    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        triggerExit();
      }, 350);
      return () => clearTimeout(exitTimer);
    }
  }, [progress]);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete && onComplete();
    }, 450); // Matches CSS fade/scale exit animation
  };

  return (
    <div className={`welcome-screen-root ${isExiting ? "is-exiting" : ""}`}>
      {/* Dynamic Ambient Background Glows */}
      <div className="welcome-ambient-glow glow-top-right" aria-hidden="true" />
      <div className="welcome-ambient-glow glow-bottom-left" aria-hidden="true" />
      <div className="welcome-grid-overlay" aria-hidden="true" />

      {/* Main Glassmorphism Center Card */}
      <div className="welcome-card">
        {/* Floating Animated Brand Emblem */}
        <div className="welcome-emblem-container">
          <div className="welcome-ripple-ring ring-1" />
          <div className="welcome-ripple-ring ring-2" />
          <div className="welcome-emblem-badge">
            <Bot size={38} className="emblem-bot-icon" />
            <div className="emblem-sparkle-dot">
              <Sparkles size={14} />
            </div>
          </div>
        </div>

        {/* Title & Personalized Greeting */}
        <div className="welcome-text-group">
          <div className="welcome-brand-tag">
            <span className="brand-tag-deva">शिक्षक AI</span>
            <span className="brand-tag-dot">•</span>
            <span className="brand-tag-latin">ShikshakAI Studio</span>
          </div>
          <h1 className="welcome-title">
            Welcome, <span className="welcome-highlight">{studentName}</span>
          </h1>
          <p className="welcome-subtitle">
            Preparing your interactive AI classroom & personalized curriculum...
          </p>
        </div>

        {/* Stage Micro-Steps Indicator */}
        <div className="welcome-stages-list">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = progress > (idx === 0 ? 35 : idx === 1 ? 75 : 95);
            const isCurrent = currentStageIdx === idx && !isDone;

            return (
              <div
                key={stage.id}
                className={`welcome-stage-item ${isDone ? "is-done" : ""} ${
                  isCurrent ? "is-active" : ""
                }`}
              >
                <div className="stage-icon-wrap">
                  {isDone ? (
                    <CheckCircle2 size={16} className="stage-check-icon" />
                  ) : (
                    <Icon size={16} className="stage-action-icon" />
                  )}
                </div>
                <span className="stage-label">{stage.label}</span>
                {isCurrent && <span className="stage-pulse-dot" />}
              </div>
            );
          })}
        </div>

        {/* Linear Glowing Progress Bar */}
        <div className="welcome-progress-section">
          <div className="progress-meta-row">
            <span className="progress-status-text">
              {progress >= 100 ? "Ready to explore" : "Optimizing environment"}
            </span>
            <span className="progress-percent">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="welcome-progress-track">
            <div
              className="welcome-progress-fill"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Bottom Fast-Forward Action */}
        <button
          type="button"
          className="welcome-skip-btn"
          onClick={triggerExit}
          title="Jump directly to workspace"
        >
          <span>Enter Workspace</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
