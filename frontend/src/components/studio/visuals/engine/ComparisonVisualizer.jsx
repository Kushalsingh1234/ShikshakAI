import React from "react";
import { Check, X } from "lucide-react";
import "./VisualEngine.css";

export default function ComparisonVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const leftTitle = componentProps.left_title || "Linear Search O(n)";
  const leftMetric = componentProps.left_metric || "1,000,000 Comparisons";
  const rightTitle = componentProps.right_title || "Binary Search O(log n)";
  const rightMetric = componentProps.right_metric || "Only 20 Comparisons";

  return (
    <div className="ve-stage-frame">
      <div className="ve-comparison-grid">
        {/* Left Column */}
        <div className="ve-comparison-col">
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#EF4444" }}>
            <X size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Standard Approach</span>
          </div>
          <h3 style={{ margin: "4px 0", fontSize: 18, color: "#FFFFFF" }}>{leftTitle}</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#94A3B8" }}>
            Sequential check of every single element from start to end.
          </p>
          <div
            style={{
              marginTop: "auto",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: 10,
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#FCA5A5",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {leftMetric}
          </div>
        </div>

        {/* Right Column (Featured Optimal) */}
        <div className="ve-comparison-col featured">
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38BDF8" }}>
            <Check size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Optimal Strategy</span>
          </div>
          <h3 style={{ margin: "4px 0", fontSize: 18, color: "#38BDF8" }}>{rightTitle}</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#94A3B8" }}>
            Logarithmic elimination of 50% of candidates at every step.
          </p>
          <div
            style={{
              marginTop: "auto",
              padding: "12px 16px",
              background: "rgba(56, 189, 248, 0.15)",
              borderRadius: 10,
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "#38BDF8",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {rightMetric}
          </div>
        </div>
      </div>
    </div>
  );
}
