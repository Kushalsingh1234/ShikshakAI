import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  HelpCircle,
  Video,
  ArrowLeft,
  Minimize2,
  Maximize2,
  Trash2,
  Lightbulb,
  Radio
} from "lucide-react";
import { askTeacherQuestion, fetchExplanationScript, generateTTS } from "../../services/api";
import AIExplanationPlayer from "./explainer/AIExplanationPlayer";

export default function AskDoubtCard({
  topic = "Linear Equations",
  currentSceneTitle = "Step-by-Step Demonstration",
  currentVisualContent = "",
  teacherName = "Dr. Maya",
  language = "en",
  isMinimized = false,
  onToggleMinimize,
  inputRef,
}) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeExplainerScript, setActiveExplainerScript] = useState(null);
  const [activeExplainerAudio, setActiveExplainerAudio] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const chatEndRef = useRef(null);
  const localInputRef = useRef(null);

  const effectiveInputRef = inputRef || localInputRef;

  const [chatHistory, setChatHistory] = useState([
    {
      sender: "teacher",
      text: `Hello! I'm ${teacherName}. I'm right here with you on "${currentSceneTitle}". What doubt or question can I help clarify?`,
    },
  ]);

  // Update initial greeting context if scene changes and only initial message is present
  useEffect(() => {
    setChatHistory((prev) => {
      if (prev.length <= 1) {
        return [
          {
            sender: "teacher",
            text: `Hello! I'm ${teacherName}. I'm right here with you on "${currentSceneTitle}". What doubt or question can I help clarify?`,
          },
        ];
      }
      return prev;
    });
  }, [currentSceneTitle, teacherName]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (!isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading, isMinimized]);

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

  const handleSendQuestion = async (textToSend) => {
    const q = (typeof textToSend === "string" ? textToSend : question).trim();
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
          text: res.answer || "Let us look back at the relation to verify.",
          tip: res.suggested_next_step,
        },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: "In this step, remember that whatever operation is performed on one side must be mirrored on the other side to keep the equation balanced.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        effectiveInputRef.current?.focus();
      }, 100);
    }
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        sender: "teacher",
        text: `Fresh doubt thread started for "${currentSceneTitle}". What would you like to ask?`,
      },
    ]);
    setActiveExplainerScript(null);
  };

  // Dynamic quick doubt chips
  const quickDoubts = [
    "Why this step?",
    "Explain intuition",
    "Can you give an analogy?",
    "How did we isolate x?",
  ];

  if (isMinimized) {
    return (
      <button
        type="button"
        className="ask-doubt-minimized-pill"
        onClick={onToggleMinimize}
        title="Open Live Doubt Assistant"
      >
        <div className="minimized-avatar-dot">
          <Bot size={14} className="text-white" />
          <span className="live-ping-dot" />
        </div>
        <span className="minimized-label">Ask Doubt</span>
        <span className="minimized-teacher-tag">{teacherName.split(" ")[0]}</span>
      </button>
    );
  }

  return (
    <div className="ask-doubt-docked-card">
      {/* 1. Card Header */}
      <div className="ask-doubt-card-header">
        <div className="ask-doubt-header-info">
          <div className="ask-doubt-avatar-ring">
            <Bot size={16} className="text-white" />
            <span className="live-online-pip" />
          </div>
          <div className="ask-doubt-titles">
            <div className="title-row">
              <h4>Ask {teacherName}</h4>
              <span className="ask-doubt-ai-badge">
                <Sparkles size={10} /> LIVE AI
              </span>
            </div>
            <span className="ask-doubt-scene-context" title={currentSceneTitle}>
              {currentSceneTitle}
            </span>
          </div>
        </div>

        <div className="ask-doubt-header-tools">
          <button
            type="button"
            className="card-tool-icon-btn"
            onClick={handleClearChat}
            title="Clear doubt history"
          >
            <Trash2 size={13} />
          </button>
          {onToggleMinimize && (
            <button
              type="button"
              className="card-tool-icon-btn"
              onClick={onToggleMinimize}
              title="Minimize Doubt Panel"
            >
              <Minimize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Embedded Video Explainer (if triggered) OR Chat Body */}
      {activeExplainerScript ? (
        <div className="ask-doubt-video-view">
          <div className="video-view-top-strip">
            <button
              type="button"
              className="video-back-btn"
              onClick={() => setActiveExplainerScript(null)}
            >
              <ArrowLeft size={13} />
              <span>Back to Chat</span>
            </button>
            <span className="video-tag">🎥 3B1B Scene Video</span>
          </div>

          <div className="video-player-embed-wrap">
            <AIExplanationPlayer
              sceneScript={activeExplainerScript}
              audioUrl={activeExplainerAudio}
              topic={topic}
              teacherName={teacherName}
              isPlaying={true}
            />
          </div>
        </div>
      ) : (
        <div className="ask-doubt-chat-scroll">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`ask-doubt-msg-item ${msg.sender === "student" ? "is-student" : "is-teacher"}`}
            >
              <div className="msg-sender-strip">
                <span className="sender-name">
                  {msg.sender === "student" ? "You" : teacherName}
                </span>
                {msg.sender === "teacher" && (
                  <span className="teacher-role-tag">Tutor</span>
                )}
              </div>

              <div className="msg-bubble-content">
                <p>{msg.text}</p>
              </div>

              {msg.tip && (
                <div className="msg-pedagogical-tip">
                  <Lightbulb size={12} className="tip-bulb-icon" />
                  <span>{msg.tip}</span>
                </div>
              )}

              {/* Action Button: Watch 3B1B Synced Video Explainer */}
              {msg.sender === "teacher" && idx > 0 && (
                <button
                  type="button"
                  className="launch-3b1b-btn"
                  onClick={() => handleLaunchVideoExplanation(msg.text)}
                  disabled={isGeneratingVideo}
                  title="Generate dynamic 3Blue1Brown animated video for this doubt"
                >
                  <Video size={12} />
                  <span>
                    {isGeneratingVideo
                      ? "Synthesizing 3D Explainer..."
                      : "Watch 3B1B Video Explainer"}
                  </span>
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="ask-doubt-msg-item is-teacher is-thinking-state">
              <div className="msg-sender-strip">
                <span className="sender-name">{teacherName}</span>
                <span className="thinking-badge">Thinking</span>
              </div>
              <div className="thinking-dots-anim">
                <span className="pulse-circle" />
                <span className="pulse-circle" />
                <span className="pulse-circle" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {/* 3. Quick Doubt Suggestions Row */}
      {!activeExplainerScript && (
        <div className="ask-doubt-chips-bar">
          {quickDoubts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-doubt-pill"
              onClick={() => handleSendQuestion(chip)}
              disabled={isLoading}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* 4. Question Input Bar */}
      {!activeExplainerScript && (
        <form
          className="ask-doubt-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
        >
          <input
            ref={effectiveInputRef}
            type="text"
            className="ask-doubt-input-field"
            placeholder={`Ask ${teacherName.split(" ")[0]} a doubt...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="ask-doubt-send-btn"
            disabled={!question.trim() || isLoading}
            title="Send doubt to AI teacher (Enter)"
          >
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
