import React, { memo } from "react";
import { Code2, Terminal } from "lucide-react";

function ExplainerCodeSceneComponent({ payload = {}, cueIndex = 0 }) {
  const code = payload?.code || "# Pedagogical Algorithm Walkthrough\ndef solve_problem(n):\n    return n * 2";
  const language = payload?.language || "python";
  const lines = (typeof code === "string" ? code : "").split("\n");
  const activeLine = payload?.active_line || ((cueIndex % Math.max(1, lines.length)) + 1);

  return (
    <div className="explainer-code-stage">
      <div className="code-window-bar">
        <div className="code-window-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="code-window-title">
          <Terminal size={14} />
          <span>{payload?.title || "algorithm"}.{language === "python" ? "py" : "js"}</span>
        </div>
        <div className="code-lang-badge">{language.toUpperCase()}</div>
      </div>

      <div className="code-body-scroll">
        <div className="code-lines-table">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isHighlight = lineNum === activeLine;

            return (
              <div
                key={idx}
                className={`code-line-row ${isHighlight ? "is-active-line" : ""}`}
              >
                <span className="line-number-col">{lineNum}</span>
                <span className="line-code-col">{lineText || " "}</span>
                {isHighlight && (
                  <span className="line-active-badge">
                    <span className="cursor-blink" /> Executing
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="code-status-strip">
        <Code2 size={15} />
        <span>Line {activeLine} of {lines.length} • Step-by-step logic trace</span>
      </div>
    </div>
  );
}

const ExplainerCodeScene = memo(ExplainerCodeSceneComponent);
export default ExplainerCodeScene;

