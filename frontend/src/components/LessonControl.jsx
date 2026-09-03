import React, { useState } from "react";
import { Play, UploadCloud, Clock, GraduationCap, Languages, FileText, UserCheck, Sparkles } from "lucide-react";
import { uploadDocument } from "../services/api";
import { TEACHERS } from "../constants/teachers";

export default function LessonControl({
  onStartLesson,
  isLoading,
  selectedTeacher = TEACHERS[0],
  onSelectTeacher,
}) {
  const [topic, setTopic] = useState("Ohm's Law");
  const [learnerLevel, setLearnerLevel] = useState("beginner");
  const [duration, setDuration] = useState(20);
  const [language, setLanguage] = useState("en");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const topicPresets = [
    { label: "⚡ Ohm's Law (Physics)", val: "Ohm's Law", teacherId: "dr-maya" },
    { label: "💻 Binary Search (CS)", val: "Binary Search & Recursion", teacherId: "prof-alex" },
    { label: "🪐 Newton's Laws", val: "Newton's Laws of Motion", teacherId: "dr-maya" },
    { label: "📖 कबीर के दोहे (Hindi)", val: "कबीर के दोहे एवं उनका जीवन दर्शन", teacherId: "ananya", lang: "hi" },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setUploadedFileName(res.filename);
      setTopic(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } catch (err) {
      alert("Failed to upload document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePresetClick = (preset) => {
    setTopic(preset.val);
    if (preset.lang) setLanguage(preset.lang);
    if (preset.teacherId && onSelectTeacher) {
      const t = TEACHERS.find((item) => item.id === preset.teacherId);
      if (t) onSelectTeacher(t);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartLesson({
      topic,
      learner_level: learnerLevel,
      target_duration_minutes: duration,
      language,
      teacher: selectedTeacher,
    });
  };

  return (
    <div className="controls-card">
      <form onSubmit={handleSubmit} className="controls-form">
        {/* Choose Teacher Personality */}
        <div className="input-group">
          <label className="input-label">
            <Sparkles size={16} className="text-indigo-400" />
            <span>Select Your AI Educator Personality</span>
          </label>
          <div className="teacher-cards-grid">
            {TEACHERS.map((teacher) => {
              const isSelected = selectedTeacher?.id === teacher.id;
              return (
                <button
                  type="button"
                  key={teacher.id}
                  className={`teacher-card-select ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectTeacher && onSelectTeacher(teacher)}
                  style={{
                    borderColor: isSelected ? teacher.accentColor : undefined,
                  }}
                >
                  <div
                    className="teacher-avatar-mini"
                    style={{ background: teacher.avatarBg }}
                  >
                    <span>{teacher.name.charAt(0)}</span>
                  </div>
                  <div className="teacher-card-details">
                    <span className="name">{teacher.name}</span>
                    <span className="spec">{teacher.specialty}</span>
                    <span className="tone-tag">{teacher.tone}</span>
                  </div>
                  {isSelected && (
                    <UserCheck size={16} className="selected-indicator" style={{ color: teacher.accentColor }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input */}
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
            placeholder="e.g., Ohm's Law, Binary Search, Photosynthesis"
            required
          />

          {/* Quick topic presets */}
          <div className="preset-topics-row">
            {topicPresets.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                className="preset-chip"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Notes / PDF */}
        <div className="upload-wrapper">
          <label className="upload-btn">
            <UploadCloud size={16} />
            <span>
              {isUploading
                ? "Uploading..."
                : uploadedFileName
                ? `Attached: ${uploadedFileName}`
                : "Upload Notes / Textbook (PDF, DOCX, PPTX)"}
            </span>
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

        {/* Duration / Time Budget Selector */}
        <div className="input-group">
          <label className="input-label">
            <Clock size={16} />
            <span>Available Learning Time</span>
          </label>
          <div className="pill-group">
            {[
              { val: 5, label: "5 Mins (Quick)" },
              { val: 20, label: "20 Mins (Standard)" },
              { val: 60, label: "60 Mins (Deep Dive)" },
              { val: 10080, label: "7-Day Study Plan" },
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

        {/* Learner Level */}
        <div className="input-group">
          <label className="input-label">
            <GraduationCap size={16} />
            <span>Learner Level</span>
          </label>
          <div className="pill-group">
            {[
              { val: "beginner", label: "Beginner (Visual & Intuitive)" },
              { val: "intermediate", label: "Intermediate" },
              { val: "advanced", label: "Advanced (Rigorous)" },
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
            <span>Teaching Language</span>
          </label>
          <div className="pill-group">
            {[
              { val: "en", label: "English" },
              { val: "hi", label: "Hindi (हिंदी)" },
              { val: "hinglish", label: "Hinglish (Mix)" },
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
          <span>{isLoading ? "Generating Adaptive Lesson Plan..." : `Start Session with ${selectedTeacher?.name || "Dr. Maya"}`}</span>
        </button>
      </form>
    </div>
  );
}
