import React from "react";
import {
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { getProgressAnalytics } from "../../utils/learningHistory";
import "./Views.css";

export default function ProgressView({ searchHistory = [], onResumeTopic, onNavigateTab }) {
  const analytics = getProgressAnalytics(searchHistory);

  return (
    <div className="view-page-container">
      {/* Hero Header */}
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Learning Progress & Topic Mastery</h1>
          <p>
            Real-time mastery metrics and subject distribution synthesized directly from your past search inquiries.
          </p>
        </div>
        <div className="view-hero-actions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#FFF4E5",
              color: "#B45309",
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Flame size={16} color="#F59E0B" />
            <span>{analytics.currentStreakDays} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="progress-stats-overview">
        <div className="stat-metric-card">
          <span className="metric-label">Topics Explored</span>
          <span className="metric-value">{analytics.totalTopics}</span>
          <span className="metric-caption">
            {analytics.completedTopics} fully mastered from search
          </span>
        </div>

        <div className="stat-metric-card">
          <span className="metric-label">Total Study Time</span>
          <span className="metric-value">{analytics.totalStudyHours}h</span>
          <span className="metric-caption">
            Across {analytics.totalStudyMinutes} learning minutes
          </span>
        </div>

        <div className="stat-metric-card">
          <span className="metric-label">Average Mastery</span>
          <span className="metric-value">{analytics.avgMastery}%</span>
          <span className="metric-caption">Based on interactive checkpoints</span>
        </div>

        <div className="stat-metric-card">
          <span className="metric-label">Recent Focus</span>
          <span
            className="metric-value"
            style={{ fontSize: 20, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            title={analytics.topTopic}
          >
            {analytics.topTopic}
          </span>
          <span className="metric-caption">Last practiced topic</span>
        </div>
      </div>

      {/* Two Column Layout: Subject Breakdown & AI Insights */}
      <div className="progress-two-col-grid">
        {/* Subject Category Breakdown */}
        <div className="progress-section-card">
          <h2>Subject Distribution from Past Searches</h2>
          {analytics.categoryBreakdown.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              No search history available yet to calculate subject distribution.
            </p>
          ) : (
            analytics.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="category-bar-row">
                <div className="category-bar-header">
                  <span>{cat.name}</span>
                  <span>{cat.count} topic{cat.count > 1 ? "s" : ""} ({cat.percentage}%)</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Pedagogical Recommendations */}
        <div className="progress-section-card">
          <h2>Adaptive Recommendations</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--color-soft-blue)",
                borderRadius: 12,
                border: "1px solid rgba(79, 99, 200, 0.15)",
              }}
            >
              <h4 style={{ margin: "0 0 4px 0", fontSize: 14, color: "var(--color-primary-dark)" }}>
                Reinforce Foundational Inverses
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                You demonstrated 85% mastery in Linear Equations. Taking a quick 3-minute assessment will solidify variable isolation memory.
              </p>
            </div>

            <div
              style={{
                padding: "14px 16px",
                background: "#F8FAFC",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
              }}
            >
              <h4 style={{ margin: "0 0 4px 0", fontSize: 14, color: "var(--color-text-primary)" }}>
                Explore Next Curriculum Node
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                Based on your Java OOP search, the natural next step is <strong>Abstract Classes & Interface Contracts</strong>.
              </p>
            </div>

            <button
              type="button"
              className="resume-lesson-btn"
              style={{ marginTop: 6 }}
              onClick={() => onNavigateTab("assessments")}
            >
              <Award size={14} />
              <span>Take Recommended Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complete Topic Mastery Matrix */}
      <div className="progress-section-card">
        <h2>Past Searches Mastery Matrix</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>TOPIC</th>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>EDUCATOR</th>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>MASTERY</th>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {searchHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #F0F2F5" }}>
                  <td style={{ padding: "14px 8px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {item.topic}
                  </td>
                  <td style={{ padding: "14px 8px", color: "var(--color-text-secondary)" }}>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td style={{ padding: "14px 8px", color: "var(--color-text-secondary)" }}>
                    {item.teacherName}
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#EAECEF", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${item.masteryScore}%`,
                            height: "100%",
                            background: "var(--color-primary)",
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.masteryScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <span className={`status-tag ${item.completed ? "completed" : "in-progress"}`}>
                      {item.completed ? "Mastered" : "In Progress"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <button
                      type="button"
                      className="action-icon-btn"
                      onClick={() => onResumeTopic(item)}
                      title="Resume lesson"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
