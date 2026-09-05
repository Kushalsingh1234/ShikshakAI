import React from "react";
import "./VisualEngine.css";

export default function CodeExecutionVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const code = componentProps.code || `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1`;

  const lines = code.split("\n");
  const activeLine = componentProps.active_line || (Math.floor(currentTime * 1.5) % lines.length) + 1;

  return (
    <div className="ve-stage-frame">
      <div className="ve-code-window">
        <div className="ve-code-header">
          <div className="ve-mac-dots">
            <span className="ve-mac-dot red" />
            <span className="ve-mac-dot yellow" />
            <span className="ve-mac-dot green" />
          </div>
          <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>
            {componentProps.filename || "algorithm.py"}
          </span>
          <span style={{ fontSize: 11, background: "rgba(56,189,248,0.15)", color: "#38BDF8", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
            PYTHON 3
          </span>
        </div>

        <div className="ve-code-body">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLine;

            return (
              <div
                key={idx}
                className={`ve-code-line ${isActive ? "is-active" : ""}`}
              >
                <span className="ve-line-num">{lineNum}</span>
                <span style={{ whiteSpace: "pre" }}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
