import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import "./VisualEngine.css";

export default function ProcessFlowVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const stages = componentProps.stages || [
    { name: "1. Light Absorption", inputs: "Photons + H2O", outputs: "ATP + NADPH" },
    { name: "2. Electron Transport", inputs: "High Energy e-", outputs: "Proton Gradient" },
    { name: "3. Calvin Cycle", inputs: "CO2 + ATP", outputs: "Glucose (C6H12O6)" },
  ];

  const activeIdx = Math.min(stages.length - 1, Math.floor(currentTime / 2.5));

  return (
    <div className="ve-stage-frame">
      <div className="ve-process-row">
        {stages.map((stage, idx) => {
          const isActive = idx === activeIdx;

          return (
            <React.Fragment key={idx}>
              <div className={`ve-process-step-box ${isActive ? "highlight" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#38BDF8" : "#94A3B8" }}>
                    PHASE {idx + 1}
                  </span>
                  {isActive && <Sparkles size={13} color="#38BDF8" />}
                </div>

                <h4 style={{ margin: "4px 0", fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>
                  {stage.name}
                </h4>

                {stage.inputs && (
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                    <span style={{ color: "#64748B" }}>In: </span>
                    {stage.inputs}
                  </div>
                )}

                {stage.outputs && (
                  <div style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>
                    <span style={{ color: "#64748B" }}>Out: </span>
                    {stage.outputs}
                  </div>
                )}
              </div>

              {idx < stages.length - 1 && (
                <div className="ve-process-arrow-divider">
                  <ArrowRight size={22} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
