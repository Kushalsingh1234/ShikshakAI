import React from "react";
import { Check, Dot } from "lucide-react";

export default function SceneTimeline({
  scenes = [],
  currentSceneIndex = 0,
  onSelectScene,
}) {
  const getSceneTypeLabel = (stepType, idx) => {
    switch (stepType) {
      case "intro":
        return "INTRO";
      case "concept":
        return "CONCEPT";
      case "demonstration":
        return "DEMO";
      case "worked_example":
        return "EXAMPLE";
      case "checkpoint":
        return "CHECKPOINT";
      case "adaptive_explanation":
        return "ADAPT";
      case "summary":
        return "SUMMARY";
      default:
        return `SCENE ${idx + 1}`;
    }
  };

  return (
    <div className="studio-cinematic-timeline" role="navigation" aria-label="Lesson Timeline">
      <div className="timeline-track">
        {scenes.map((scene, idx) => {
          const isCompleted = idx < currentSceneIndex;
          const isActive = idx === currentSceneIndex;
          const label = getSceneTypeLabel(scene.step_type, idx);

          return (
            <button
              key={scene.id || idx}
              type="button"
              className={`timeline-node ${isCompleted ? "is-completed" : ""} ${isActive ? "is-active" : ""}`}
              onClick={() => onSelectScene && onSelectScene(idx)}
              title={`Jump to Scene ${idx + 1}: ${scene.visual?.title || label}`}
            >
              <span className="node-indicator">
                {isCompleted ? (
                  <Check size={11} className="node-check" />
                ) : (
                  <span className="node-dot" />
                )}
              </span>
              <span className="node-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
