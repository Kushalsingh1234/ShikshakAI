import React, { useState } from "react";
import { Play, Copy, Check, Terminal, RotateCcw, Sparkles } from "lucide-react";

export default function CodeDemoViewer({
  codeSnippet,
  language = "python",
  title = "Live Code Demonstration",
  expectedOutput = "Executed successfully with 0 errors.",
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState(null);

  const defaultCode =
    codeSnippet ||
    `# Python Demonstration: Ohm's Law & Circuit Simulation\n\ndef calculate_voltage(current_amps, resistance_ohms):\n    """V = I * R (Ohm's Law)"""\n    voltage = current_amps * resistance_ohms\n    return voltage\n\n# Test sample circuit\ncurrent = 2.5   # Amperes\nresistance = 10.0 # Ohms\n\nv = calculate_voltage(current, resistance)\nprint(f"[*] Circuit Status: Closed")\nprint(f"[*] Current (I)    : {current} A")\nprint(f"[*] Resistance (R) : {resistance} Ω")\nprint(f"[+] Total Voltage  : {v:.2f} Volts")`;

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);

    // Simulate realistic execution timing & terminal stream
    setTimeout(() => {
      setIsRunning(false);
      const simulatedDuration = (Math.random() * 0.08 + 0.02).toFixed(3);
      setExecTime(simulatedDuration);
      
      // Compute or fallback output
      if (expectedOutput) {
        setOutput(expectedOutput);
      } else {
        setOutput(`[+] Process finished with exit code 0\n[+] Output:\n[*] Circuit Status: Closed\n[*] Current (I)    : 2.5 A\n[*] Resistance (R) : 10.0 Ω\n[+] Total Voltage  : 25.00 Volts`);
      }
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setOutput(null);
    setExecTime(null);
  };

  return (
    <div className="code-runner-container">
      {/* Code Editor Header Bar */}
      <div className="code-runner-header">
        <div className="code-header-left">
          <div className="window-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span className="code-file-name">{title}</span>
          <span className="lang-badge">{language.toUpperCase()}</span>
        </div>

        <div className="code-header-actions">
          <button
            type="button"
            className="code-action-btn"
            onClick={handleCopy}
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            type="button"
            className="run-code-btn"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            <Play size={14} fill={isRunning ? "none" : "currentColor"} className={isRunning ? "spin-icon" : ""} />
            <span>{isRunning ? "Executing..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="code-editor-body">
        <div className="line-numbers">
          {defaultCode.split("\n").map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-content-block">
          <code>{defaultCode}</code>
        </pre>
      </div>

      {/* Simulated Output Terminal */}
      <div className="terminal-output-panel">
        <div className="terminal-header">
          <div className="terminal-title">
            <Terminal size={14} />
            <span>Execution Terminal Output</span>
          </div>
          {execTime && (
            <div className="exec-meta">
              <span>Time: {execTime}s</span>
              <button
                type="button"
                className="clear-term-btn"
                onClick={handleClear}
                title="Clear Output"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="terminal-body">
          {isRunning ? (
            <div className="terminal-loading">
              <Sparkles size={16} className="animate-spin text-indigo-400" />
              <span>Simulating code execution in sandbox environment...</span>
            </div>
          ) : output ? (
            <pre className="terminal-text">{output}</pre>
          ) : (
            <span className="terminal-idle">
              Click <strong>"Run Code"</strong> above to execute the snippet and inspect live output.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
