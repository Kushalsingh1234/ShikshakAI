import React from "react";
import { Settings, User, Volume2, Globe, Trash2, CheckCircle2 } from "lucide-react";
import { clearSearchHistory } from "../../utils/learningHistory";
import { TEACHERS } from "../../constants/teachers";
import "./Views.css";

export default function SettingsView({
  selectedTeacher,
  onSelectTeacher,
  onRefreshHistory,
}) {
  const handleClearHistory = () => {
    if (confirm("Reset all search history, downloaded materials cache, and progress metrics?")) {
      clearSearchHistory();
      if (onRefreshHistory) onRefreshHistory();
      alert("Search history and analytics reset.");
    }
  };

  return (
    <div className="view-page-container">
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Account & Learning Settings</h1>
          <p>Configure your AI educator preferences, voice engine, and study privacy.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Profile Card */}
        <div className="progress-section-card">
          <h2>Student Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              AP
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>Aarav Patel</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                Student • Adaptive AI Learning Track
              </p>
            </div>
          </div>
        </div>

        {/* Preferred Educator */}
        <div className="progress-section-card">
          <h2>Default AI Educator</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {TEACHERS.map((teacher) => {
              const isSelected = selectedTeacher?.id === teacher.id;
              return (
                <div
                  key={teacher.id}
                  onClick={() => onSelectTeacher && onSelectTeacher(teacher)}
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-card)",
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: isSelected ? "var(--color-soft-blue)" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{teacher.name}</h4>
                    {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {teacher.subject} • {teacher.teaching_style}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search History & Data Management */}
        <div className="progress-section-card">
          <h2>Data & History Management</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 16px 0" }}>
            Search history powers your personalized materials downloads, progress curves, and dynamically generated assessments.
          </p>
          <button
            type="button"
            className="chip-btn"
            style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
            onClick={handleClearHistory}
          >
            <Trash2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Clear All Search & Learning History
          </button>
        </div>
      </div>
    </div>
  );
}
