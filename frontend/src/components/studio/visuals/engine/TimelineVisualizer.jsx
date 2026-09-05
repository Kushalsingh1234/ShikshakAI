import React from "react";
import { Calendar } from "lucide-react";
import "./VisualEngine.css";

export default function TimelineVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  const events = componentProps.events || [
    { year: "Phase 1", title: "Initial Catalyst", desc: "Fundamental destabilization of equilibrium" },
    { year: "Phase 2", title: "Escalation & Conflict", desc: "Mobilization and cascading alliances" },
    { year: "Phase 3", title: "Resolution & Reorganization", desc: "New global treaty and geopolitical order" },
  ];

  return (
    <div className="ve-stage-frame">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 700 }}>
        {events.map((ev, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: "16px 20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                minWidth: 85,
                padding: "6px 12px",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: 10,
                color: "#F59E0B",
                fontWeight: 800,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {ev.year}
            </div>

            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: 16, color: "#FFFFFF" }}>{ev.title}</h4>
              <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>{ev.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
