import React from "react";
import "./VisualEngine.css";

export default function MoleculeVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const moleculeName = componentProps.name || "H₂O (Water Polar Molecule)";

  return (
    <div className="ve-stage-frame">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <h4 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#38BDF8", fontWeight: 700 }}>
          {moleculeName}
        </h4>

        <svg className="ve-svg-stage-canvas" viewBox="0 0 500 300">
          {/* Covalent Bond Lines */}
          <line
            x1="250"
            y1="120"
            x2="150"
            y2="210"
            stroke="#38BDF8"
            strokeWidth="6"
            className="ve-bond-line"
          />
          <line
            x1="250"
            y1="120"
            x2="350"
            y2="210"
            stroke="#38BDF8"
            strokeWidth="6"
            className="ve-bond-line"
          />

          {/* Angle Arc */}
          <path
            d="M 210,160 A 60 60 0 0 0 290 160"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="3"
          />
          <text x="250" y="175" fill="#94A3B8" fontSize="12" textAnchor="middle" fontWeight="700">
            104.5°
          </text>

          {/* Central Oxygen Atom (O) */}
          <circle
            cx="250"
            cy="120"
            r="44"
            fill="#EF4444"
            className="ve-atom-circle"
            filter="drop-shadow(0 0 14px rgba(239,68,68,0.5))"
          />
          <text x="250" y="128" fill="#FFFFFF" fontSize="22" fontWeight="800" textAnchor="middle">
            O
          </text>
          <text x="250" y="60" fill="#F87171" fontSize="13" fontWeight="700" textAnchor="middle">
            δ- (Partial Negative)
          </text>

          {/* Hydrogen Atom 1 (H) */}
          <circle
            cx="150"
            cy="210"
            r="28"
            fill="#3B82F6"
            className="ve-atom-circle"
            filter="drop-shadow(0 0 10px rgba(59,130,246,0.5))"
          />
          <text x="150" y="217" fill="#FFFFFF" fontSize="18" fontWeight="800" textAnchor="middle">
            H
          </text>
          <text x="150" y="260" fill="#60A5FA" fontSize="12" fontWeight="700" textAnchor="middle">
            δ+ (Partial Positive)
          </text>

          {/* Hydrogen Atom 2 (H) */}
          <circle
            cx="350"
            cy="210"
            r="28"
            fill="#3B82F6"
            className="ve-atom-circle"
            filter="drop-shadow(0 0 10px rgba(59,130,246,0.5))"
          />
          <text x="350" y="217" fill="#FFFFFF" fontSize="18" fontWeight="800" textAnchor="middle">
            H
          </text>
          <text x="350" y="260" fill="#60A5FA" fontSize="12" fontWeight="700" textAnchor="middle">
            δ+ (Partial Positive)
          </text>
        </svg>

        <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 10 }}>
          High electronegativity of Oxygen creates a strong dipole moment.
        </div>
      </div>
    </div>
  );
}
