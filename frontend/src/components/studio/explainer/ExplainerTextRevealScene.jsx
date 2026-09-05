import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

function ExplainerTextRevealSceneComponent({ payload = {}, cueIndex = 0 }) {
  const heading = payload?.heading || "Core Concept Breakdown";
  const rawBullets = Array.isArray(payload?.bullets) && payload.bullets.length > 0
    ? payload.bullets
    : [
        "First principle definition and governing law",
        "Underlying causal interaction mechanism",
        "Real-world application and verification heuristic"
      ];
  const bullets = rawBullets.filter(Boolean);
  const activeBulletIdx = payload?.active_bullet_index ?? Math.min(cueIndex, Math.max(0, bullets.length - 1));

  return (
    <div className="explainer-text-reveal-stage">
      <motion.div
        className="reveal-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="reveal-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>PEDAGOGICAL BREAKDOWN</span>
        </div>
        <h2 className="reveal-title">{heading}</h2>
      </motion.div>

      <div className="reveal-cards-stack">
        {bullets.map((bullet, idx) => {
          const isActive = idx === activeBulletIdx;
          const isPassed = idx < activeBulletIdx;

          return (
            <motion.div
              key={idx}
              className={`reveal-point-card ${isActive ? "is-focused-point" : ""} ${isPassed ? "is-cleared-point" : ""}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <div className="point-card-num-box">
                {isPassed ? (
                  <CheckCircle2 size={18} className="icon-cleared" />
                ) : (
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                )}
              </div>

              <div className="point-card-content">
                <p className="point-text">{bullet}</p>
                {isActive && (
                  <motion.div
                    className="point-active-tag"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="live-dot" /> Explaining Concept Now
                  </motion.div>
                )}
              </div>

              {isActive && <div className="point-card-active-glow" />}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {payload?.active_bullet_text && (
          <motion.div
            className="reveal-takeaway-bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ArrowRight size={16} className="takeaway-arrow" />
            <span className="takeaway-label">Key Takeaway:</span>
            <span className="takeaway-text">{payload.active_bullet_text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ExplainerTextRevealScene = memo(ExplainerTextRevealSceneComponent);
export default ExplainerTextRevealScene;

