import React, { useState } from "react";
import { HelpCircle, Send, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, Code, Terminal, Eye } from "lucide-react";
import katex from "katex";

export default function CheckpointStage({
  question = "If 2x + 4 = 10, what is the value of x?",
  options = ["x = 3", "x = 2", "x = 7", "x = 5"],
  visual = null,
  topic = "",
  onSubmitAnswer,
  isEvaluating = false,
  teacherName = "Dr. Maya",
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
    setTypedAnswer("");
  };

  const handleToggleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please select an option or type your reasoning!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTypedAnswer(transcript);
        setSelectedOption("");
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAnswer = selectedOption || typedAnswer.trim();
    if (!finalAnswer) return;
    onSubmitAnswer && onSubmitAnswer(finalAnswer);
  };

  const hasAnswer = Boolean(selectedOption || typedAnswer.trim());

  // Render KaTeX HTML safely if applicable
  const renderMathContent = (rawLatex) => {
    try {
      return {
        __html: katex.renderToString(rawLatex, {
          throwOnError: false,
          displayMode: true,
        }),
      };
    } catch (err) {
      return { __html: rawLatex };
    }
  };

  const hasVisual = visual && visual.content && visual.content.trim().length > 0;
  const isCodeVisual = visual?.type === "code" || visual?.content?.includes("#include") || visual?.content?.includes("def ") || visual?.content?.includes("int ");
  const isKatexVisual = visual?.type === "katex" || visual?.content?.includes("\\begin") || visual?.content?.includes("\\frac");

  return (
    <div className="checkpoint-arena-stage">
      <div className="checkpoint-card">
        <div className="checkpoint-tag-badge">
          <HelpCircle size={15} className="tag-icon" />
          <span>YOUR TURN • CONCEPT CHECKPOINT</span>
        </div>

        <h2 className="checkpoint-question-title">{question}</h2>
        <p className="checkpoint-prompt-sub">
          {teacherName} has paused the lesson. Inspect the visual context below, then select an answer.
        </p>

        {/* Visual Inspection Context Card */}
        {hasVisual && (
          <div className="checkpoint-visual-preview">
            <div className="checkpoint-visual-header">
              {isCodeVisual ? <Terminal size={14} /> : <Eye size={14} />}
              <span>{visual.title || "Visual Inspection Context"}</span>
            </div>
            {isCodeVisual ? (
              <pre className="checkpoint-visual-code">
                <code>{visual.content}</code>
              </pre>
            ) : isKatexVisual ? (
              <div
                className="checkpoint-visual-math"
                dangerouslySetInnerHTML={renderMathContent(visual.content)}
              />
            ) : (
              <div className="checkpoint-visual-text">
                {visual.content}
              </div>
            )}
          </div>
        )}

        {/* 4 Interactive Option Cards */}
        {options && options.length > 0 && (
          <div className="checkpoint-options-grid">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === opt;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`checkpoint-option-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isEvaluating}
                >
                  <div className="option-letter-badge">{letter}</div>
                  <div className="option-text-content">{opt}</div>
                  {isSelected && <div className="option-check-indicator" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Alternative: Typed reasoning / Speech input */}
        <form className="checkpoint-input-row" onSubmit={handleSubmit}>
          <div className="reasoning-input-wrap">
            <input
              type="text"
              className="reasoning-input"
              placeholder="Or type your reasoning / step here..."
              value={typedAnswer}
              onChange={(e) => {
                setTypedAnswer(e.target.value);
                setSelectedOption("");
              }}
              disabled={isEvaluating}
            />
            <button
              type="button"
              className={`mic-speech-btn ${isListening ? "is-recording" : ""}`}
              onClick={handleToggleMic}
              title={isListening ? "Listening... Click to stop" : "Say answer out loud"}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          </div>

          <button
            type="submit"
            className="checkpoint-submit-btn"
            disabled={!hasAnswer || isEvaluating}
          >
            {isEvaluating ? (
              <>
                <span className="submit-spinner" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
