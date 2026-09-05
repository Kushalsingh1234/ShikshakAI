import React, { useMemo } from "react";
import DataStructureVisualizer from "./DataStructureVisualizer";
import EquationBuildVisualizer from "./EquationBuildVisualizer";
import ProcessFlowVisualizer from "./ProcessFlowVisualizer";
import CodeExecutionVisualizer from "./CodeExecutionVisualizer";
import ComparisonVisualizer from "./ComparisonVisualizer";
import MoleculeVisualizer from "./MoleculeVisualizer";
import AnatomyVisualizer from "./AnatomyVisualizer";
import ArchitectureVisualizer from "./ArchitectureVisualizer";
import TimelineVisualizer from "./TimelineVisualizer";
import SummaryVisualizer from "./SummaryVisualizer";
import ConceptRevealVisualizer from "./ConceptRevealVisualizer";
import "./VisualEngine.css";

export default function VisualComponentDispatcher({
  scene,
  topic = "Interactive Concept",
  currentTime = 0,
}) {
  const sbScene = scene?.storyboard_scene || scene || {};
  const componentName = sbScene.component || inferComponentFromScene(sbScene, topic);
  const componentProps = sbScene.component_props || {};
  const sceneTitle = sbScene.title || scene?.visual?.title || topic;
  const objective = sbScene.objective || scene?.step_type || "Mastery Checkpoint";

  const renderComponent = () => {
    try {
      switch (componentName) {
        case "DataStructure":
          return (
            <DataStructureVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "EquationBuild":
        case "StepByStep":
          return (
            <EquationBuildVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "ProcessFlow":
        case "CauseEffect":
        case "Flowchart":
          return (
            <ProcessFlowVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "CodeExecution":
          return (
            <CodeExecutionVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Comparison":
        case "BeforeAfter":
          return (
            <ComparisonVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Molecule":
          return (
            <MoleculeVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Anatomy":
          return (
            <AnatomyVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Architecture":
          return (
            <ArchitectureVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Timeline":
        case "Map":
          return (
            <TimelineVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "Summary":
          return (
            <SummaryVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );

        case "ConceptReveal":
        case "Definition":
        case "Highlight":
        case "Zoom":
        default:
          return (
            <ConceptRevealVisualizer
              scene={sbScene}
              componentProps={componentProps}
              currentTime={currentTime}
            />
          );
      }
    } catch (err) {
      console.warn("Visual component dispatch error, falling back to ConceptReveal:", err);
      return (
        <ConceptRevealVisualizer
          scene={sbScene}
          componentProps={componentProps}
          currentTime={currentTime}
        />
      );
    }
  };

  return (
    <div className="visual-engine-canvas">
      {/* Scene Header */}
      <div className="ve-scene-header">
        <div className="ve-scene-title-wrap">
          <span className="ve-badge-objective">{objective}</span>
          <h2 className="ve-scene-main-title">{sceneTitle}</h2>
        </div>
      </div>

      {/* Rendered Component */}
      {renderComponent()}
    </div>
  );
}

function inferComponentFromScene(scene, topic) {
  const t = (topic + " " + (scene.title || "") + " " + (scene.type || "")).toLowerCase();
  if (/array|binary|search|tree|stack|queue|pointer/.test(t)) return "DataStructure";
  if (/equation|algebra|linear|solve|calc|deriv|formula/.test(t)) return "EquationBuild";
  if (/code|python|java|javascript|algo|function/.test(t)) return "CodeExecution";
  if (/molecule|chem|water|bond|atom|h2o/.test(t)) return "Molecule";
  if (/photo|cell|plant|chloroplast|organelle|bio/.test(t)) return "Anatomy";
  if (/cpu|memory|ram|bus|arch|system/.test(t)) return "Architecture";
  if (/compare|vs|before|after/.test(t)) return "Comparison";
  if (/cycle|process|flow|pathway/.test(t)) return "ProcessFlow";
  if (/timeline|history|war|century/.test(t)) return "Timeline";
  if (/summary|recap|conclusion/.test(t)) return "Summary";
  return "ConceptReveal";
}
