import React from "react";
import { Calendar, Clock, CheckCircle2, Play, Sparkles } from "lucide-react";
import "./Views.css";

export default function ScheduleView({ searchHistory = [], onResumeTopic }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="view-page-container">
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Adaptive Study Roadmap & Weekly Timetable</h1>
          <p>AI-scheduled spaced repetition sessions mapped to topics from your search and mastery history.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {days.map((day, idx) => {
          const matchedTopic = searchHistory[idx % searchHistory.length];
          const isToday = idx === 0;

          return (
            <div
              key={day}
              style={{
                background: "var(--color-surface)",
                border: isToday ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                padding: "20px",
                boxShadow: "var(--shadow-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: isToday ? "var(--color-primary)" : "inherit" }}>
                  {day}
                </span>
                {isToday && (
                  <span style={{ fontSize: 11, background: "var(--color-soft-blue)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                    TODAY
                  </span>
                )}
              </div>

              {matchedTopic ? (
                <div>
                  <span className="category-tag">{matchedTopic.category}</span>
                  <h4 style={{ margin: "8px 0 6px 0", fontSize: 15, fontWeight: 600 }}>{matchedTopic.topic}</h4>
                  <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                    Spaced repetition revision session • 20 mins
                  </p>
                  <button
                    type="button"
                    className="resume-lesson-btn"
                    style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 12px" }}
                    onClick={() => onResumeTopic(matchedTopic)}
                  >
                    <Play size={12} />
                    <span>Practice Now</span>
                  </button>
                </div>
              ) : (
                <div style={{ color: "var(--color-text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
                  Free study block
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
