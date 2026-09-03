import React, { useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Lightbulb, Sparkles } from "lucide-react";

export default function FlashcardViewer({ topic = "Core Concepts", flashcards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState({});

  const defaultCards = flashcards.length > 0 ? flashcards : [
    {
      id: 1,
      tag: "Fundamental Law",
      front: "What is Ohm's Law and under what conditions does it hold true?",
      back: "V = I × R. It states that electric current through a conductor between two points is directly proportional to voltage across the points, provided temperature and physical conditions remain constant.",
      mnemonic: "Remember: V is at the top of the pyramid (V / (I × R)).",
      keyPoint: "Ohmic conductors maintain constant slope on a V-I graph."
    },
    {
      id: 2,
      tag: "Microscopic Intuition",
      front: "What causes electrical Resistance at the atomic level?",
      back: "Collisions between accelerating conduction electrons and the vibrating positive lattice ions of the conductor. As temperature rises, lattice vibrations increase, causing more frequent collisions and higher resistance.",
      mnemonic: "Resistance = Electron traffic jam during lattice vibration.",
      keyPoint: "R = ρ × (L / A)"
    },
    {
      id: 3,
      tag: "Unit & Dimension",
      front: "What is 1 Ohm defined as in terms of SI Base Units?",
      back: "1 Ohm (Ω) is the resistance between two points when a constant potential difference of 1 Volt produces a current of 1 Ampere (1 Ω = 1 V / 1 A = 1 kg·m²·s⁻³·A⁻²).",
      mnemonic: "1 Volt per Ampere = 1 Ohm.",
      keyPoint: "SI symbol: Ω (Greek capital omega)."
    },
    {
      id: 4,
      tag: "Circuit Behavior",
      front: "How does resistance combine in Series vs. Parallel?",
      back: "• Series: R_total = R₁ + R₂ + ... (Current is constant, voltage divides)\n• Parallel: 1/R_total = 1/R₁ + 1/R₂ + ... (Voltage is constant, current divides)",
      mnemonic: "Series stacks up; Parallel provides multiple pathways (smaller total R).",
      keyPoint: "Parallel total is always smaller than the smallest branch."
    }
  ];

  const currentCard = defaultCards[currentIndex] || defaultCards[0];
  const isMastered = !!masteredMap[currentCard.id];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % defaultCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + defaultCards.length) % defaultCards.length);
  };

  const toggleMastered = (e) => {
    e.stopPropagation();
    setMasteredMap((prev) => ({
      ...prev,
      [currentCard.id]: !prev[currentCard.id],
    }));
  };

  const masteredCount = Object.values(masteredMap).filter(Boolean).length;

  return (
    <div className="flashcards-container">
      {/* Top Meta Bar */}
      <div className="flashcard-top-bar">
        <div className="flashcard-title-group">
          <Sparkles size={16} className="text-indigo-400" />
          <span className="flashcard-topic-title">{topic} • Quick Flashcards</span>
        </div>

        <div className="flashcard-stats">
          <span className="card-counter">
            Card {currentIndex + 1} / {defaultCards.length}
          </span>
          <span className="mastered-badge">
            <CheckCircle2 size={13} />
            <span>{masteredCount} Mastered</span>
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className={`flashcard-3d-wrapper ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          {/* FRONT OF CARD */}
          <div className="flashcard-face flashcard-front">
            <div className="card-badge-row">
              <span className="card-tag">{currentCard.tag || "Concept Card"}</span>
              <button
                type="button"
                className={`mastery-toggle-btn ${isMastered ? "mastered" : ""}`}
                onClick={toggleMastered}
                title={isMastered ? "Mastered" : "Mark as Mastered"}
              >
                <Bookmark size={16} />
              </button>
            </div>

            <div className="card-content-center">
              <p className="card-question-text">{currentCard.front}</p>
            </div>

            <div className="card-footer-hint">
              <RotateCw size={14} className="flip-hint-icon" />
              <span>Click or tap to flip & reveal answer</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="flashcard-face flashcard-back">
            <div className="card-badge-row">
              <span className="card-tag back-tag">Key Explanation</span>
              <button
                type="button"
                className={`mastery-toggle-btn ${isMastered ? "mastered" : ""}`}
                onClick={toggleMastered}
                title={isMastered ? "Mastered" : "Mark as Mastered"}
              >
                <Bookmark size={16} />
              </button>
            </div>

            <div className="card-content-center back-content">
              <p className="card-answer-text">{currentCard.back}</p>

              {currentCard.mnemonic && (
                <div className="mnemonic-box">
                  <Lightbulb size={14} className="text-amber-400" />
                  <span>{currentCard.mnemonic}</span>
                </div>
              )}
            </div>

            <div className="card-footer-hint">
              <RotateCw size={14} className="flip-hint-icon" />
              <span>Click to flip back to question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flashcard-nav-controls">
        <button
          type="button"
          className="fc-nav-btn"
          onClick={handlePrev}
          disabled={defaultCards.length <= 1}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          className={`mark-master-btn ${isMastered ? "mastered" : ""}`}
          onClick={toggleMastered}
        >
          <CheckCircle2 size={16} />
          <span>{isMastered ? "Mastered (Completed)" : "Mark as Understood"}</span>
        </button>

        <button
          type="button"
          className="fc-nav-btn"
          onClick={handleNext}
          disabled={defaultCards.length <= 1}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
