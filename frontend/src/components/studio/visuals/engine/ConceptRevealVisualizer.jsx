import React from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import "./VisualEngine.css";

export default function ConceptRevealVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const conceptTitle = componentProps.concept_title || scene?.title || "Core Principle";
  const analogy = componentProps.analogy || componentProps.insight || scene?.objective || "First-principles mental model.";
  const equation = componentProps.equation || null;

  return (
    <div className="ve-stage-frame">
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: 22,
          padding: "36px 40px",
          maxWidth: 720,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(16px)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38BDF8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lightbulb size={28} />
        </div>

        <div>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#38BDF8" }}>
            FOUNDATIONAL AXIOM
          </span>
          <h2 style={{ margin: "6px 0 0 0", fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>
            {conceptTitle}
          </h2>
        </div>

        {equation && (
          <div
            style={{
              padding: "12px 28px",
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: 22,
              fontWeight: 700,
              color: "#38BDF8",
              letterSpacing: "0.04em",
            }}
          >
            {equation}
          </div>
        )}

        <p style={{ margin: 0, fontSize: 16, color: "#94A3B8", lineHeight: 1.6, maxWidth: 580 }}>
          {analogy}
        </p>
      </div>
    </div>
  );
}
