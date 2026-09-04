import React from "react";
import { HelpCircle, ChevronDown, Menu, CheckCircle2 } from "lucide-react";

export default function TopHeader({
  backendStatus = "online",
  studentScore = { correct: 0, total: 0 },
  onOpenReport,
  onToggleMobileSidebar,
  onGoLanding,
}) {
  return (
    <header className="top-header" role="banner">
      {/* Left: Mobile Drawer Trigger & Optional Context */}
      <div className="top-header-left">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>
        <span className="header-workspace-label">Workspace</span>
      </div>

      {/* Right: Authoritative Single Online Status & User Profile */}
      <div className="top-header-right">
        {/* Single Online Status Indicator */}
        <div className="header-online-status" title="AI Educator Online & Ready">
          <span className={`status-dot ${backendStatus === "online" ? "online" : "ready"}`} />
          <span className="status-label">
            {backendStatus === "online" ? "AI Educator Online" : "AI Educator Ready"}
          </span>
        </div>

        {/* Optional Student Analytics Pill */}
        {studentScore.total > 0 && (
          <button
            type="button"
            className="score-action-btn"
            onClick={onOpenReport}
            title="View Student Learning Analytics"
          >
            <CheckCircle2 size={15} />
            <span>Score: {studentScore.correct}/{studentScore.total}</span>
          </button>
        )}

        {/* Help Center */}
        <button
          type="button"
          className="header-icon-btn"
          title="Help & Pedagogical Guide"
          onClick={() => alert("ShikshakAI: Enter any topic (e.g. 'OOP in Python', 'Calculus', 'Photosynthesis') and our adaptive engine teaches it with interactive concept checkpoints!")}
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>

        <div className="header-divider-v" />

        {/* User Profile Dropdown */}
        <div className="header-user-dropdown" role="button" tabIndex={0} aria-label="User profile">
          <div className="header-avatar-circle">
            <span>A</span>
          </div>
          <span className="header-user-name">Aarav Patel</span>
          <ChevronDown size={14} className="header-chevron" />
        </div>
      </div>
    </header>
  );
}
