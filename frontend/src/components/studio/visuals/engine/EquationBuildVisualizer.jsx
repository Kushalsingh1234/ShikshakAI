import React from "react";
import { CheckCircle2, ArrowDown } from "lucide-react";
import "./VisualEngine.css";

export default function EquationBuildVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const steps = componentProps.steps || [
    { step: "Initial Expression", latex: "3x + 6 = 15" },
    { step: "Subtract 6 from both sides", latex: "3x = 15 - 6" },
    { step: "Divide both sides by 3", latex: "x = \\frac{9}{3}" },
    { step: "Final Isolated Solution", latex: "x = 3" },
  ];

  const activeIdx = componentProps.active_step_index ?? Math.min(steps.length - 1, Math.floor(currentTime / 2));

  return (
    <div className="ve-stage-frame">
      <div className="ve-equation-stack">
        {steps.map((item, idx) => {
          const isActive = idx === activeIdx;
          const isPassed = idx < activeIdx;

          return (
            <React.Fragment key={idx}>
              <div className={`ve-equation-card ${isActive ? "is-active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="ve-step-pill-badge">
                    Step {idx + 1}
                  </span>
                  <span style={{ fontSize: 13, color: isActive ? "#38BDF8" : "#94A3B8", fontWeight: 600 }}>
                    {item.step}
                  </span>
                </div>

                <div className="ve-equation-math-text">
                  {item.latex}
                </div>

                {isPassed && (
                  <CheckCircle2 size={16} color="#10B981" />
                )}
              </div>

              {idx < steps.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", opacity: 0.6, margin: "-8px 0" }}>
                  <ArrowDown size={14} color="#64748B" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
