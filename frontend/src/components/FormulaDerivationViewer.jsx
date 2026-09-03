import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ChevronRight, ChevronLeft, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react";

export default function FormulaDerivationViewer({
  title = "Step-by-Step Derivation",
  steps = [],
  finalFormula = "",
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const formulaRefs = useRef([]);

  // Default derivation steps for physics/math if not supplied
  const derivationSteps =
    steps.length > 0
      ? steps
      : [
          {
            stepNumber: 1,
            title: "Fundamental Definition",
            latex: "I = \\frac{Q}{t} \\quad \\text{and} \\quad V = \\frac{W}{Q}",
            explanation: "Current $I$ is charge per unit time; Voltage $V$ is work done per unit charge.",
          },
          {
            stepNumber: 2,
            title: "Microscopic Electron Drift",
            latex: "I = n \\cdot A \\cdot e \\cdot v_d",
            explanation: "Current in terms of free electron density $n$, cross-section area $A$, and drift velocity $v_d$.",
          },
          {
            stepNumber: 3,
            title: "Relating Drift Velocity to Electric Field",
            latex: "v_d = \\frac{e \\cdot E}{m} \\cdot \\tau = \\frac{e \\cdot V}{m \\cdot L} \\cdot \\tau",
            explanation: "Electrons accelerate under electric field $E = V/L$ over relaxation collision time $\\tau$.",
          },
          {
            stepNumber: 4,
            title: "Substituting & Factoring Resistance",
            latex: "I = \\left(\\frac{n \\cdot e^2 \\cdot A \\cdot \\tau}{m \\cdot L}\\right) V \\implies V = \\left(\\frac{m \\cdot L}{n \\cdot e^2 \\cdot A \\cdot \\tau}\\right) I",
            explanation: "Grouping constant material parameters into single resistance constant $R$.",
          },
          {
            stepNumber: 5,
            title: "Final Ohm's Law Relation",
            latex: "V = I \\cdot R \\quad \\text{where} \\quad R = \\rho \\frac{L}{A}",
            explanation: "Voltage is directly proportional to current under constant temperature.",
          },
        ];

  // Render KaTeX for visible steps
  useEffect(() => {
    derivationSteps.forEach((step, index) => {
      const el = formulaRefs.current[index];
      if (el) {
        try {
          katex.render(step.latex, el, {
            throwOnError: false,
            displayMode: true,
          });
        } catch (err) {
          console.error("KaTeX step render error:", err);
        }
      }
    });
  }, [derivationSteps, currentStepIndex, showAllSteps]);

  const activeStep = derivationSteps[currentStepIndex];

  return (
    <div className="derivation-viewer-container">
      {/* Header with Title and Mode Toggle */}
      <div className="derivation-header">
        <div className="derivation-title-group">
          <Sparkles size={16} className="text-amber-400" />
          <h4 className="derivation-title">{title}</h4>
        </div>

        <div className="derivation-controls">
          <button
            type="button"
            className="toggle-steps-btn"
            onClick={() => setShowAllSteps(!showAllSteps)}
          >
            {showAllSteps ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showAllSteps ? "Step Stepper" : "Show All Steps"}</span>
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="derivation-progress-bar">
        <div className="derivation-progress-track">
          {derivationSteps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={`derivation-step-node ${
                idx === currentStepIndex
                  ? "active"
                  : idx < currentStepIndex || showAllSteps
                  ? "completed"
                  : ""
              }`}
              onClick={() => {
                setShowAllSteps(false);
                setCurrentStepIndex(idx);
              }}
            >
              <span>{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Steps Container */}
      <div className="derivation-content-stage">
        {!showAllSteps ? (
          // Single Step Focus Mode
          <div className="derivation-single-card">
            <div className="step-tag-row">
              <span className="step-index-badge">
                Step {currentStepIndex + 1} of {derivationSteps.length}
              </span>
              <h5 className="step-subheading">{activeStep?.title}</h5>
            </div>

            <div
              className="step-formula-box"
              ref={(el) => (formulaRefs.current[currentStepIndex] = el)}
            ></div>

            <div className="step-explanation-box">
              <span className="explanation-label">Intuition & Rationale:</span>
              <p className="explanation-text">{activeStep?.explanation}</p>
            </div>

            {/* Stepper Navigation */}
            <div className="stepper-nav-row">
              <button
                type="button"
                className="step-nav-btn"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>

              <button
                type="button"
                className="step-nav-btn next"
                disabled={currentStepIndex === derivationSteps.length - 1}
                onClick={() =>
                  setCurrentStepIndex((prev) =>
                    Math.min(derivationSteps.length - 1, prev + 1)
                  )
                }
              >
                <span>Next Step</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          // All Steps Overview Mode
          <div className="derivation-all-list">
            {derivationSteps.map((step, idx) => (
              <div key={idx} className="derivation-list-item">
                <div className="list-item-header">
                  <div className="list-step-badge">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>Step {idx + 1}: {step.title}</span>
                  </div>
                </div>
                <div
                  className="step-formula-box compact"
                  ref={(el) => (formulaRefs.current[idx] = el)}
                ></div>
                <p className="step-explanation-text compact">{step.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
