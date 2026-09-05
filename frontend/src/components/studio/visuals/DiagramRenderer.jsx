import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { GitBranch, Sparkles } from "lucide-react";

export default function DiagramRenderer({
  title = "Conceptual System Model",
  content = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0E1528",
        primaryColor: "#4F63C8",
        primaryBorderColor: "#6B82E8",
        primaryTextColor: "#FFFFFF",
        lineColor: "#A5B4FC",
        secondaryColor: "#384EB7",
        tertiaryColor: "#17213A",
      },
    });

    if (containerRef.current && content) {
      containerRef.current.innerHTML = "";
      const uniqueId = `mermaid-studio-${Math.random().toString(36).substring(2, 9)}`;
      
      const cleanContent = content.trim().startsWith("graph") || content.trim().startsWith("classDiagram")
        ? content
        : `graph TD\n  Start[${title}] --> Process[Core Concept]\n  Process --> Output[Verified Outcome]`;

      mermaid
        .render(uniqueId, cleanContent)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.warn("Mermaid render fallback:", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="fallback-diagram">${cleanContent}</pre>`;
          }
        });
    }
  }, [content, title]);

  return (
    <div className="diagram-renderer-stage">
      <div className="diagram-header-tag">
        <GitBranch size={14} className="tag-icon" />
        <span>CONCEPTUAL FLOW & ARCHITECTURE</span>
      </div>

      <h2 className="diagram-title">{title}</h2>

      <div className="mermaid-render-viewport" ref={containerRef} />
    </div>
  );
}
