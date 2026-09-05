import React from "react";
import { Dna, Sparkles, CheckCircle2 } from "lucide-react";

export default function BioChemRenderer({
  title = "Biochemical / Structural Breakdown",
  content = "",
}) {
  const bulletLines = (content || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const defaultPillars = [
    "Input Phase: Substrates & foundational reactants",
    "Catalysis: Enzyme & mechanism lowering activation energy",
    "Output: Energy transfer & synthesized macromolecule",
    "Regulation: Feedback loops maintaining cellular equilibrium",
  ];

  const items = bulletLines.length > 0 ? bulletLines : defaultPillars;

  return (
    <div className="biochem-stage">
      <div className="biochem-header-tag">
        <Dna size={14} className="tag-icon" />
        <span>STRUCTURAL BIOLOGY & PATHWAY MECHANISMS</span>
      </div>

      <h2 className="biochem-title">{title}</h2>

      <div className="biochem-cards-grid">
        {items.map((item, idx) => (
          <div key={idx} className="biochem-pillar-card">
            <div className="pillar-num-badge">Phase {idx + 1}</div>
            <p className="pillar-text">{item.replace(/^[•\-\*]\s*/, "")}</p>
            <div className="pillar-status">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Verified Stage</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
