import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";

export default function EquationRenderer({
  content = "2x + 4 = 10",
  title = "Step-by-Step Algebraic Transformation",
  activeStep = 0,
}) {
  // Parse lines or multi-step derivations
  const lines = (content || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const stepsToRender = lines.length > 0 ? lines : ["2x + 4 = 10", "2x = 6", "x = 3"];

  return (
    <div className="visual-equation-stage">
      <div className="equation-canvas-card">
        <div className="equation-header-tag">
          <Sparkles size={14} className="tag-sparkle" />
          <span>MATHEMATICAL DERIVATION & EQUALITY FLOW</span>
        </div>

        <h2 className="equation-stage-title">{title}</h2>

        <div className="equation-steps-flow">
          {stepsToRender.map((stepFormula, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`equation-step-node ${
                  idx === stepsToRender.length - 1 ? "is-final-solution" : "is-step"
                }`}
              >
                <div className="step-number-badge">Step {idx + 1}</div>
                <div className="formula-render-box">
                  <KaTeXFormula tex={stepFormula} />
                </div>
                {idx === stepsToRender.length - 1 && (
                  <span className="solution-pill">
                    <CheckCircle2 size={13} />
                    <span>Solution Isolated</span>
                  </span>
                )}
              </div>

              {idx < stepsToRender.length - 1 && (
                <div className="step-arrow-divider">
                  <ArrowDown size={18} className="arrow-icon" />
                  <span className="step-op-label">
                    {idx === 0
                      ? "Subtract 4 from both sides"
                      : idx === 1
                      ? "Simplify terms"
                      : idx === 2
                      ? "Divide both sides by 2"
                      : "Balanced Operation"}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function KaTeXFormula({ tex }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(tex, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      containerRef.current.innerText = tex;
    }
  }, [tex]);

  return <div ref={containerRef} className="katex-host-element" />;
}
