import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle, Video, ArrowLeft } from "lucide-react";
import { askTeacherQuestion, fetchExplanationScript, generateTTS } from "../../services/api";
import AIExplanationPlayer from "./explainer/AIExplanationPlayer";

export default function AskTeacherModal({
  isOpen,
  onClose,
  topic = "Linear Equations",
  currentSceneTitle = "Step-by-Step Demonstration",
  currentVisualContent = "",
  teacherName = "Dr. Maya",
  language = "en",
}) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeExplainerScript, setActiveExplainerScript] = useState(null);
  const [activeExplainerAudio, setActiveExplainerAudio] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "teacher",
      text: `Hello! I am ${teacherName}. I am right here with you on "${currentSceneTitle}". What would you like to clarify?`,
    },
  ]);

  if (!isOpen) return null;

  const handleLaunchVideoExplanation = async (text) => {
    setIsGeneratingVideo(true);
    try {
      const [scriptData, audioUrl] = await Promise.all([
        fetchExplanationScript({
          topic,
          teacher_script: text,
          step_type: "explanation",
          visual_content: currentVisualContent,
          language,
        }),
        generateTTS(text, language, "dr-maya").catch(() => null),
      ]);

      if (scriptData?.scene_script) {
        setActiveExplainerScript(scriptData.scene_script);
        setActiveExplainerAudio(audioUrl);
      }
    } catch (err) {
      console.warn("Could not generate video explanation:", err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || isLoading) return;

    const userMsg = { sender: "student", text: q };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");
    setIsLoading(true);

    try {
      const res = await askTeacherQuestion({
        topic,
        scene_title: currentSceneTitle,
        teacher_name: teacherName,
        current_visual_content: currentVisualContent,
        question: q,
        language,
      });

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: res.answer || "Let us look back at the equation balance to verify.",
          tip: res.suggested_next_step,
        },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: "In this step, remember that whatever operation is performed on one side must be mirrored on the other side to keep the equality true.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="studio-modal-overlay" onClick={onClose}>
      <div className="ask-teacher-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ask-modal-header">
          <div className="ask-header-left">
            <div className="teacher-avatar-badge">
              <Bot size={18} className="text-white" />
            </div>
            <div className="ask-header-text">
              <h4>Ask {teacherName}</h4>
              <span className="ask-context-pill">Context: {currentSceneTitle}</span>
            </div>
          </div>
          <button type="button" className="ask-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* If Active Explainer Video is generated, show AIExplanationPlayer */}
        {activeExplainerScript ? (
          <div className="ask-explainer-view-container" style={{ padding: "16px", height: "480px" }}>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="ask-back-btn"
                onClick={() => setActiveExplainerScript(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#e2e8f0",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Discussion</span>
              </button>
              <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "700" }}>
                🎥 Synced 3B1B Video Explainer
              </span>
            </div>

            <AIExplanationPlayer
              sceneScript={activeExplainerScript}
              audioUrl={activeExplainerAudio}
              topic={topic}
              teacherName={teacherName}
              isPlaying={true}
            />
          </div>
        ) : (
          <>
            {/* Chat History Box */}
            <div className="ask-chat-body">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`ask-msg-bubble ${msg.sender === "student" ? "is-student" : "is-teacher"}`}>
                  <div className="msg-author-tag">
                    {msg.sender === "student" ? "You" : teacherName}
                  </div>
                  <p className="msg-text">{msg.text}</p>
                  {msg.tip && (
                    <div className="msg-tip-box">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>{msg.tip}</span>
                    </div>
                  )}

                  {/* 3B1B Video Explainer Action Button on Teacher Answers */}
                  {msg.sender === "teacher" && idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleLaunchVideoExplanation(msg.text)}
                      disabled={isGeneratingVideo}
                      style={{
                        marginTop: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        background: "rgba(6, 182, 212, 0.18)",
                        border: "1px solid rgba(6, 182, 212, 0.45)",
                        borderRadius: "14px",
                        color: "#38bdf8",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: isGeneratingVideo ? "wait" : "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Video size={13} />
                      <span>{isGeneratingVideo ? "Synthesizing 3D Explainer..." : "Watch 3B1B Video Explainer"}</span>
                    </button>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="ask-msg-bubble is-teacher is-thinking">
                  <div className="thinking-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <span>{teacherName} is reviewing the equation...</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Quick Question Chips */}
        <div className="quick-doubts-row">
          <button
            type="button"
            className="quick-doubt-chip"
            onClick={() => setQuestion("Why did we subtract 4 from both sides?")}
          >
            "Why did we subtract 4?"
          </button>
          <button
            type="button"
            className="quick-doubt-chip"
            onClick={() => setQuestion("Can you explain the balance scale analogy again?")}
          >
            "Explain balance analogy"
          </button>
        </div>

        {/* Input Form */}
        <form className="ask-input-form" onSubmit={handleSendQuestion}>
          <input
            type="text"
            className="ask-text-input"
            placeholder={`Ask a question about ${topic}...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="ask-submit-btn"
            disabled={!question.trim() || isLoading}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
