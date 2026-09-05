import React, { useState } from "react";
import { Sparkles, Send, Bot, User, Play, MessageSquare } from "lucide-react";
import "./Views.css";

export default function AITutorView({
  selectedTeacher = { name: "Dr. Maya", role: "AI Professor" },
  searchHistory = [],
  onStartLesson,
}) {
  const [messages, setMessages] = useState([
    {
      id: "m_welcome",
      sender: "teacher",
      text: `Hello Aarav! I'm ${selectedTeacher.name}. I'm ready to answer any questions or clarify concepts from your past searches and lessons. What would you like to explore?`,
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const pastChips = searchHistory.slice(0, 4).map((h) => `Explain ${h.topic} simply`);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = {
      id: `m_user_${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      time: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.trim();
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = `That's a great question about ${query}! The core concept relies on isolating fundamental variables, observing conservation rules, and systematically checking edge cases.`;
      if (/linear|equation|algebra/i.test(query)) {
        reply = "In linear equations (like ax + b = c), always apply inverse operations: subtract constants first, then divide by coefficients to isolate x.";
      } else if (/java|oop|class|inheritance/i.test(query)) {
        reply = "In Java OOP, inheritance is achieved via the 'extends' keyword, allowing subclasses to reuse methods and invoke parent constructors using 'super()'.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m_ai_${Date.now()}`,
          sender: "teacher",
          text: reply,
          time: "Just now",
          canLaunchLesson: true,
          topicToLaunch: query,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="view-page-container">
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Direct AI Tutor Desk • {selectedTeacher.name}</h1>
          <p>Instant 1-on-1 pedagogical dialogue, mathematical problem breakdown, and conceptual intuition.</p>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          display: "flex",
          flexDirection: "column",
          height: "65vh",
          boxShadow: "var(--shadow-subtle)",
          overflow: "hidden",
        }}
      >
        {/* Chat Feed */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                gap: 12,
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
              }}
            >
              {m.sender === "teacher" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "var(--color-soft-blue)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={18} />
                </div>
              )}
              <div>
                <div
                  style={{
                    background: m.sender === "user" ? "var(--color-primary)" : "#F3F4F6",
                    color: m.sender === "user" ? "#FFFFFF" : "var(--color-text-primary)",
                    padding: "12px 16px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
                {m.canLaunchLesson && (
                  <button
                    type="button"
                    className="resume-lesson-btn"
                    style={{ marginTop: 8, fontSize: 12, padding: "5px 12px" }}
                    onClick={() => onStartLesson({ topic: m.topicToLaunch })}
                  >
                    <Play size={12} />
                    <span>Launch Full Video Lesson on this</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
              <Bot size={18} />
              <span>{selectedTeacher.name} is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {pastChips.length > 0 && (
          <div style={{ display: "flex", gap: 8, padding: "8px 20px", background: "#FAFBFD", borderTop: "1px solid var(--color-border)", overflowX: "auto" }}>
            {pastChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                className="chip-btn"
                style={{ fontSize: 12, padding: "5px 12px", whiteSpace: "nowrap" }}
                onClick={() => {
                  setInputText(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            gap: 12,
            background: "#FFFFFF",
          }}
        >
          <input
            type="text"
            style={{
              flex: 1,
              height: 44,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-input)",
              padding: "0 16px",
              fontSize: 14,
              outline: "none",
            }}
            placeholder={`Ask ${selectedTeacher.name} anything...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            type="button"
            className="resume-lesson-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{ padding: "0 20px" }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
