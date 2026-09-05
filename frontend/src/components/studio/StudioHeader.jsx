import React from "react";
import { ArrowLeft, MessageSquare, FileText, Radio } from "lucide-react";

export default function StudioHeader({
  topic = "Linear Equations",
  teacherName = "Dr. Maya",
  currentScene = 1,
  totalScenes = 6,
  onExit,
  onOpenNotes,
  onOpenAskTeacher,
}) {
  return (
    <header className="studio-minimal-header">
      {/* Left: Exit & Live Lesson Info */}
      <div className="header-left-cluster">
        <button
          type="button"
          className="studio-exit-btn"
          onClick={onExit}
          title="Return to Dashboard / Setup"
        >
          <ArrowLeft size={15} />
          <span>Exit Studio</span>
        </button>

        <div className="header-divider-v" />

        <div className="studio-lesson-identity">
          <span className="studio-teacher-label">AI TEACHER • {teacherName}</span>
          <h1 className="studio-topic-name">{topic}</h1>
        </div>

        <div className="studio-live-indicator">
          <span className="live-pulsing-dot" />
          <span>Live Lesson</span>
        </div>
      </div>

      {/* Middle/Right: Clean Scene Progress & Time */}
      <div className="header-progress-cluster">
        <span className="scene-counter-badge">
          Scene {String(currentScene).padStart(2, "0")} / {String(totalScenes).padStart(2, "0")}
        </span>
        <span className="time-remaining-label">~10 min session</span>
      </div>

      {/* Right Actions: Notes, Ask Teacher */}
      <div className="header-actions-cluster">
        <button
          type="button"
          className="studio-action-pill-btn ask-teacher-btn"
          onClick={onOpenAskTeacher}
          title={`Ask ${teacherName} a question about the active step`}
        >
          <MessageSquare size={14} className="text-indigo-400" />
          <span>Ask {teacherName.split(" ")[0]}</span>
        </button>

        <button
          type="button"
          className="studio-action-pill-btn"
          onClick={onOpenNotes}
          title="View and download complete lesson notes"
        >
          <FileText size={14} />
          <span>Notes</span>
        </button>
      </div>
    </header>
  );
}
