import React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Sparkles, Lightbulb } from "lucide-react";

export default function AdaptiveFeedback({
  result, // { is_correct, misconception_detected, detected_misconception, feedback, adaptive_action }
  onContinue,
  onTriggerAdaptiveScene,
  teacherName = "Dr. Maya",
}) {
  if (!result) return null;

  const isCorrect = result.is_correct;

  return (
    <div className={`adaptive-feedback-stage ${isCorrect ? "is-success" : "is-misconception"}`}>
      <div className="feedback-card">
        {/* Status Header */}
        <div className="feedback-header">
          <div className="feedback-icon-wrap">
            {isCorrect ? (
              <CheckCircle2 size={24} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={24} className="text-amber-400" />
            )}
          </div>
          <div className="feedback-title-group">
            <h3 className="feedback-heading">
              {isCorrect ? "Conceptual Mastery Verified!" : "Conceptual Misconception Detected"}
            </h3>
            <span className="feedback-subhead">
              {isCorrect
                ? `${teacherName} confirms your algebraic intuition is solid.`
                : `${teacherName} is adapting the lesson to clarify the underlying rule.`}
            </span>
          </div>
        </div>

        {/* Misconception Diagnostic Breakdown */}
        {!isCorrect && result.detected_misconception && (
          <div className="misconception-callout-box">
            <div className="callout-header">
              <Lightbulb size={16} className="text-amber-300" />
              <span>Diagnostic Insight:</span>
            </div>
            <p className="misconception-text">{result.detected_misconception}</p>
          </div>
        )}

        {/* Spoken Teacher Feedback */}
        <div className="feedback-speech-bubble">
          <p className="speech-text">"{result.feedback}"</p>
        </div>

        {/* Action Button: Continue or Launch Adaptive Breakdown */}
        <div className="feedback-actions-row">
          {isCorrect ? (
            <button
              type="button"
              className="feedback-primary-btn success-btn"
              onClick={onContinue}
            >
              <span>Continue Lesson</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="feedback-primary-btn adapt-btn"
              onClick={onTriggerAdaptiveScene}
            >
              <Sparkles size={15} />
              <span>Explore Simpler Balance Analogy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
