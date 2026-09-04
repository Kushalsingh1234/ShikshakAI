import React, { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Code2,
  Sigma,
  Layers,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Mic,
  MicOff,
  Send,
  Lightbulb,
  FileText,
  Presentation,
} from "lucide-react";
import CodeDemoViewer from "./CodeDemoViewer";
import FormulaDerivationViewer from "./FormulaDerivationViewer";
import FlashcardViewer from "./FlashcardViewer";
import { evaluateAnswer } from "../services/api";

export default function SmartBoard({
  visual,
  step,
  lessonTitle,
  currentStep,
  totalSteps,
  language = "en",
  onAnswerEvaluated,
  onNextStep,
  onOpenNotes,
}) {
  const mathRef = useRef(null);
  const mermaidRef = useRef(null);
  const [activeTab, setActiveTab] = useState("auto"); // "auto", "slides", "code", "derivation", "flashcards"

  // Checkpoint Interaction State
  const [selectedOption, setSelectedOption] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
  }, []);

  // Reset interactive state when step changes
  useEffect(() => {
    setSelectedOption("");
    setTypedAnswer("");
    setEvalResult(null);
    setIsSubmitting(false);
    setActiveTab("auto");
  }, [step, currentStep]);

  // Render KaTeX Math equations for simple katex visual
  useEffect(() => {
    if (visual?.type === "katex" && mathRef.current && (activeTab === "auto" || activeTab === "slides")) {
      try {
        katex.render(visual.content, mathRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
      }
    }
  }, [visual, activeTab]);

  // Render Mermaid diagrams
  useEffect(() => {
    if (visual?.type === "mermaid" && mermaidRef.current && (activeTab === "auto" || activeTab === "slides")) {
      mermaidRef.current.innerHTML = "";
      const uniqueId = "mermaid-" + Math.random().toString(36).substring(2, 9);
      mermaid
        .render(uniqueId, visual.content)
        .then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid diagram render error:", err);
        });
    }
  }, [visual, activeTab]);

  // Speech Recognition for Checkpoint
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTypedAnswer(transcript);
    };

    recognition.start();
  };

  const handleCheckpointSubmit = async (answer) => {
    const finalAnswer = answer || selectedOption || typedAnswer;
    if (!finalAnswer) return;

    const questionText = step?.question || step?.interaction?.question || "Checkpoint Question";
    const correctAnswer = step?.correct_answer || step?.interaction?.correct_answer || "";
    const misconceptionGuide = step?.misconception_guide || step?.interaction?.misconception_guide || "";

    setIsSubmitting(true);
    try {
      const result = await evaluateAnswer({
        question: questionText,
        student_answer: finalAnswer,
        correct_answer: correctAnswer,
        misconception_guide: misconceptionGuide,
        language,
      });
      setEvalResult(result);
      if (onAnswerEvaluated) {
        onAnswerEvaluated(result);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      // Resilient fallback evaluation
      const normStudent = finalAnswer.toLowerCase().trim();
      const normCorrect = correctAnswer.toLowerCase().trim();
      const isCorrect = normStudent === normCorrect || normStudent.includes(normCorrect) || normCorrect.includes(normStudent);
      const fallbackResult = {
        is_correct: isCorrect,
        misconception_detected: !isCorrect,
        detected_misconception: isCorrect ? null : misconceptionGuide,
        feedback: isCorrect
          ? `Spot on! "${finalAnswer}" is completely correct.`
          : `Not quite. ${misconceptionGuide || "Review the governing principle and try again."}`,
        adaptive_action: isCorrect ? "proceed" : "re_explain_with_analogy",
      };
      setEvalResult(fallbackResult);
      if (onAnswerEvaluated) {
        onAnswerEvaluated(fallbackResult);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckpoint = step?.step_type === "checkpoint" || !!step?.question || !!step?.interaction?.question;
  const questionText = step?.question || step?.interaction?.question;
  const optionsList = step?.options || step?.interaction?.options;

  return (
    <div className="smartboard-card">
      <div className="smartboard-header">
        <div className="smartboard-title-group">
          <BookOpen size={18} className="text-indigo-400" />
          <h3 className="smartboard-title">{lessonTitle || "Interactive Smartboard"}</h3>
        </div>

        {/* View Mode Switching Tabs */}
        <div className="smartboard-tabs">
          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "auto" ? "active" : ""}`}
            onClick={() => setActiveTab("auto")}
            title="Current Lesson Visual"
          >
            <Sparkles size={13} />
            <span>{isCheckpoint ? "Live Checkpoint" : "Lesson Visual"}</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "slides" ? "active" : ""}`}
            onClick={() => setActiveTab("slides")}
            title="Slide Presentation Mode"
          >
            <Presentation size={13} />
            <span>Slide Deck</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
            title="Interactive Code Runner"
          >
            <Code2 size={13} />
            <span>Code Sandbox</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "derivation" ? "active" : ""}`}
            onClick={() => setActiveTab("derivation")}
            title="Step-by-Step Derivation"
          >
            <Sigma size={13} />
            <span>Derivations</span>
          </button>

          <button
            type="button"
            className={`smartboard-tab-btn ${activeTab === "flashcards" ? "active" : ""}`}
            onClick={() => setActiveTab("flashcards")}
            title="Revision Flashcards"
          >
            <Layers size={13} />
            <span>Flashcards</span>
          </button>

          {onOpenNotes && (
            <button
              type="button"
              className="smartboard-tab-btn notes-tab"
              onClick={onOpenNotes}
              title="Open full study notes & download guide"
            >
              <FileText size={13} />
              <span>Study Notes</span>
            </button>
          )}
        </div>

        <div className="step-progress-badge">
          Step {currentStep || 1} of {totalSteps || 4}
        </div>
      </div>

      <div className="smartboard-canvas">
        {activeTab === "code" ? (
          <CodeDemoViewer
            codeSnippet={visual?.type === "code" ? visual.content : undefined}
            title={visual?.title || `${lessonTitle || "Concept"} Code Simulation`}
          />
        ) : activeTab === "derivation" ? (
          <FormulaDerivationViewer
            title={visual?.title || `${lessonTitle || "Topic"} Mathematical Derivation`}
          />
        ) : activeTab === "flashcards" ? (
          <FlashcardViewer topic={lessonTitle || "Key Topic"} />
        ) : activeTab === "slides" ? (
          /* Slide Deck Presentation Mode */
          <div className="slide-deck-container">
            <div className="slide-deck-header">
              <span className="slide-tag">SLIDE {currentStep} OF {totalSteps}</span>
              <h3 className="slide-deck-title">{visual?.title || `${lessonTitle} — Conceptual Slide`}</h3>
              <span className="slide-phase-pill capitalize">{step?.step_type || "Lecture"}</span>
            </div>

            <div className="slide-deck-body">
              <div className="slide-concept-highlight">
                <Lightbulb size={20} className="text-amber-400" />
                <p>"{step?.teacher_script || "Core concept lecture overview."}"</p>
              </div>

              {visual?.type === "katex" && (
                <div className="formula-display-box" ref={mathRef}></div>
              )}
              {visual?.type === "mermaid" && (
                <div className="diagram-display-box" ref={mermaidRef}></div>
              )}
              {visual?.type === "code" && (
                <pre className="slide-code-preview"><code>{visual.content}</code></pre>
              )}
              {visual?.type === "bullet_points" && (
                <div className="bullet-points-box">
                  {visual.content.split("\n").map((line, idx) => (
                    <div key={idx} className="bullet-item">
                      <CheckCircle2 size={16} className="bullet-check" />
                      <span>{line.replace(/^[0-9]+\.\s*|\•\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="slide-deck-footer">
              <span className="slide-footer-hint">ShikshakAI Interactive Slide Deck • {lessonTitle}</span>
              {onNextStep && currentStep < totalSteps && (
                <button type="button" className="slide-next-btn" onClick={onNextStep}>
                  <span>Next Slide</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : isCheckpoint && questionText ? (
          /* Live Checkpoint Arena directly on the Blackboard! */
          <div className="smartboard-checkpoint-arena">
            <div className="checkpoint-banner">
              <div className="checkpoint-pulse-tag">
                <HelpCircle size={17} />
                <span>Active Concept Checkpoint</span>
              </div>
              <span className="checkpoint-hint">Test your intuition and get instant adaptive feedback</span>
            </div>

            <h3 className="checkpoint-main-question">{questionText}</h3>

            {/* Options Grid */}
            {optionsList && optionsList.length > 0 && (
              <div className="checkpoint-options-grid">
                {optionsList.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`checkpoint-option-card ${selectedOption === opt ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedOption(opt);
                      handleCheckpointSubmit(opt);
                    }}
                    disabled={isSubmitting || !!evalResult}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="option-title">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Student Free-text / Voice Input */}
            <div className="checkpoint-input-row">
              <input
                type="text"
                className="checkpoint-text-input"
                placeholder="Or type your thoughts / reasoning here..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting && !evalResult) {
                    handleCheckpointSubmit();
                  }
                }}
                disabled={isSubmitting || !!evalResult}
              />
              <button
                type="button"
                className={`checkpoint-mic-btn ${isListening ? "active" : ""}`}
                onClick={toggleSpeechRecognition}
                title="Speak answer via microphone"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                className="checkpoint-submit-btn"
                onClick={() => handleCheckpointSubmit()}
                disabled={isSubmitting || !!evalResult || (!selectedOption && !typedAnswer)}
              >
                <Send size={16} />
                <span>{isSubmitting ? "Diagnosing..." : "Submit Answer"}</span>
              </button>
            </div>

            {/* Dynamic AI Diagnostic Result */}
            {evalResult && (
              <div className={`checkpoint-eval-card ${evalResult.is_correct ? "correct" : "misconception"}`}>
                <div className="eval-card-header">
                  {evalResult.is_correct ? (
                    <>
                      <CheckCircle2 size={22} className="text-emerald-400" />
                      <h4>Concept Mastered!</h4>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={22} className="text-amber-400" />
                      <h4>Learning Opportunity & Intuition Guide</h4>
                    </>
                  )}
                </div>
                <p className="eval-card-feedback">{evalResult.feedback}</p>
                {onNextStep && (
                  <button type="button" className="eval-continue-btn" onClick={onNextStep}>
                    <span>Continue to Next Step</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : visual ? (
          <div className="visual-container">
            <h4 className="visual-title">{visual.title}</h4>

            {visual.type === "katex" && (
              <div className="formula-display-box" ref={mathRef}></div>
            )}

            {visual.type === "mermaid" && (
              <div className="diagram-display-box" ref={mermaidRef}></div>
            )}

            {visual.type === "bullet_points" && (
              <div className="bullet-points-box">
                {visual.content.split("\n").map((line, idx) => (
                  <div key={idx} className="bullet-item">
                    <CheckCircle2 size={16} className="bullet-check" />
                    <span>{line.replace(/^[0-9]+\.\s*|\•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            )}

            {visual.type === "code" && (
              <CodeDemoViewer
                codeSnippet={visual.content}
                title={visual.title}
                language={visual.language || "python"}
              />
            )}

            {visual.type === "formula_derivation" && (
              <FormulaDerivationViewer
                title={visual.title}
                steps={visual.steps}
                finalFormula={visual.final_formula}
              />
            )}

            {visual.type === "flashcards" && (
              <FlashcardViewer
                topic={lessonTitle}
                flashcards={visual.cards}
              />
            )}
          </div>
        ) : (
          /* Step Highlight Board when no visual is set */
          <div className="step-highlight-board">
            <div className="highlight-icon-wrap">
              <Lightbulb size={36} />
            </div>
            <h4>{step?.teacher_script ? "Conceptual Exploration" : "Interactive Smartboard Active"}</h4>
            <p className="step-highlight-script">
              {step?.teacher_script || "Listen carefully to the teacher explanation and follow along on the blackboard."}
            </p>
            <div className="step-highlight-tags">
              <span className="step-pill">Topic: {lessonTitle}</span>
              <span className="step-pill">Step {currentStep} of {totalSteps}</span>
              <span className="step-pill capitalize">Phase: {step?.step_type || "Lecture"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
