import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  User,
  Trash2,
  FileDown,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { removeSearchHistoryItem, clearSearchHistory } from "../../utils/learningHistory";
import "./Views.css";

export default function MyLearningView({
  searchHistory = [],
  onRefreshHistory,
  onResumeTopic,
  onNavigateTab,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mathematics", "Computer Science", "Physics", "Chemistry", "Biology"];

  const filteredHistory = searchHistory.filter((item) => {
    const matchesQuery =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Remove this topic from your search & learning history?")) {
      removeSearchHistoryItem(id);
      if (onRefreshHistory) onRefreshHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear your entire search and learning history?")) {
      clearSearchHistory();
      if (onRefreshHistory) onRefreshHistory();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="view-page-container">
      {/* Hero Header */}
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>My Learning & Search History</h1>
          <p>
            Review all topics you've explored, resume adaptive lessons, and track mastery progress.
          </p>
        </div>
        <div className="view-hero-actions">
          {searchHistory.length > 0 && (
            <button
              type="button"
              className="chip-btn"
              onClick={handleClearAll}
              title="Clear all saved search history"
            >
              <Trash2 size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Clear History
            </button>
          )}
          <button
            type="button"
            className="resume-lesson-btn"
            onClick={() => onNavigateTab("home")}
          >
            <Sparkles size={14} />
            <span>Search New Topic</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="view-search-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search past topics, formulas, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip-btn ${selectedCategory === cat ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History Cards Grid */}
      {filteredHistory.length === 0 ? (
        <div className="view-hero-header" style={{ flexDirection: "column", textAlign: "center", padding: "40px" }}>
          <BookOpen size={40} color="var(--color-primary)" style={{ opacity: 0.8, marginBottom: 10 }} />
          <h3>No search history found</h3>
          <p>Search any concept or formula from the Dashboard to start learning!</p>
          <button
            type="button"
            className="resume-lesson-btn"
            style={{ marginTop: 14 }}
            onClick={() => onNavigateTab("home")}
          >
            Go to Dashboard & Search
          </button>
        </div>
      ) : (
        <div className="history-cards-grid">
          {filteredHistory.map((item) => (
            <article key={item.id} className="history-card">
              <div>
                <div className="history-card-header">
                  <div className="history-topic-tag-wrap">
                    <span className="category-tag">{item.category}</span>
                    <span className={`status-tag ${item.completed ? "completed" : "in-progress"}`}>
                      {item.completed ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Mastered</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>In Progress</span>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Remove from history"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h2 className="history-topic-title">{item.topic}</h2>
                <p className="history-topic-summary">{item.summary}</p>

                <div className="history-meta-bar">
                  <span>
                    <User size={13} /> {item.teacherName || "Dr. Maya"}
                  </span>
                  <span>
                    <Clock size={13} /> {item.durationMinutes || 20} min
                  </span>
                  <span>{formatDate(item.date)}</span>
                </div>

                <div className="history-progress-wrap">
                  <div className="progress-label-row">
                    <span>Mastery Progress</span>
                    <span>{item.masteryScore}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${item.masteryScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="history-card-footer">
                <button
                  type="button"
                  className="resume-lesson-btn"
                  onClick={() => onResumeTopic(item)}
                  title="Resume or review this lesson with your AI teacher"
                >
                  <Play size={13} />
                  <span>Resume Lesson</span>
                </button>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => onNavigateTab("materials")}
                    title="Download Notes & Materials"
                  >
                    <FileDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => onNavigateTab("assessments")}
                    title="Take Assessment on this topic"
                  >
                    <Award size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
