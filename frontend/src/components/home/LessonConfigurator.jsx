import React, { useState } from "react";
import {
  Check,
  UploadCloud,
  FileText,
  X,
  Play,
  Clock,
  GraduationCap,
  Languages,
  Loader2,
  Sparkles,
  Atom,
  Code,
  BookOpen,
} from "lucide-react";
import { uploadDocument } from "../../services/api";
import { TEACHERS } from "../../constants/teachers";

export default function LessonConfigurator({
  onStartLesson,
  isLoading,
  selectedTeacher = TEACHERS[0],
  onSelectTeacher,
  topic = "",
  setTopic,
}) {
  const [learnerLevel, setLearnerLevel] = useState("beginner");
  const [duration, setDuration] = useState(20);
  const [language, setLanguage] = useState("en");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const durations = [
    { val: 5, label: "5 min" },
    { val: 20, label: "20 min" },
    { val: 60, label: "60 min" },
    { val: 10080, label: "7 days" },
  ];

  const levels = [
    { val: "beginner", label: "Beginner" },
    { val: "intermediate", label: "Intermediate" },
    { val: "advanced", label: "Advanced" },
  ];

  const languages = [
    { val: "en", label: "English" },
    { val: "hi", label: "हिंदी" },
    { val: "hinglish", label: "Hinglish" },
  ];

  const processFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.name.split(".").pop()?.toUpperCase() || "DOC",
        serverFilename: res.filename,
      });
      if (!topic.trim()) {
        const suggested = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        if (suggested.trim()) setTopic(suggested);
      }
    } catch (err) {
      alert("Failed to upload document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTopic = topic.trim() || "Core Concepts & Fundamentals";
    onStartLesson({
      topic: finalTopic,
      learner_level: learnerLevel,
      target_duration_minutes: duration,
      language: language,
      teacher: selectedTeacher,
      uploaded_filename: uploadedFile?.serverFilename || null,
    });
  };

  return (
    <section className="lesson-configurator-card" aria-label="Lesson Configuration">
      <form onSubmit={handleSubmit} className="configurator-form">
        {/* ============================================================
            1. WHAT WOULD YOU LIKE TO LEARN? (COMPACT SEARCH BAR)
            ============================================================ */}
        <div className="config-form-section">
          <label className="section-label" htmlFor="lesson-topic-input">
            What would you like to learn?
          </label>

          <div className="compact-searchbar-wrapper">
            <div className="compact-searchbar-icon">
              <Sparkles size={15} />
            </div>
            <input
              id="lesson-topic-input"
              type="text"
              className="compact-searchbar-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ask a question, enter a concept, or skill..."
              autoFocus
            />
            {topic && (
              <button
                type="button"
                className="compact-clear-btn"
                onClick={() => setTopic("")}
                title="Clear input"
                aria-label="Clear input"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================
            2. ADD LEARNING MATERIAL (COMPACT UPLOAD ROW)
            ============================================================ */}
        <div className="config-form-section">
          <label className="section-label">Add learning material</label>

          {!uploadedFile ? (
            <div
              className={`sleek-upload-box ${isDragOver ? "is-drag-over" : ""} ${
                isUploading ? "is-uploading" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="sleek-upload-row">
                <div className="sleek-upload-icon">
                  {isUploading ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <UploadCloud size={16} />
                  )}
                </div>
                <div className="sleek-upload-text">
                  <span className="sleek-main-text">
                    {isUploading ? "Uploading context..." : "Upload notes, PDF, DOCX, or slides"}
                  </span>
                  <span className="sleek-sub-text">Optional grounding material</span>
                </div>
                <label className="sleek-browse-btn">
                  <span>Browse</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={handleFileInput}
                    disabled={isUploading}
                    className="visually-hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="compact-file-pill">
              <div className="file-info-inline">
                <FileText size={15} className="file-icon-accent" />
                <span className="file-name-truncated">{uploadedFile.name}</span>
                <span className="file-size-badge">{uploadedFile.size}</span>
              </div>
              <button
                type="button"
                className="compact-remove-btn"
                onClick={handleRemoveFile}
                title="Remove file"
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ============================================================
            3. DURATION, LEARNING LEVEL & LANGUAGE (ABOVE AI EDUCATORS)
            ============================================================ */}
        <div className="config-form-section">
          <div className="compact-settings-grid">
            {/* Duration */}
            <div className="compact-setting-cell">
              <label className="compact-setting-label">
                <Clock size={13} />
                <span>Duration</span>
              </label>
              <div className="compact-pill-selector" role="group" aria-label="Duration">
                {durations.map((d) => (
                  <button
                    type="button"
                    key={d.val}
                    className={`compact-choice-btn ${duration === d.val ? "is-selected" : ""}`}
                    onClick={() => setDuration(d.val)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning level */}
            <div className="compact-setting-cell">
              <label className="compact-setting-label">
                <GraduationCap size={13} />
                <span>Learning level</span>
              </label>
              <div className="compact-pill-selector" role="group" aria-label="Learning level">
                {levels.map((lvl) => (
                  <button
                    type="button"
                    key={lvl.val}
                    className={`compact-choice-btn ${learnerLevel === lvl.val ? "is-selected" : ""}`}
                    onClick={() => setLearnerLevel(lvl.val)}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="compact-setting-cell">
              <label className="compact-setting-label">
                <Languages size={13} />
                <span>Language</span>
              </label>
              <div className="compact-pill-selector" role="group" aria-label="Language">
                {languages.map((lng) => (
                  <button
                    type="button"
                    key={lng.val}
                    className={`compact-choice-btn ${language === lng.val ? "is-selected" : ""}`}
                    onClick={() => setLanguage(lng.val)}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            4. CHOOSE YOUR AI EDUCATOR (BELOW SETTINGS)
            ============================================================ */}
        <div className="config-form-section">
          <label className="section-label">Choose your AI educator</label>

          <div className="educator-attractive-grid" role="radiogroup" aria-label="Choose your AI educator">
            {TEACHERS.map((teacher) => {
              const isSelected = selectedTeacher?.id === teacher.id;
              const isMaya = teacher.id === "dr-maya";
              const isAlex = teacher.id === "prof-alex";
              const isAnanya = teacher.id === "ananya";

              return (
                <button
                  type="button"
                  key={teacher.id}
                  role="radio"
                  aria-checked={isSelected}
                  className={`educator-attractive-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectTeacher && onSelectTeacher(teacher)}
                >
                  <div className="attractive-card-top">
                    <div className={`educator-domain-icon ${teacher.id}`}>
                      {isMaya && <Atom size={16} />}
                      {isAlex && <Code size={16} />}
                      {isAnanya && <BookOpen size={16} />}
                    </div>
                    {isSelected && (
                      <div className="selection-active-badge" aria-hidden="true">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="attractive-card-body">
                    <span className="educator-card-name">{teacher.name}</span>
                    <span className="educator-card-specialty">{teacher.specialty}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            5. START LESSON CTA (PRIMARY ACTION)
            ============================================================ */}
        <div className="start-cta-section">
          <button
            type="submit"
            className="start-lesson-primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Generating Lesson Plan...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>Start Lesson</span>
              </>
            )}
          </button>
          <p className="start-cta-subtext">
            Your educator will adapt explanations and questions to your level.
          </p>
        </div>
      </form>
    </section>
  );
}
