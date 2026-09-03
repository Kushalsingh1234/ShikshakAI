import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Share2,
  X,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Clock,
  BookOpen,
} from "lucide-react";

export default function LearningReportModal({
  isOpen,
  onClose,
  lessonTopic = "Ohm's Law & Circuit Analysis",
  teacherName = "Dr. Maya",
  studentScore = { correct: 2, total: 2 },
  learnerLevel = "beginner",
  evalHistory = [],
  onOpenFlashcards,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "roadmap"
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const total = studentScore.total || 1;
  const correct = studentScore.correct || 0;
  const accuracyPct = Math.round((correct / total) * 100);

  // Generate 7-day revision roadmap based on topic and learner level
  const roadmapDays = [
    {
      day: "Day 1",
      title: "Core Intuition & Formula Recall",
      duration: "15 mins",
      focus: `Revisit ${lessonTopic} definitions, unit conversions, and fundamental relationships.`,
      task: "Complete 5 conceptual flashcards & write down formulas from memory.",
      status: "ready",
    },
    {
      day: "Day 2",
      title: "Visual Derivation & Variable Effects",
      duration: "20 mins",
      focus: "Analyze how changing parameters (e.g., temperature, resistance, length) alters outcomes.",
      task: "Step through the mathematical derivation without looking at hints.",
      status: "upcoming",
    },
    {
      day: "Day 3",
      title: "Common Misconception Busting",
      duration: "15 mins",
      focus: "Target areas where common pitfalls occur in exams and practical experiments.",
      task: "Review checkpoint questions and explain why alternative options were incorrect.",
      status: "upcoming",
    },
    {
      day: "Day 4",
      title: "Hands-on Code & Numerical Problems",
      duration: "25 mins",
      focus: "Solve 3 multi-step calculation problems or code simulations.",
      task: "Simulate edge cases in the interactive code sandbox.",
      status: "upcoming",
    },
    {
      day: "Day 5",
      title: "Interleaving with Related Concepts",
      duration: "20 mins",
      focus: `Connect ${lessonTopic} with adjacent topics in the curriculum.`,
      task: "Draft a 1-page Mermaid mind-map connecting all interconnected principles.",
      status: "upcoming",
    },
    {
      day: "Day 6",
      title: "Timed Speed & Accuracy Drill",
      duration: "20 mins",
      focus: "Build exam speed and rapid pattern recognition.",
      task: "Take a 10-question adaptive checkpoint quiz under time constraints.",
      status: "upcoming",
    },
    {
      day: "Day 7",
      title: "Feynman Technique & Mastery Check",
      duration: "15 mins",
      focus: "Teach the concept back to the AI in your own words.",
      task: "Deliver a 2-minute voice summary to Dr. Maya / AI Educator.",
      status: "upcoming",
    },
  ];

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `🎓 I just completed my adaptive AI lesson on "${lessonTopic}" with ${teacherName} on ShikshakAI! Mastery Score: ${accuracyPct}%`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-card">
        {/* Modal Header */}
        <div className="report-header">
          <div className="report-badge-group">
            <div className="report-icon-box">
              <Award size={22} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="report-main-title">Learning Mastery Report</h3>
              <span className="report-subtitle">
                Topic: <strong>{lessonTopic}</strong> • Taught by {teacherName}
              </span>
            </div>
          </div>

          <div className="report-header-actions">
            <button
              type="button"
              className="report-action-icon-btn"
              onClick={handleShare}
              title="Share Progress"
            >
              <Share2 size={16} />
              <span>{isCopied ? "Link Copied!" : "Share"}</span>
            </button>
            <button
              type="button"
              className="report-action-icon-btn"
              onClick={handlePrintOrDownload}
              title="Download / Print PDF"
            >
              <Download size={16} />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              className="report-close-btn"
              onClick={onClose}
              title="Close Report"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="report-tab-bar">
          <button
            type="button"
            className={`report-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <TrendingUp size={15} />
            <span>Mastery Overview</span>
          </button>
          <button
            type="button"
            className={`report-tab-btn ${activeTab === "roadmap" ? "active" : ""}`}
            onClick={() => setActiveTab("roadmap")}
          >
            <Calendar size={15} />
            <span>7-Day Adaptive Study Roadmap</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="report-body-scrollable">
          {activeTab === "overview" ? (
            <div className="report-overview-grid">
              {/* Score & Mastery Ring */}
              <div className="report-score-panel">
                <div className="mastery-radial-wrap">
                  <svg className="radial-svg" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="radial-bg"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="radial-fill"
                      style={{
                        strokeDasharray: 314,
                        strokeDashoffset: 314 - (314 * accuracyPct) / 100,
                      }}
                    />
                  </svg>
                  <div className="radial-center-text">
                    <span className="radial-percent">{accuracyPct}%</span>
                    <span className="radial-label">Mastery Score</span>
                  </div>
                </div>

                <div className="score-summary-list">
                  <div className="summary-stat-box">
                    <span className="stat-num">{correct} / {total}</span>
                    <span className="stat-lbl">Checkpoints Correct</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-num">{learnerLevel.toUpperCase()}</span>
                    <span className="stat-lbl">Learner Level</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Misconception Insights */}
              <div className="report-insights-panel">
                {/* Strong Areas */}
                <div className="insight-card strengths">
                  <div className="insight-header">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <h5>Strong Concepts Demonstrated</h5>
                  </div>
                  <ul className="insight-list">
                    <li>Grasped fundamental direct proportionality and core physical definitions.</li>
                    <li>Successfully mapped algebraic variables to circuit parameters.</li>
                    <li>Demonstrated clear intuitive recall during interactive checkpoint questions.</li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="insight-card focus-areas">
                  <div className="insight-header">
                    <BrainCircuit size={16} className="text-indigo-400" />
                    <h5>Personalized AI Recommendations</h5>
                  </div>
                  <ul className="insight-list">
                    <li>Practice step-by-step formula derivations to cement variable relationships.</li>
                    <li>Test edge conditions using the live Code Sandbox terminal.</li>
                    <li>Follow the 7-day spaced repetition schedule for long-term retention.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // 7-Day Roadmap View
            <div className="roadmap-container">
              <div className="roadmap-intro-banner">
                <Calendar size={18} className="text-amber-400" />
                <div>
                  <h6>7-Day Spaced Repetition Schedule</h6>
                  <p>Designed to maximize memory consolidation through active recall and interleaving.</p>
                </div>
              </div>

              <div className="roadmap-timeline">
                {roadmapDays.map((item, idx) => (
                  <div key={idx} className="roadmap-item-card">
                    <div className="roadmap-day-pill">
                      <span>{item.day}</span>
                    </div>

                    <div className="roadmap-item-content">
                      <div className="roadmap-item-top">
                        <h5 className="roadmap-day-title">{item.title}</h5>
                        <span className="roadmap-duration">
                          <Clock size={12} />
                          <span>{item.duration}</span>
                        </span>
                      </div>
                      <p className="roadmap-focus-text">{item.focus}</p>
                      <div className="roadmap-task-box">
                        <BookOpen size={13} className="text-indigo-400" />
                        <span><strong>Action Item:</strong> {item.task}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="report-footer">
          <button
            type="button"
            className="secondary-modal-btn"
            onClick={() => {
              onClose();
              if (onOpenFlashcards) onOpenFlashcards();
            }}
          >
            <Sparkles size={16} />
            <span>Practice Chapter Flashcards</span>
          </button>

          <button type="button" className="primary-modal-btn" onClick={onClose}>
            <span>Done & Continue Learning</span>
          </button>
        </div>
      </div>
    </div>
  );
}
