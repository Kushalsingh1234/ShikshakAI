import React, { memo } from "react";
import { Target } from "lucide-react";

function VirtualPresenterPointerComponent({
  pointer = { active: true, coords: { x: 50, y: 50 }, label: "Focus Point" },
  teacherName = "Dr. Maya",
}) {
  if (!pointer || !pointer.active) return null;

  // Safe clamping within visual boundary
  const posX = Math.min(88, Math.max(12, pointer.coords?.x ?? 50));
  const posY = Math.min(84, Math.max(14, pointer.coords?.y ?? 50));
  const label = pointer.label || "Key Teaching Point";

  // If pointer is in the right 40% of the canvas, flip badge to the left to prevent clipping
  const isRightHalf = posX > 58;

  return (
    <div
      className="virtual-presenter-pointer-root"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
      }}
      aria-hidden="true"
    >
      {/* Radar Expansion Rings */}
      <div className="presenter-radar-ring ring-1" />
      <div className="presenter-radar-ring ring-2" />

      {/* Laser Targeting Reticle */}
      <div className="presenter-reticle-core">
        <Target size={22} className="reticle-icon" />
        <div className="reticle-laser-dot" />
      </div>

      {/* Holographic Presenter Focus Card (Auto-flipped when near right edge) */}
      <div
        className={`presenter-focus-badge ${isRightHalf ? "is-flipped-left" : ""}`}
        style={isRightHalf ? { left: "auto", right: "28px" } : undefined}
      >
        <div className="badge-header">
          <span className="badge-pulse-light" />
          <span className="presenter-name-tag">{teacherName} Focusing</span>
        </div>
        <div className="badge-instruction-label">{label}</div>
      </div>

      {/* Laser Pointer Light Beam */}
      <div className="presenter-beam-glow" />
    </div>
  );
}

const VirtualPresenterPointer = memo(VirtualPresenterPointerComponent);
export default VirtualPresenterPointer;

