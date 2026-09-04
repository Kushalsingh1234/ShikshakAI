import React from "react";

export default function PageHeader() {
  return (
    <div className="compact-page-header">
      <nav className="header-breadcrumb" aria-label="Breadcrumb">
        <span className="crumb-root">Home</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">New Lesson</span>
      </nav>
      <div className="page-header-text">
        <h1 className="page-main-title">Create your lesson</h1>
        <p className="page-main-subtitle">
          Build a personalized learning session with your AI educator.
        </p>
      </div>
    </div>
  );
}
