import React, { useEffect, useRef, useState, memo } from "react";
import mermaid from "mermaid";
import { GitFork, AlertCircle } from "lucide-react";

function ExplainerDiagramSceneComponent({ payload = {}, cueIndex = 0 }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [hasError, setHasError] = useState(false);
  const [fallbackSteps, setFallbackSteps] = useState([]);

  const rawMermaid = payload?.mermaid || "graph LR\n  A[Input] --> B[Processing] --> C[Output]";
  const activeNodeIdx = payload?.active_node_index ?? cueIndex;

  useEffect(() => {
    let isCancelled = false;

    // Extract fallback nodes from mermaid string in case of parsing failure
    try {
      const nodeMatches = [...rawMermaid.matchAll(/([A-Za-z0-9_]+)\[(.*?)\]/g)].map(
        (m) => m[2]
      );
      if (nodeMatches.length > 0) {
        setFallbackSteps(nodeMatches);
      } else {
        setFallbackSteps(["Input Stage", "Process Transition", "Result / Output"]);
      }
    } catch {
      setFallbackSteps(["Concept Point A", "Concept Point B", "Key Output"]);
    }

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "transparent",
          mainBkg: "#0f172a",
          nodeBorder: "#38bdf8",
          lineColor: "#06b6d4",
          textColor: "#f8fafc",
          fontFamily: "Inter, sans-serif",
        },
        securityLevel: "loose",
        suppressErrorRendering: true,
      });

      const uniqueId = `mermaid_explainer_${Math.random().toString(36).substring(2, 9)}`;

      mermaid
        .render(uniqueId, rawMermaid)
        .then(({ svg }) => {
          if (!isCancelled) {
            setSvgContent(svg);
            setHasError(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.warn("[ExplainerDiagramScene Safe Fallback]: Malformed Mermaid syntax, rendering fallback node cards:", err);
            setHasError(true);
          }
        });
    } catch (err) {
      if (!isCancelled) {
        console.warn("[ExplainerDiagramScene Caught Error]:", err);
        setHasError(true);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [rawMermaid]);

  return (
    <div className="explainer-diagram-stage">
      <div className="diagram-header-strip">
        <span className="diagram-step-tag">
          <GitFork size={12} style={{ display: "inline", marginRight: "4px" }} />
          DYNAMIC FLOWCHART
        </span>
        <span className="diagram-active-phase">
          {payload?.step_label || `Phase ${activeNodeIdx + 1}`}
        </span>
      </div>

      <div className="diagram-viewport-canvas" ref={containerRef}>
        {hasError ? (
          /* Graceful Fallback: Clean step node cards */
          <div className="diagram-fallback-cards">
            <div className="fallback-note">
              <AlertCircle size={14} className="text-amber-400" />
              <span>Flow Progression Architecture:</span>
            </div>
            <div className="fallback-cards-rail">
              {fallbackSteps.map((step, idx) => {
                const isActive = idx === (activeNodeIdx % fallbackSteps.length);
                return (
                  <div
                    key={idx}
                    className={`fallback-step-box ${isActive ? "is-active-step" : ""}`}
                  >
                    <span className="step-num">{idx + 1}</span>
                    <span className="step-txt">{step}</span>
                    {idx < fallbackSteps.length - 1 && <span className="step-arrow">→</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="diagram-svg-wrapper"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      <div className="diagram-footer-note">
        <span className="pulse-dot" />
        <span>Tracking algorithmic sequence and data transitions in real time</span>
      </div>
    </div>
  );
}

const ExplainerDiagramScene = memo(ExplainerDiagramSceneComponent);
export default ExplainerDiagramScene;

