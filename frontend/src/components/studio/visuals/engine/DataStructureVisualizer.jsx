import React from "react";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import "./VisualEngine.css";

export default function DataStructureVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const array = componentProps.array || [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
  const target = componentProps.target ?? 23;
  const low = componentProps.low ?? 0;
  const mid = componentProps.mid ?? Math.floor(array.length / 2);
  const high = componentProps.high ?? array.length - 1;
  const comparison = componentProps.comparison || "";

  return (
    <div className="ve-stage-frame">
      <div className="ve-array-container">
        {/* Target Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            color: "#34D399",
          }}
        >
          <Search size={14} />
          <span>Searching for Target Value: <strong>{target}</strong></span>
        </div>

        {/* Array Track with Pointers */}
        <div className="ve-array-track">
          {array.map((val, idx) => {
            const isLow = idx === low;
            const isMid = idx === mid;
            const isHigh = idx === high;
            const isTarget = val === target && isMid;
            const isEliminated = idx < low || idx > high;

            let colClasses = "ve-array-cell-col";
            if (isMid) colClasses += " is-mid";
            if (isTarget) colClasses += " is-target";
            if (isEliminated) colClasses += " is-eliminated";

            return (
              <div key={idx} className={colClasses}>
                {/* Pointer Tag */}
                <div style={{ height: 24, display: "flex", alignItems: "center" }}>
                  {isMid ? (
                    <span className="ve-pointer-tag mid">MID</span>
                  ) : isLow ? (
                    <span className="ve-pointer-tag low">LOW</span>
                  ) : isHigh ? (
                    <span className="ve-pointer-tag high">HIGH</span>
                  ) : null}
                </div>

                {/* Array Cell */}
                <div className="ve-array-cell-box">
                  {val}
                </div>

                {/* Index Subtext */}
                <span className="ve-cell-index-sub">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Comparison Result Pill */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 14,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ color: "#F59E0B" }}>Comparison:</span>
          <span>
            Array[mid={mid}] = {array[mid]} vs Target {target}
          </span>
          {array[mid] === target && (
            <span style={{ color: "#10B981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={16} /> (Target Found in O(log n))
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
