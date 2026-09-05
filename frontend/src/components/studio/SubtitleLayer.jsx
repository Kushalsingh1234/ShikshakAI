import React from "react";
import { Volume2, Sparkles } from "lucide-react";

export default function SubtitleLayer({
  text = "",
  teacherName = "Dr. Maya",
  isPlaying = false,
  isVisible = true,
}) {
  if (!isVisible || !text) return null;

  // Format bold key terms or math expressions
  const renderFormattedText = (raw) => {
    // If text has markdown **term**, highlight it
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="sub-highlight">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="studio-subtitle-container">
      <div className="subtitle-pill-card">
        <div className="subtitle-speaker-tag">
          <Volume2 size={13} className={isPlaying ? "animate-pulse text-indigo-400" : "text-slate-400"} />
          <span>{teacherName}</span>
        </div>
        <p className="subtitle-content-text">
          "{renderFormattedText(text)}"
        </p>
      </div>
    </div>
  );
}
