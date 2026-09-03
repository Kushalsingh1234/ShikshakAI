import React, { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Code2,
  Sigma,
  Layers,
  Sparkles,
} from "lucide-react";
import CodeDemoViewer from "./CodeDemoViewer";
import FormulaDerivationViewer from "./FormulaDerivationViewer";
import FlashcardViewer from "./FlashcardViewer";

export default function SmartBoard({ visual, lessonTitle, currentStep, totalSteps }) {
  const mathRef = useRef(null);
  const mermaidRef = useRef(null);
  const [activeTab, setActiveTab] = useState("auto"); // "auto", "code", "derivation", "flashcards"

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
  }, []);

  // Render KaTeX Math equations for simple katex visual
  useEffect(() => {
    if (visual?.type === "katex" && mathRef.current && (activeTab === "auto" || activeTab === "lesson")) {
      try {
        katex.render(visual.content, mathRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
      }
    }
  }, [visual, activeTab]);

  // Render Mermaid diagrams
  useEffect(() => {
    if (visual?.type === "mermaid" && mermaidRef.current && (activeTab === "auto" || activeTab === "lesson")) {
      mermaidRef.current.innerHTML = "";
      const uniqueId = "mermaid-" + Math.random().toString(36).substring(2, 9);
      mermaid
        .render(uniqueId, visual.content)
        .then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid diagram render error:", err);
        });
    }
  }, [visual, activeTab]);

  // Reset to auto view when step visual changes
  useEffect(() => {
    setActiveTab("auto");
  }, [visual]);

  return (
    <div className="smartboard-card">
      <div className="smartboard-header">
        <div className="smartboard-title-group">
          <BookOpen size={18} className="text-indigo-400" />
          <h3 className="smartboard-topic">{lessonTitle || "Interactive Smartboard"}</h3>
        </div>

        {/* View Mode Switching Tabs */}
        <div className="smartboard-tabs">
          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "auto" ? "active" : ""}`}
            onClick={() => setActiveTab("auto")}
            title="Current Lesson Visual"
          >
            <Sparkles size={13} />
            <span>Lesson Visual</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
            title="Interactive Code Runner"
          >
            <Code2 size={13} />
            <span>Code Sandbox</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "derivation" ? "active" : ""}`}
            onClick={() => setActiveTab("derivation")}
            title="Step-by-Step Derivation"
          >
            <Sigma size={13} />
            <span>Derivations</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "flashcards" ? "active" : ""}`}
            onClick={() => setActiveTab("flashcards")}
            title="Revision Flashcards"
          >
            <Layers size={13} />
            <span>Flashcards</span>
          </button>
        </div>

        <div className="step-progress-badge">
          Step {currentStep || 1} of {totalSteps || 4}
        </div>
      </div>

      <div className="smartboard-canvas">
        {activeTab === "code" ? (
          <CodeDemoViewer
            codeSnippet={visual?.type === "code" ? visual.content : undefined}
            title={visual?.title || `${lessonTitle || "Concept"} Code Simulation`}
          />
        ) : activeTab === "derivation" ? (
          <FormulaDerivationViewer
            title={visual?.title || `${lessonTitle || "Topic"} Mathematical Derivation`}
          />
        ) : activeTab === "flashcards" ? (
          <FlashcardViewer topic={lessonTitle || "Key Topic"} />
        ) : visual ? (
          <div className="visual-container">
            <h4 className="visual-title">{visual.title}</h4>

            {visual.type === "katex" && (
              <div className="formula-display-box" ref={mathRef}></div>
            )}

            {visual.type === "mermaid" && (
              <div className="diagram-display-box" ref={mermaidRef}></div>
            )}

            {visual.type === "bullet_points" && (
              <div className="bullet-points-box">
                {visual.content.split("\n").map((line, idx) => (
                  <div key={idx} className="bullet-item">
                    <CheckCircle2 size={16} className="bullet-check" />
                    <span>{line.replace(/^[0-9]+\.\s*|\•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            )}

            {visual.type === "code" && (
              <CodeDemoViewer
                codeSnippet={visual.content}
                title={visual.title}
                language={visual.language || "python"}
              />
            )}

            {visual.type === "formula_derivation" && (
              <FormulaDerivationViewer
                title={visual.title}
                steps={visual.steps}
                finalFormula={visual.final_formula}
              />
            )}

            {visual.type === "flashcards" && (
              <FlashcardViewer
                topic={lessonTitle}
                flashcards={visual.cards}
              />
            )}
          </div>
        ) : (
          <div className="smartboard-placeholder">
            <div className="placeholder-icon-wrap">
              <Award size={42} />
            </div>
            <h4>Welcome to your personalized AI classroom</h4>
            <p>Upload your study notes or pick a topic to launch an adaptive AI lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
}
