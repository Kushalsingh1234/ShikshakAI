import React, { useState } from "react";
import EquationRenderer from "./EquationRenderer";
import BalanceBeamRenderer from "./BalanceBeamRenderer";
import DiagramRenderer from "./DiagramRenderer";
import CodeSandboxRenderer from "./CodeSandboxRenderer";
import PhysicsSimRenderer from "./PhysicsSimRenderer";
import BioChemRenderer from "./BioChemRenderer";
import PresentationSlideRenderer from "./PresentationSlideRenderer";
import AIExplanationPlayer from "../explainer/AIExplanationPlayer";
import VisualComponentDispatcher from "./engine/VisualComponentDispatcher";
import { Video, Presentation, Sparkles } from "lucide-react";

export default function VisualRenderer({
  visual,
  topic = "Lesson",
  stepType = "demonstration",
  teacherScript = "",
  sceneScript = null,
  currentScene = null,
  audioUrl = null,
  teacherName = "Dr. Maya",
  isPlaying = false,
  audioCurrentTime = 0,
  audioDuration = 0,
  playbackSpeed = 1,
  onTogglePlay,
  onToggleSpeed,
  onTimeUpdate,
  isAdaptive = false,
}) {
  const [viewMode, setViewMode] = useState("visual_engine"); // "visual_engine" | "explainer" | "classic"

  const hasSceneScript = Boolean(sceneScript && sceneScript.length > 0);
  const activeScene = currentScene || { visual, step_type: stepType, teacher_script: teacherScript, scene_script: sceneScript };

  const renderClassicView = () => {
    const vType = (visual?.type || "").toLowerCase();
    const tLower = (topic || "").toLowerCase();
    const vContent = (visual?.content || "").toLowerCase();

    // 1. Balance Beam Analogy
    if (vType === "balance" || visual?.title?.toLowerCase().includes("balance")) {
      return <BalanceBeamRenderer title={visual?.title} content={visual?.content} />;
    }

    // 2. Equation Step-by-Step
    if (
      vType === "equation" ||
      (vType === "katex" && (tLower.includes("equation") || tLower.includes("algebra") || visual?.content?.includes("=")))
    ) {
      return (
        <EquationRenderer
          title={visual?.title}
          content={visual?.content}
          activeStep={0}
        />
      );
    }

    // 3. Code Sandbox
    if (vType === "code" || /python|java|javascript|c\+\+|dsa|algorithm|function/.test(tLower)) {
      return <CodeSandboxRenderer title={visual?.title} content={visual?.content} />;
    }

    // 4. Physics Simulation
    if (vType === "physics" || /circuit|resistor|ohm|current|voltage/.test(tLower)) {
      return <PhysicsSimRenderer title={visual?.title} content={visual?.content} />;
    }

    // 5. Diagram (Mermaid)
    if (vType === "mermaid" || visual?.content?.includes("graph") || visual?.content?.includes("classDiagram")) {
      return <DiagramRenderer title={visual?.title} content={visual?.content} />;
    }

    // 6. Dedicated Biochemical Pathway Stages
    if (vType === "biochem" || (/(cellular respiration|photosynthesis|krebs|glycolysis|calvin)/.test(tLower) && !vContent.includes("vs"))) {
      return <BioChemRenderer title={visual?.title} content={visual?.content} />;
    }

    // 7. Executive 3D Presentation Slide Deck Renderer
    return (
      <PresentationSlideRenderer
        title={visual?.title}
        content={visual?.content}
        topic={topic}
        stepType={stepType}
        teacherScript={teacherScript}
        isPlaying={isPlaying}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        playbackSpeed={playbackSpeed}
      />
    );
  };

  return (
    <div className="explainer-mode-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Floating Viewport Mode Switcher */}
      <div
        className="explainer-mode-switcher-bar"
        style={{
          position: "absolute",
          top: "12px",
          right: "16px",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(10, 16, 32, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "4px 6px",
          borderRadius: "20px",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        <button
          type="button"
          className={`mode-switch-btn ${viewMode === "visual_engine" ? "is-active" : ""}`}
          onClick={() => setViewMode("visual_engine")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            border: "none",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: viewMode === "visual_engine" ? "rgba(56, 189, 248, 0.25)" : "transparent",
            color: viewMode === "visual_engine" ? "#38bdf8" : "#94a3b8",
          }}
          title="First-Class Motion-Designed Visual Answer Engine"
        >
          <Sparkles size={12} />
          <span>Visual Engine</span>
        </button>

        {hasSceneScript && (
          <button
            type="button"
            className={`mode-switch-btn ${viewMode === "explainer" ? "is-active" : ""}`}
            onClick={() => setViewMode("explainer")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "14px",
              border: "none",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: viewMode === "explainer" ? "rgba(6, 182, 212, 0.25)" : "transparent",
              color: viewMode === "explainer" ? "#38bdf8" : "#94a3b8",
            }}
            title="3Blue1Brown-inspired timeline player"
          >
            <Video size={12} />
            <span>3B1B Video</span>
          </button>
        )}

        <button
          type="button"
          className={`mode-switch-btn ${viewMode === "classic" ? "is-active" : ""}`}
          onClick={() => setViewMode("classic")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            border: "none",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: viewMode === "classic" ? "rgba(168, 85, 247, 0.25)" : "transparent",
            color: viewMode === "classic" ? "#c084fc" : "#94a3b8",
          }}
          title="3D Slide Deck Presentation"
        >
          <Presentation size={12} />
          <span>Slide Deck</span>
        </button>
      </div>

      {/* Primary Rendering Switch */}
      {viewMode === "visual_engine" ? (
        <VisualComponentDispatcher
          scene={activeScene}
          topic={topic}
          currentTime={audioCurrentTime}
        />
      ) : viewMode === "explainer" && hasSceneScript ? (
        <AIExplanationPlayer
          sceneScript={sceneScript}
          audioUrl={audioUrl}
          topic={topic}
          teacherName={teacherName}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          playbackSpeed={playbackSpeed}
          onToggleSpeed={onToggleSpeed}
          externalTime={audioCurrentTime}
          onTimeUpdate={onTimeUpdate}
        />
      ) : (
        renderClassicView()
      )}
    </div>
  );
}
