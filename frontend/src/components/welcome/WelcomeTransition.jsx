import React, { useState, useEffect } from "react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import "./WelcomeTransition.css";

export default function WelcomeTransition({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const totalDuration = 1800; // 1.8s quick, smooth transition
    const intervalTime = 20;
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
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        triggerExit();
      }, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [progress]);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete && onComplete();
    }, 400);
  };

  return (
    <div className={`simple-welcome-root ${isExiting ? "is-exiting" : ""}`}>
      {/* Soft Blue Ambient Background Elements */}
      <div className="simple-ambient-glow glow-top" aria-hidden="true" />
      <div className="simple-ambient-glow glow-bottom" aria-hidden="true" />

      <div className="simple-welcome-card">
        {/* Animated Royal Blue Logo Icon */}
        <div className="simple-logo-container">
          <div className="simple-logo-ring" />
          <div className="simple-logo-box">
            <Bot size={36} className="simple-bot-icon" />
            <div className="simple-sparkle-pill">
              <Sparkles size={12} />
            </div>
          </div>
        </div>

        {/* Brand Devanagari Pill */}
        <div className="simple-brand-badge">
          <span className="badge-deva">शिक्षक AI</span>
          <span className="badge-sep">•</span>
          <span className="badge-eng">Adaptive Learning</span>
        </div>

        {/* Core Welcome Message */}
        <h1 className="simple-welcome-heading">
          Welcome to <span className="simple-blue-text">ShikshakAI</span>
        </h1>
        <p className="simple-welcome-sub">
          Preparing your personalized learning studio...
        </p>

        {/* Minimal Blue Progress Indicator */}
        <div className="simple-progress-container">
          <div className="simple-progress-bar">
            <div
              className="simple-progress-indicator"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Fast-Forward Action */}
        <button
          type="button"
          className="simple-continue-btn"
          onClick={triggerExit}
          title="Continue to workspace"
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
