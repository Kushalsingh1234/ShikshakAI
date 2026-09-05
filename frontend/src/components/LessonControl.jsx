import React, { useState } from "react";
import { Play, UploadCloud, Clock, GraduationCap, Languages, FileText, UserCheck, Sparkles, Check } from "lucide-react";
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
    { label: "⚡ Ohm's Law", val: "Ohm's Law", teacherId: "dr-maya" },
    { label: "💻 Binary Search", val: "Binary Search & Recursion", teacherId: "prof-alex" },
    { label: "🪐 Newton's Laws", val: "Newton's Laws of Motion", teacherId: "dr-maya" },
    { label: "📖 कबीर के दोहे", val: "कबीर के दोहे एवं उनका जीवन दर्शन", teacherId: "ananya", lang: "hi" },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setUploadedFileName(res.filename);
      if (!topic.trim()) {
        setTopic(res.suggested_topic || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    } catch (err) {
      console.warn("Upload fallback notice:", err);
      setUploadedFileName(file.name);
      if (!topic.trim()) {
        setTopic(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
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
      language: language,
      teacher: selectedTeacher,
      uploaded_filename: uploadedFileName || null,
    });
  };

  return (
    <div className="setup-panel">
      <div className="setup-header">
        <div>
          <h3 className="setup-title">Classroom Configuration</h3>
          <p className="setup-subtitle">Customize your virtual teacher and lesson structure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="setup-form">
        {/* Teacher Selection Row */}
        <div className="form-section">
          <label className="section-label">
            <span>AI Educator Persona</span>
          </label>
          <div className="educator-grid">
            {TEACHERS.map((teacher) => {
              const isSelected = selectedTeacher?.id === teacher.id;
              return (
                <button
                  type="button"
                  key={teacher.id}
                  className={`educator-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectTeacher && onSelectTeacher(teacher)}
                >
                  <div className="educator-avatar-badge" style={{ background: teacher.accentColor }}>
                    <span>{teacher.name.charAt(0)}</span>
                  </div>
                  <div className="educator-info">
                    <span className="educator-name">{teacher.name}</span>
                    <span className="educator-role">{teacher.specialty}</span>
                  </div>
                  {isSelected && <Check size={16} className="check-indicator" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input & Presets */}
        <div className="form-section">
          <label className="section-label" htmlFor="topic-input">
            <span>Topic or Concept to Learn</span>
          </label>
          <div className="topic-input-wrapper">
            <input
              id="topic-input"
              type="text"
              className="styled-text-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quantum Computing, Photosynthesis, React Hooks"
              required
            />
          </div>
          <div className="preset-chips-container">
            <span className="presets-label">Popular:</span>
            {topicPresets.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                className="preset-chip-btn"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Notes / Textbook */}
        <div className="form-section">
          <label className="section-label">
            <span>Grounding Material (Optional)</span>
          </label>
          <div className="upload-dropzone">
            <UploadCloud size={20} className="upload-icon" />
            <div className="dropzone-text">
              <span className="dropzone-primary">
                {isUploading
                  ? "Uploading & parsing document..."
                  : uploadedFileName
                  ? `Attached: ${uploadedFileName}`
                  : "Upload notes, textbook, or research paper"}
              </span>
              <span className="dropzone-secondary">Supported: PDF, DOCX, PPTX, TXT, MD, CSV</span>
            </div>
            <label className="browse-files-btn">
              <span>Browse</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.markdown,.csv,.json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Segmented Controls Row: Time & Level & Language */}
        <div className="segmented-controls-grid">
          {/* Duration Selector */}
          <div className="segmented-group">
            <label className="section-label">Duration</label>
            <div className="segmented-control">
              {[
                { val: 5, label: "5m" },
                { val: 20, label: "20m" },
                { val: 60, label: "60m" },
                { val: 10080, label: "7-Day" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.val}
                  className={`segment-btn ${duration === t.val ? "active" : ""}`}
                  onClick={() => setDuration(t.val)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div className="segmented-group">
            <label className="section-label">Depth Level</label>
            <div className="segmented-control">
              {[
                { val: "beginner", label: "Beginner" },
                { val: "intermediate", label: "Medium" },
                { val: "advanced", label: "Advanced" },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.val}
                  className={`segment-btn ${learnerLevel === lvl.val ? "active" : ""}`}
                  onClick={() => setLearnerLevel(lvl.val)}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="segmented-group">
            <label className="section-label">Language</label>
            <div className="segmented-control">
              {[
                { val: "en", label: "English" },
                { val: "hi", label: "हिंदी" },
                { val: "hinglish", label: "Hinglish" },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.val}
                  className={`segment-btn ${language === lang.val ? "active" : ""}`}
                  onClick={() => setLanguage(lang.val)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="launch-lesson-btn" disabled={isLoading}>
          <Play size={16} fill="currentColor" />
          <span>{isLoading ? "Generating Personalized Curriculum..." : `Launch Lesson with ${selectedTeacher?.name || "Dr. Maya"}`}</span>
        </button>
      </form>
    </div>
  );
}
