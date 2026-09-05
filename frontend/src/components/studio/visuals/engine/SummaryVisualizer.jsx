import React from "react";
import { CheckCircle2, Award } from "lucide-react";
import "./VisualEngine.css";

export default function SummaryVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const takeaways = componentProps.takeaways || [
    "Core principle isolated and verified",
    "Systematic multi-step transformation applied",
    "Verified against boundary conditions and edge cases"
  ];

  return (
    <div className="ve-stage-frame">
      <div className="ve-summary-card-grid">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Award size={22} color="#F59E0B" />
          <h3 style={{ margin: 0, fontSize: 18, color: "#FFFFFF" }}>
            Mastery Synthesis & Key Takeaways
          </h3>
        </div>

        {takeaways.map((point, idx) => (
          <div key={idx} className="ve-summary-item">
            <div className="ve-summary-check-icon">
              <CheckCircle2 size={16} />
            </div>
            <div style={{ fontSize: 15, color: "#F8FAFC", fontWeight: 500, lineHeight: 1.45 }}>
              {point}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
