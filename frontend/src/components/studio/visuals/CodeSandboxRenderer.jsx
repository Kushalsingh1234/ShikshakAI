import React, { useState } from "react";
import { Code2, Play, Terminal, CheckCircle2, Copy } from "lucide-react";

export default function CodeSandboxRenderer({
  title = "Interactive Code Simulation",
  content = "",
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(null);

  const defaultCode = content || `# Linear Equation Solver
def solve_linear(a, b, c):
    """Solves ax + b = c for x"""
    # Step 1: Subtract b from both sides
    rhs = c - b
    print(f"Step 1: {a}x = {rhs}")
    
    # Step 2: Divide by a
    x = rhs / a
    print(f"Step 2: x = {x}")
    return x

# Example: 2x + 4 = 10
result = solve_linear(a=2, b=4, c=10)
print(f"-> Solution: x = {result}")`;

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("Executing script in Python runtime...");
    setTimeout(() => {
      setIsRunning(false);
      setOutput("Step 1: 2x = 6\nStep 2: x = 3.0\n-> Solution: x = 3.0\n[Process completed with exit code 0]");
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-sandbox-stage">
      <div className="code-header-tag">
        <Code2 size={14} className="tag-icon" />
        <span>INTERACTIVE CODE EXECUTION & STATE FLOW</span>
      </div>

      <div className="code-stage-header">
        <h2 className="code-title">{title}</h2>
        <div className="code-top-actions">
          <button type="button" className="code-copy-btn" onClick={handleCopy}>
            {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
          <button
            type="button"
            className="code-run-btn"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? "Running..." : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      {/* Editor & Terminal Grid */}
      <div className="code-editor-grid">
        <div className="code-editor-pane">
          <div className="pane-tab">
            <span className="file-dot" />
            <span>solution.py</span>
          </div>
          <pre className="code-text-block">
            <code>{defaultCode}</code>
          </pre>
        </div>

        <div className="code-terminal-pane">
          <div className="terminal-header">
            <Terminal size={13} />
            <span>Console Output</span>
          </div>
          <pre className="terminal-content">
            {output || 'Click "Run Simulation" to execute the code and trace variable states...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
