import React, { useState } from "react";
import {
  ClipboardCheck,
  Award,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  X,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  getAssessmentsForPastSearches,
  updateTopicProgress,
} from "../../utils/learningHistory";
import "./Views.css";

export default function AssessmentsView({
  searchHistory = [],
  onRefreshHistory,
  onNavigateTab,
}) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const assessments = getAssessmentsForPastSearches(searchHistory);

  const startAssessment = (assessment) => {
    setActiveQuiz(assessment);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const currentQ = activeQuiz ? activeQuiz.questions[currentQuestionIdx] : null;

  const handleSubmitOption = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished: compute final percentage and save to topic progress
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      const percentage = Math.round((finalScore / activeQuiz.questions.length) * 100);
      updateTopicProgress(activeQuiz.topic, 100, percentage);
      if (onRefreshHistory) onRefreshHistory();
      setIsQuizCompleted(true);
    }
  };

  return (
    <div className="view-page-container">
      {/* Hero Header */}
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Concept Assessments & Quizzes</h1>
          <p>
            Interactive practice assessments generated dynamically from your past searched concepts to test and reinforce your retention.
          </p>
        </div>
        <div className="view-hero-actions">
          <button
            type="button"
            className="resume-lesson-btn"
            onClick={() => {
              if (assessments.length > 0) {
                // Generate a grand quiz with 1 question from each past search
                const grandQuestions = assessments.flatMap((a) => a.questions.slice(0, 1));
                startAssessment({
                  id: "assess_grand_mastery",
                  topic: "All Past Searches Review",
                  category: "Comprehensive",
                  teacherName: "Dr. Maya & Prof. Alex",
                  difficulty: "Mixed",
                  questions: grandQuestions,
                });
              }
            }}
            disabled={assessments.length === 0}
          >
            <Sparkles size={14} />
            <span>Grand Review Assessment</span>
          </button>
        </div>
      </div>

      {/* Topic Assessments Grid */}
      {assessments.length === 0 ? (
        <div className="view-hero-header" style={{ flexDirection: "column", textAlign: "center", padding: "40px" }}>
          <ClipboardCheck size={40} color="var(--color-primary)" style={{ opacity: 0.8, marginBottom: 10 }} />
          <h3>No assessments generated yet</h3>
          <p>Search topics from the Dashboard to generate personalized practice quizzes.</p>
          <button
            type="button"
            className="resume-lesson-btn"
            style={{ marginTop: 14 }}
            onClick={() => onNavigateTab("home")}
          >
            Search a Topic
          </button>
        </div>
      ) : (
        <div className="assessments-grid">
          {assessments.map((item) => (
            <article key={item.id} className="assessment-topic-card">
              <div>
                <div className="history-card-header">
                  <span className="category-tag">{item.category}</span>
                  <span className="badge-pill" style={{ textTransform: "capitalize" }}>
                    {item.difficulty}
                  </span>
                </div>

                <h3 className="history-topic-title" style={{ fontSize: 18 }}>
                  {item.topic} Assessment
                </h3>
                <p className="history-topic-summary">
                  {item.questionCount} diagnostic conceptual checkpoint questions targeting fundamentals, derivations, and problem solving.
                </p>

                <div className="history-meta-bar" style={{ marginBottom: 18 }}>
                  <span>
                    <Clock size={13} /> ~{item.estimatedMinutes} min
                  </span>
                  <span>
                    <Award size={13} /> Last Score: {item.lastScore || 75}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="resume-lesson-btn"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => startAssessment(item)}
              >
                <Play size={14} />
                <span>Start Assessment</span>
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Interactive Quiz Runner Modal */}
      {activeQuiz && (
        <div className="quiz-runner-modal-backdrop">
          <div className="quiz-runner-modal">
            {/* Header */}
            <div className="quiz-modal-header">
              <div>
                <h2>{activeQuiz.topic} Assessment</h2>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                </span>
              </div>
              <button
                type="button"
                className="action-icon-btn"
                onClick={() => setActiveQuiz(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="quiz-modal-body">
              {!isQuizCompleted ? (
                <>
                  <div className="quiz-question-title">
                    {currentQ.question}
                  </div>

                  <div className="quiz-options-list">
                    {currentQ.options.map((opt, idx) => {
                      let btnClass = "quiz-option-btn";
                      if (selectedOption === idx) btnClass += " selected";
                      if (isAnswerSubmitted) {
                        if (idx === currentQ.correctIndex) btnClass += " correct";
                        else if (selectedOption === idx) btnClass += " wrong";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={btnClass}
                          onClick={() => {
                            if (!isAnswerSubmitted) setSelectedOption(idx);
                          }}
                          disabled={isAnswerSubmitted}
                        >
                          <span style={{ fontWeight: 700, marginRight: 8 }}>
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Box */}
                  {isAnswerSubmitted && (
                    <div
                      className={`quiz-feedback-box ${
                        selectedOption === currentQ.correctIndex ? "correct" : "wrong"
                      }`}
                    >
                      <strong>
                        {selectedOption === currentQ.correctIndex
                          ? "Correct! Excellent reasoning."
                          : "Needs Review:"}
                      </strong>{" "}
                      {currentQ.explanation}
                    </div>
                  )}
                </>
              ) : (
                /* Completed State */
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Award size={54} color="var(--color-primary)" style={{ margin: "0 auto 14px auto" }} />
                  <h3 style={{ fontSize: 20, margin: "0 0 8px 0" }}>Assessment Completed!</h3>
                  <p style={{ color: "var(--color-text-secondary)", margin: "0 0 16px 0" }}>
                    You scored <strong>{score}</strong> out of <strong>{activeQuiz.questions.length}</strong> ({Math.round((score / activeQuiz.questions.length) * 100)}% mastery).
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                    Your learning progress and mastery matrix have been updated.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="quiz-modal-footer">
              {!isQuizCompleted ? (
                <>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setActiveQuiz(null)}
                  >
                    Cancel
                  </button>

                  {!isAnswerSubmitted ? (
                    <button
                      type="button"
                      className="resume-lesson-btn"
                      onClick={handleSubmitOption}
                      disabled={selectedOption === null}
                      style={{ opacity: selectedOption === null ? 0.6 : 1 }}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="resume-lesson-btn"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIdx < activeQuiz.questions.length - 1
                        ? "Next Question"
                        : "View Results"}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => startAssessment(activeQuiz)}
                  >
                    <RotateCcw size={13} style={{ marginRight: 4 }} />
                    Retake Quiz
                  </button>
                  <button
                    type="button"
                    className="resume-lesson-btn"
                    onClick={() => {
                      setActiveQuiz(null);
                      onNavigateTab("progress");
                    }}
                  >
                    View Progress Matrix
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
