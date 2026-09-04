import React from "react";
import { Sliders, HelpCircle, TrendingUp } from "lucide-react";

export default function AICapabilities() {
  const capabilities = [
    {
      icon: Sliders,
      title: "Adaptive explanations",
      desc: "Adjusts explanations to your level.",
    },
    {
      icon: HelpCircle,
      title: "Interactive questions",
      desc: "Checks your understanding as you learn.",
    },
    {
      icon: TrendingUp,
      title: "Personalized feedback",
      desc: "Identifies gaps and explains them again.",
    },
  ];

  return (
    <div className="capabilities-compact-section">
      <h4 className="capabilities-section-title">How your lesson adapts</h4>
      <div className="capabilities-rows-list">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div key={idx} className="capability-minimal-row">
              <div className="capability-icon-cell">
                <Icon size={15} />
              </div>
              <div className="capability-text-cell">
                <span className="capability-item-title">{cap.title}</span>
                <p className="capability-item-desc">{cap.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
