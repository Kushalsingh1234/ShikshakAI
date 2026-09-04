import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import TopHeader from "./TopHeader";
import "./HomeWorkspace.css";

export default function AppShell({
  children,
  activeNav = "home",
  onSelectNav,
  backendStatus = "online",
  studentScore,
  onOpenReport,
  onGoLanding,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell-root">
      {/* Fixed Left Sidebar */}
      <div className={`sidebar-wrapper ${isMobileSidebarOpen ? "is-open" : ""}`}>
        <AppSidebar
          activeTab={activeNav}
          onSelectTab={(tabId) => {
            setIsMobileSidebarOpen(false);
            if (onSelectNav) onSelectNav(tabId);
          }}
          onGoLanding={onGoLanding}
        />
        {/* Mobile backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Main Viewport */}
      <div className="app-main-viewport">
        <TopHeader
          backendStatus={backendStatus}
          studentScore={studentScore}
          onOpenReport={onOpenReport}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onGoLanding={onGoLanding}
        />
        <main className="app-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}


