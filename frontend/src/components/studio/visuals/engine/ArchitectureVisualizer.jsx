import React from "react";
import { Cpu, HardDrive, Server, ArrowRight } from "lucide-react";
import "./VisualEngine.css";

export default function ArchitectureVisualizer({
  scene,
  componentProps = {},
  currentTime = 0,
}) {
  return (
    <div className="ve-stage-frame">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", maxWidth: 740 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#A78BFA", fontWeight: 700 }}>
          Von Neumann CPU & Memory Architecture
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 20 }}>
          {/* CPU Box */}
          <div
            style={{
              flex: 1,
              background: "rgba(167, 139, 250, 0.12)",
              border: "2px solid #A78BFA",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Cpu size={32} color="#A78BFA" />
            <span style={{ fontWeight: 800, fontSize: 16, color: "#FFFFFF" }}>Central Processing Unit</span>
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: 8, fontSize: 11, textAlign: "center", color: "#C4B5FD" }}>
                ALU (Math)
              </div>
              <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: 8, fontSize: 11, textAlign: "center", color: "#C4B5FD" }}>
                Control Unit
              </div>
            </div>
          </div>

          {/* Bus Arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#38BDF8" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>SYSTEM BUS</span>
            <div style={{ display: "flex", gap: 6 }}>
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Memory Box */}
          <div
            style={{
              flex: 1,
              background: "rgba(56, 189, 248, 0.12)",
              border: "2px solid #38BDF8",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <HardDrive size={32} color="#38BDF8" />
            <span style={{ fontWeight: 800, fontSize: 16, color: "#FFFFFF" }}>Primary Memory (RAM)</span>
            <div style={{ width: "100%", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: 8, fontSize: 11, textAlign: "center", color: "#7DD3FC" }}>
              Instructions & Data Addresses
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#94A3B8" }}>
          The Control Unit fetches instructions from RAM, decodes them, and coordinates the ALU to execute operations.
        </div>
      </div>
    </div>
  );
}
