import React from "react";
import {
  Home,
  BookOpen,
  GraduationCap,
  FolderOpen,
  TrendingUp,
  ClipboardCheck,
  Sparkles,
  Calendar,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";

export default function AppSidebar({ activeTab = "home", onSelectTab, onGoLanding }) {
  const primaryNav = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "learning", label: "My Learning", icon: BookOpen },
    { id: "lessons", label: "Lessons", icon: GraduationCap },
    { id: "materials", label: "Materials", icon: FolderOpen },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "assessments", label: "Assessments", icon: ClipboardCheck },
  ];

  const toolsNav = [
    { id: "tutor", label: "AI Tutor", icon: Sparkles },
    { id: "planner", label: "Schedule", icon: Calendar },
  ];

  return (
    <aside className="app-sidebar" aria-label="Application Navigation">
      {/* Decorative Outer Left Spine */}
      <div className="sidebar-spine" aria-hidden="true" />

      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <button
          type="button"
          className="sidebar-brand-btn"
          onClick={onGoLanding}
          title="Back to Landing Page"
        >
          <div className="brand-logo-mark">
            <Bot size={22} />
          </div>
          <div className="brand-meta">
            <span className="brand-title">ShikshakAI</span>
            <span className="brand-descriptor">Adaptive AI Learning</span>
          </div>
        </button>
      </div>

      {/* Primary Workspace Navigation */}
      <div className="sidebar-nav-section">
        <nav className="sidebar-nav-list" role="navigation">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? "is-active" : ""}`}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className="sidebar-item-icon" />
                <span className="sidebar-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-divider" />

      {/* Tools Section */}
      <div className="sidebar-nav-section">
        <nav className="sidebar-nav-list" role="navigation">
          {toolsNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? "is-active" : ""}`}
                onClick={() => onSelectTab && onSelectTab(item.id)}
              >
                <Icon size={18} className="sidebar-item-icon" />
                <span className="sidebar-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-divider" />

      {/* Settings Section */}
      <div className="sidebar-nav-section">
        <nav className="sidebar-nav-list" role="navigation">
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "settings" ? "is-active" : ""}`}
            onClick={() => onSelectTab && onSelectTab("settings")}
          >
            <Settings size={18} className="sidebar-item-icon" />
            <span className="sidebar-item-label">Settings</span>
          </button>
        </nav>
      </div>

      {/* Spacer pushing bottom actions to end */}
      <div className="sidebar-spacer" />

      {/* Bottom Section: Profile & Logout */}
      <div className="sidebar-bottom-actions">
        <button
          type="button"
          className="sidebar-logout-btn-full"
          title="Sign out"
          onClick={() => alert("Signed in as Aarav Patel (Student Demo Account)")}
        >
          <LogOut size={17} className="logout-icon" />
          <span>Log out</span>
        </button>

        <div className="sidebar-user-badge">
          <div className="user-avatar-pill">
            <span>AP</span>
          </div>
          <div className="user-details">
            <span className="user-name">Aarav Patel</span>
            <span className="user-role">Student</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

