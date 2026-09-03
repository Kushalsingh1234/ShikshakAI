import React, { useState } from "react";
import { Mic, MicOff, Send, HelpCircle, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { evaluateAnswer } from "../services/api";

export default function InteractionModal({ step, language = "en", onAnswerEvaluated, onNextStep }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Browser Speech-to-Text via Web Speech API (100% Free, zero external cost)
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

  const handleSubmit = async (answer) => {
    const finalAnswer = answer || selectedOption || typedAnswer;
    if (!finalAnswer) return;

    setIsSubmitting(true);
    try {
      const result = await evaluateAnswer({
        question: step.question || "",
        student_answer: finalAnswer,
        correct_answer: step.correct_answer || "",
        misconception_guide: step.misconception_guide,
        language,
      });
      setEvalResult(result);
      if (onAnswerEvaluated) {
        onAnswerEvaluated(result);
      }
    } catch (err) {
      alert("Evaluation failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="interaction-modal-overlay">
      <div className="interaction-modal">
        <div className="interaction-header">
          <div className="tag-pulse">
            <HelpCircle size={18} />
            <span>Teacher Checkpoint Question</span>
          </div>
          <span className="checkpoint-note">Check your intuition</span>
        </div>

        <h3 className="question-title">{step.question}</h3>

        {/* Options List if provided */}
        {step.options && (
          <div className="options-grid">
            {step.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-card ${selectedOption === opt ? "selected" : ""}`}
                onClick={() => {
                  setSelectedOption(opt);
                  handleSubmit(opt);
                }}
                disabled={isSubmitting || evalResult}
              >
                <span className="option-index">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Voice & Free-text Student Input */}
        <div className="answer-input-container">
          <input
            type="text"
            className="text-answer-input"
            placeholder="Or type your thoughts or answer here..."
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            disabled={isSubmitting || evalResult}
          />
          <button
            type="button"
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleSpeechRecognition}
            title="Speak your answer"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            type="button"
            className="submit-answer-btn"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || evalResult || (!selectedOption && !typedAnswer)}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Dynamic Misconception & Feedback Display */}
        {evalResult && (
          <div className={`eval-result-card ${evalResult.is_correct ? "correct" : "misconception"}`}>
            <div className="eval-result-header">
              {evalResult.is_correct ? (
                <>
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span className="eval-heading">Concept Understood!</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={20} className="text-amber-400" />
                  <span className="eval-heading">Misconception Detected!</span>
                </>
              )}
            </div>
            <p className="eval-feedback">{evalResult.feedback}</p>

            <button className="continue-lesson-btn" onClick={onNextStep}>
              <span>Continue Lesson</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
