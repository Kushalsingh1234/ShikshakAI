import React from "react";
import "./VisualEngine.css";

export default function AnatomyVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const organelle = componentProps.organelle || "Plant Chloroplast";

  return (
    <div className="ve-stage-frame">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#10B981", fontWeight: 700 }}>
          {organelle}
        </h4>

        <svg className="ve-svg-stage-canvas" viewBox="0 0 550 300">
          {/* Outer Membrane Ellipse */}
          <ellipse
            cx="275"
            cy="150"
            rx="230"
            ry="120"
            fill="rgba(16, 185, 129, 0.15)"
            stroke="#10B981"
            strokeWidth="3"
            filter="drop-shadow(0 0 16px rgba(16, 185, 129, 0.3))"
          />

          {/* Inner Membrane */}
          <ellipse
            cx="275"
            cy="150"
            rx="215"
            ry="105"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="4"
          />

          {/* Stroma Label */}
          <text x="380" y="90" fill="#34D399" fontSize="13" fontWeight="700">
            Stroma (Calvin Cycle)
          </text>
          <line x1="375" y1="95" x2="330" y2="120" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3" />

          {/* Granum Stack 1 (Thylakoid discs) */}
          <g transform="translate(180, 110)">
            <rect x="0" y="0" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
            <rect x="0" y="16" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
            <rect x="0" y="32" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
            <rect x="0" y="48" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
          </g>

          {/* Granum Stack 2 */}
          <g transform="translate(260, 120)">
            <rect x="0" y="0" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
            <rect x="0" y="16" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
            <rect x="0" y="32" width="50" height="12" rx="4" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
          </g>

          {/* Granum Label */}
          <text x="120" y="210" fill="#6EE7B7" fontSize="13" fontWeight="700">
            Thylakoid Granum
          </text>
          <line x1="175" y1="195" x2="195" y2="165" stroke="#6EE7B7" strokeWidth="1.5" strokeDasharray="3" />
        </svg>

        <div style={{ fontSize: 13, color: "#94A3B8" }}>
          Light reactions harvest photons in the Thylakoids; carbon fixation occurs in the Stroma.
        </div>
      </div>
    </div>
  );
}
