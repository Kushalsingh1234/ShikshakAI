import React from "react";
import PageHeader from "./PageHeader";
import LessonConfigurator from "./LessonConfigurator";
import EducatorPreview from "./EducatorPreview";
import AICapabilities from "./AICapabilities";

export default function HomeWorkspace({
  onStartLesson,
  isLoading,
  selectedTeacher,
  onSelectTeacher,
  topic,
  setTopic,
  onNavigateTab,
}) {
  return (
    <div className="home-workspace-container">
      {/* Compact Page Header with Breadcrumb, Title & Subtitle */}
      <PageHeader />

      {/* Main 65% / 35% Layout */}
      <div className="workspace-main-grid">
        {/* Left Column (~65%): Lesson Configuration */}
        <div className="workspace-left-column">
          <LessonConfigurator
            onStartLesson={onStartLesson}
            isLoading={isLoading}
            selectedTeacher={selectedTeacher}
            onSelectTeacher={onSelectTeacher}
            topic={topic}
            setTopic={setTopic}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* Right Column (~35%): AI Educator Preview & How your lesson adapts */}
        <aside className="workspace-right-column">
          <EducatorPreview
            selectedTeacher={selectedTeacher}
          />
          <AICapabilities />
        </aside>
      </div>
    </div>
  );
}
