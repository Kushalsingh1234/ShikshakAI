import React, { useState } from "react";
import { Scale, RefreshCw, Sparkles, Plus, Minus } from "lucide-react";

export default function BalanceBeamRenderer({
  title = "The Balance Scale Analogy: Symmetrical Equality",
  content = "",
}) {
  const [leftWeight, setLeftWeight] = useState(10); // 2x + 4 when x=3 is 10
  const [rightWeight, setRightWeight] = useState(10);
  const [activeAction, setActiveAction] = useState(null);

  const isBalanced = leftWeight === rightWeight;
  // Tilt angle in degrees (-8 to +8)
  const tiltAngle = Math.max(-12, Math.min(12, (rightWeight - leftWeight) * 2));

  const applySubtractFourBoth = () => {
    setLeftWeight((prev) => prev - 4);
    setRightWeight((prev) => prev - 4);
    setActiveAction("Subtracted 4 from BOTH sides: Scale remains in balance (6 = 6)");
  };

  const applySubtractFourLeftOnly = () => {
    setLeftWeight((prev) => prev - 4);
    setActiveAction("MISTAKE: Subtracted 4 from LEFT ONLY → The scale tilts and equivalence breaks!");
  };

  const resetScale = () => {
    setLeftWeight(10);
    setRightWeight(10);
    setActiveAction(null);
  };

  return (
    <div className="balance-beam-stage">
      <div className="balance-header-tag">
        <Scale size={14} className="tag-icon" />
        <span>PHYSICAL ANALOGY • PRINCIPLE OF EQUALITY</span>
      </div>

      <h2 className="balance-title">{title}</h2>
      <p className="balance-subtitle">
        An equation is like a balanced two-pan scale. The equal sign ($=$) represents the central fulcrum.
      </p>

      {/* SVG Interactive Animated Scale */}
      <div className="scale-svg-container">
        <svg viewBox="0 0 600 280" className="balance-scale-svg">
          {/* Central Fulcrum Stand */}
          <polygon points="300,160 270,250 330,250" fill="#2A3756" stroke="#4F63C8" strokeWidth="2" />
          <circle cx="300" cy="160" r="10" fill="#6B82E8" />

          {/* Pivoting Beam (transforms with tiltAngle) */}
          <g transform={`rotate(${tiltAngle}, 300, 160)`} style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            {/* Horizontal Crossbeam */}
            <line x1="80" y1="160" x2="520" y2="160" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            
            {/* Left Pan Chains & Plate */}
            <line x1="120" y1="160" x2="100" y2="210" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="120" y1="160" x2="140" y2="210" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 80 210 Q 120 225 160 210 Z" fill="#384EB7" stroke="#6B82E8" strokeWidth="2" />

            {/* Left Weight Blocks */}
            <g transform="translate(95, 175)">
              <rect width="50" height="32" rx="6" fill="#4F63C8" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="25" y="21" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                {leftWeight === 10 ? "2x + 4" : `${leftWeight}`}
              </text>
            </g>

            {/* Right Pan Chains & Plate */}
            <line x1="480" y1="160" x2="460" y2="210" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="480" y1="160" x2="500" y2="210" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 440 210 Q 480 225 520 210 Z" fill="#384EB7" stroke="#6B82E8" strokeWidth="2" />

            {/* Right Weight Blocks */}
            <g transform="translate(455, 175)">
              <rect width="50" height="32" rx="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="25" y="21" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                {rightWeight === 10 ? "10" : `${rightWeight}`}
              </text>
            </g>
          </g>

          {/* Equal Sign Indicator on Base */}
          <rect x="275" y="240" width="50" height="28" rx="6" fill="#17213A" stroke="rgba(255,255,255,0.1)" />
          <text x="300" y="260" fill={isBalanced ? "#10B981" : "#EF4444"} fontSize="18" fontWeight="bold" textAnchor="middle">
            {isBalanced ? "=" : "≠"}
          </text>
        </svg>
      </div>

      {/* Real-time State Feedback Banner */}
      <div className={`balance-status-banner ${isBalanced ? "is-balanced" : "is-unbalanced"}`}>
        <span className="status-label">
          {activeAction || (isBalanced ? "Scale is perfectly balanced: 2x + 4 = 10" : "Scale is unbalanced!")}
        </span>
      </div>

      {/* Interactive Demonstration Controls */}
      <div className="balance-interactive-controls">
        <button type="button" className="sim-action-btn balanced-op" onClick={applySubtractFourBoth}>
          <Sparkles size={14} />
          <span>Apply: Subtract 4 from BOTH sides (Correct)</span>
        </button>

        <button type="button" className="sim-action-btn unbalance-op" onClick={applySubtractFourLeftOnly}>
          <Minus size={14} />
          <span>Subtract 4 from Left Only (Common Mistake)</span>
        </button>

        <button type="button" className="sim-reset-btn" onClick={resetScale} title="Reset scale">
          <RefreshCw size={13} />
          <span>Reset Scale</span>
        </button>
      </div>
    </div>
  );
}
