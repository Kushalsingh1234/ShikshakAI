import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Safe KaTeX renderer with clean error fallback
const renderSafeKaTeX = (mathStr, displayMode = false) => {
  if (!mathStr || typeof mathStr !== "string") return "";
  try {
    return katex.renderToString(mathStr, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch (err) {
    console.warn("[KaTeX Render Error Fallback]", err, mathStr);
    return `<span class="katex-fallback-text">${mathStr}</span>`;
  }
};

function ExplainerFormulaScene({ payload = {}, cueIndex = 0 }) {
  const latex = payload?.latex || "2x + 4 = 10";
  const rawTerms = Array.isArray(payload?.terms) && payload.terms.length > 0
    ? payload.terms
    : [latex];

  // Validate terms: ensure terms are trimmed non-empty strings
  const terms = useMemo(() => {
    return rawTerms.map((t) => String(t).trim()).filter((t) => t.length > 0);
  }, [rawTerms]);

  const activeTermIdx = Math.min(
    terms.length - 1,
    Math.max(0, payload?.active_term_index ?? cueIndex)
  );
  const activeTerm = terms[activeTermIdx] || terms[0] || latex;

  // Render master formula with KaTeX
  const renderedMasterFormula = useMemo(() => {
    return renderSafeKaTeX(latex, true);
  }, [latex]);

  return (
    <div className="explainer-formula-stage" role="region" aria-label="KaTeX Mathematical Derivation">
      {/* 3Blue1Brown Inspired Glowing Math Canvas */}
      <div className="formula-ambient-halo" />

      <div className="formula-header-badge">
        <span className="formula-pill-tag">MATHEMATICAL DERIVATION</span>
        <span className="formula-step-counter">
          Term {activeTermIdx + 1} of {terms.length}
        </span>
      </div>

      {/* Primary KaTeX Formula Display */}
      <div className="formula-master-card">
        <div
          className="formula-katex-render"
          dangerouslySetInnerHTML={{ __html: renderedMasterFormula }}
        />
      </div>

      {/* Progressive Term Spotlight Breakdown (Mayer's Signaling Principle) */}
      <div className="formula-terms-rail">
        {terms.map((term, idx) => {
          const isActive = idx === activeTermIdx;
          const isPassed = idx < activeTermIdx;
          const html = renderSafeKaTeX(term, false);

          return (
            <div
              key={idx}
              className={`term-segment-card ${isActive ? "is-active-term" : ""} ${isPassed ? "is-passed-term" : "is-inactive-term"}`}
            >
              <div className="term-math-preview" dangerouslySetInnerHTML={{ __html: html }} />
              <div className="term-state-indicator">
                {isActive ? "Active Focus" : isPassed ? "Evaluated" : "Upcoming"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spatial Contiguity: Pedagogical Intuition Strip directly below the terms */}
      <div className="formula-intuition-banner">
        <div className="intuition-icon">💡</div>
        <div className="intuition-text-group">
          <span className="intuition-label">Current Focus Intuition:</span>
          <p className="intuition-detail">
            {payload?.term_intuition || `Analyzing the mathematical behavior and balance of ${activeTerm}.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ExplainerFormulaScene);
