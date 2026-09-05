import React, { useState } from "react";
import { Volume2, Copy, Check, Sparkles, MessageSquare } from "lucide-react";

export default function TeacherCaptionCard({
  text = "",
  teacherName = "Dr. Maya",
  isPlaying = false,
  isVisible = true,
}) {
  const [copied, setCopied] = useState(false);

  if (!isVisible || !text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy text:", err);
    }
  };

  // Clean symbols and format highlighted bold phrases or key concepts
  const renderFormattedText = (raw) => {
    if (!raw) return "";
    // Clean raw markdown headers and bullet prefixes
    let clean = raw.replace(/^#{1,6}\s+/gm, "").replace(/^[\*\-\+•]\s+/gm, "");
    clean = clean.replace(/\$/g, "").replace(/`/g, "");
    const parts = clean.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="caption-highlight">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="teacher-caption-card" role="region" aria-label="Educator Narration">
      {/* Top Action Bar */}
      <div className="caption-card-header">
        <div className="caption-speaker-badge">
          <Volume2 size={13} className={isPlaying ? "speaker-pulse-icon" : "speaker-idle-icon"} />
          <span className="speaker-name">{teacherName}</span>
        </div>

        <button
          type="button"
          className={`caption-copy-btn ${copied ? "is-copied" : ""}`}
          onClick={handleCopy}
          title="Copy explanation text"
          aria-label="Copy explanation text"
        >
          {copied ? (
            <>
              <Check size={12} className="copy-check-icon" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Main Selectable Transcript Body */}
      <div className="caption-card-body">
        <p className="caption-text-content select-text">
          "{renderFormattedText(text)}"
        </p>
      </div>
    </div>
  );
}
