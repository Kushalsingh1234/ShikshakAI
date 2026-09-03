import React, { useState } from "react";
import { Play, UploadCloud, Clock, GraduationCap, Languages, FileText } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function LessonControl({ onStartLesson, isLoading }) {
  const [topic, setTopic] = useState("Ohm's Law");
  const [learnerLevel, setLearnerLevel] = useState("beginner");
  const [duration, setDuration] = useState(20);
  const [language, setLanguage] = useState("en");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setUploadedFileName(res.filename);
      // Auto-populate topic name from file if empty
      setTopic(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } catch (err) {
      alert("Failed to upload document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartLesson({
      topic,
      learner_level: learnerLevel,
      target_duration_minutes: duration,
      language,
    });
  };

  return (
    <div className="controls-card">
      <form onSubmit={handleSubmit} className="controls-form">
        {/* Topic or Upload Input */}
        <div className="input-group">
          <label className="input-label">
            <GraduationCap size={16} />
            <span>Learning Topic or Concept</span>
          </label>
          <input
            type="text"
            className="text-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Ohm's Law, Newton's Laws, Neural Networks"
            required
          />
        </div>

        {/* Upload Textbook / PDF */}
        <div className="upload-wrapper">
          <label className="upload-btn">
            <UploadCloud size={16} />
            <span>{isUploading ? "Uploading..." : uploadedFileName ? `Attached: ${uploadedFileName}` : "Upload Notes / Textbook (PDF, DOCX)"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
          {uploadedFileName && (
            <span className="file-badge">
              <FileText size={12} /> Ready
            </span>
          )}
        </div>

        {/* Time Budget Selector */}
        <div className="input-group">
          <label className="input-label">
            <Clock size={16} />
            <span>Available Learning Time</span>
          </label>
          <div className="pill-group">
            {[
              { val: 5, label: "5 Mins (Quick)" },
              { val: 20, label: "20 Mins (Standard)" },
              { val: 60, label: "60 Mins (Deep)" },
              { val: 10080, label: "7-Day Plan" },
            ].map((t) => (
              <button
                type="button"
                key={t.val}
                className={`pill-btn ${duration === t.val ? "active" : ""}`}
                onClick={() => setDuration(t.val)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Learner Level Selector */}
        <div className="input-group">
          <label className="input-label">
            <GraduationCap size={16} />
            <span>Learner Level</span>
          </label>
          <div className="pill-group">
            {[
              { val: "beginner", label: "Beginner" },
              { val: "intermediate", label: "Intermediate" },
              { val: "advanced", label: "Advanced" },
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.val}
                className={`pill-btn ${learnerLevel === lvl.val ? "active" : ""}`}
                onClick={() => setLearnerLevel(lvl.val)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className="input-group">
          <label className="input-label">
            <Languages size={16} />
            <span>Language</span>
          </label>
          <div className="pill-group">
            {[
              { val: "en", label: "English" },
              { val: "hi", label: "Hindi (हिंदी)" },
              { val: "hinglish", label: "Hinglish" },
            ].map((lang) => (
              <button
                type="button"
                key={lang.val}
                className={`pill-btn ${language === lang.val ? "active" : ""}`}
                onClick={() => setLanguage(lang.val)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button type="submit" className="start-lesson-btn" disabled={isLoading}>
          <Play size={18} fill="currentColor" />
          <span>{isLoading ? "Preparing Adaptive Lesson..." : "Start Teaching Session"}</span>
        </button>
      </form>
    </div>
  );
}
