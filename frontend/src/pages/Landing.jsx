import React, { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./Landing.css";

/* ------------------------------------------------------------------ *
 * The eight moves a teacher makes. This genuinely is a sequence, and
 * step 7 returns to step 3 — the loop back is the whole argument.
 * ------------------------------------------------------------------ */
const TEACHING_LOOP = [
  { n: 1, name: "Understand", line: "Reads your level, your language, and how much time you have." },
  { n: 2, name: "Plan", line: "Orders the concepts so each one rests on the one before it." },
  { n: 3, name: "Explain", line: "Says the idea out loud in a neural voice, instead of printing a wall of text." },
  { n: 4, name: "Demonstrate", line: "Writes the formula, draws the circuit, runs the code." },
  { n: 5, name: "Question", line: "Stops mid-lesson and asks. Multiple choice, short answer, or say it aloud." },
  { n: 6, name: "Evaluate", line: "Checks the answer against the concept, not against a string." },
  { n: 7, name: "Adapt", line: "Names the misconception and reaches for a different analogy.", loops: true },
  { n: 8, name: "Continue", line: "Confirms the idea landed before it moves on." },
];

const FACULTY = [
  {
    id: "maya",
    name: "Dr. Maya",
    subject: "Physics and mathematics",
    manner: "Analytical. Asks before she tells.",
    opener: "Let's take this apart and see what it rests on.",
  },
  {
    id: "alex",
    name: "Prof. Alex",
    subject: "Computer science",
    manner: "Hands-on. Traces the code line by line.",
    opener: "Run it, break it, then we'll talk about why.",
  },
  {
    id: "ananya",
    name: "Ananya Ma'am",
    subject: "Humanities and Hindi",
    manner: "Story-led. Builds the context first.",
    opener: "नमस्ते। पहले संदर्भ, फिर अर्थ।",
  },
];

const DURATIONS = [
  { t: "5 min", shape: "One idea, the shortest honest path to it." },
  { t: "20 min", shape: "Four to six concepts, worked examples, two checkpoints." },
  { t: "60 min", shape: "Full derivations, harder problems, an assessment at the end." },
  { t: "7 days", shape: "A revision plan with a task for each day." },
];

/* 5-step derivation walkthrough for the mathematics panel */
const DERIVATION_STEPS = [
  {
    step: 1,
    title: "1. Drift Velocity",
    primary: "v_d = \\frac{e E \\tau}{m}",
    faint: "E = \\frac{V}{L}",
    note: "Electrons accelerate under electric field E until relaxation collision time \\tau."
  },
  {
    step: 2,
    title: "2. Current Density",
    primary: "j = n e v_d",
    faint: "v_d = \\frac{e E \\tau}{m}",
    note: "Charge carrier density n times unit charge e times electron drift velocity."
  },
  {
    step: 3,
    title: "3. Conductor Current",
    primary: "I = j A = n A e v_d",
    faint: "j = \\frac{I}{A}",
    note: "Integrated over the cross-sectional area A of the conductor."
  },
  {
    step: 4,
    title: "4. Field to Potential",
    primary: "I = \\left(\\frac{n A e^2 \\tau}{m L}\\right) V",
    faint: "E = \\frac{V}{L}",
    note: "Substituting microscopic field E with macroscopic voltage V across length L."
  },
  {
    step: 5,
    title: "5. Ohm's Law Resolved",
    primary: "V = I \\cdot R",
    faint: "R = \\frac{m L}{n A e^2 \\tau}",
    note: "Resistance R emerges from material properties and atomic collisions."
  }
];

/* KaTeX in chalk */
function Formula({ tex, block = true, className = "" }) {
  const host = useRef(null);
  useEffect(() => {
    if (!host.current) return;
    katex.render(tex, host.current, { throwOnError: false, displayMode: block });
  }, [tex, block]);
  return <div ref={host} className={`lp-formula ${className}`} />;
}

/* Single-stroke chalk circuit with traveling current animation on hover/idle */
function ChalkCircuit() {
  return (
    <svg className="lp-diagram lp-circuit-svg" viewBox="0 0 240 140" role="img" aria-label="A cell driving current through a resistor">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {/* Base circuit wire */}
        <path d="M30 34 L30 76 M30 94 L30 110" />
        <path d="M18 76 L42 76" strokeWidth="2.6" />
        <path d="M24 94 L36 94" strokeWidth="2.6" />
        <path d="M30 34 L95 34" />
        <path d="M95 34 l5 -11 l9 22 l9 -22 l9 22 l9 -22 l4 11 L145 34" />
        <path d="M145 34 L210 34 L210 110 L30 110" />
        
        {/* Subtle current traveling flow overlay */}
        <path 
          d="M30 34 L95 34 l5 -11 l9 22 l9 -22 l9 22 l9 -22 l4 11 L145 34 L210 34 L210 110 L30 110 L30 34" 
          className="lp-circuit-flow" 
          stroke="var(--haldi)" 
          strokeWidth="1.8" 
          strokeDasharray="6 14"
        />

        {/* Current arrow */}
        <path d="M196 58 l0 18 M191 70 l5 7 l5 -7" className="lp-circuit-arrow" strokeWidth="1.5" />
      </g>
      <text x="48" y="92" className="lp-diagram-label">V</text>
      <text x="112" y="16" className="lp-diagram-label">R</text>
      <text x="180" y="72" className="lp-diagram-label">I</text>
    </svg>
  );
}

/* One chalk diagram per teacher with live interactive micro-animations */
function ChalkPortrait({ variant }) {
  if (variant === "alex") {
    return (
      <svg className="lp-portrait lp-diagram lp-diagram-sm lp-alex-svg" viewBox="0 0 200 120" role="img" aria-label="Three steps of execution flow">
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="30" cy="52" r="14" className="lp-node lp-node-1" />
          <circle cx="100" cy="52" r="14" className="lp-node lp-node-2" />
          <circle cx="170" cy="52" r="14" className="lp-node lp-node-3" />
          <path d="M46 52 L82 52 M76 47 l6 5 l-6 5" className="lp-arrow lp-arrow-1" />
          <path d="M116 52 L152 52 M146 47 l6 5 l-6 5" className="lp-arrow lp-arrow-2" />
          <path d="M168 70 q-68 34 -136 4 M38 68 l-6 8 l9 3" className="lp-arrow lp-arrow-back" opacity=".6" />
        </g>
      </svg>
    );
  }

  if (variant === "ananya") {
    return (
      <svg className="lp-portrait lp-diagram lp-diagram-sm lp-ananya-svg" viewBox="0 0 200 120" role="img" aria-label="A narrative arc over a timeline">
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M24 88 L176 88" className="lp-timeline" />
          <path d="M46 88 l0 8 M100 88 l0 8 M154 88 l0 8" />
          <path d="M30 74 q42 -58 70 -16 q26 40 70 -22" className="lp-wave" opacity=".85" />
          <circle cx="46" cy="52" r="3" className="lp-wave-dot lp-wave-dot-1" fill="currentColor" stroke="none" />
          <circle cx="100" cy="58" r="3" className="lp-wave-dot lp-wave-dot-2" fill="currentColor" stroke="none" />
          <circle cx="154" cy="42" r="3" className="lp-wave-dot lp-wave-dot-3" fill="currentColor" stroke="none" />
        </g>
      </svg>
    );
  }

  // Dr. Maya: a V–I characteristic with live animated plotting point
  return (
    <svg className="lp-portrait lp-diagram lp-diagram-sm lp-maya-svg" viewBox="0 0 200 120" role="img" aria-label="A current against voltage graph rising in a straight line">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M32 96 L32 18 M32 96 L178 96" />
        <path d="M32 14 l-4 8 l8 0 Z" fill="currentColor" stroke="none" />
        <path d="M182 96 l-8 -4 l0 8 Z" fill="currentColor" stroke="none" />
        <path d="M38 90 L152 26" className="lp-vi-line" strokeWidth="1.9" />
        <path d="M32 58 l7 0 M96 96 l0 -7" opacity=".55" />
        <circle cx="95" cy="58" r="3.5" className="lp-vi-point" fill="var(--haldi)" stroke="none" />
      </g>
      <text x="8" y="24" className="lp-diagram-label" fill="currentColor" fontSize="13">I</text>
      <text x="180" y="118" className="lp-diagram-label" fill="currentColor" fontSize="13">V</text>
    </svg>
  );
}

/* The Mathematics derivation interactive stepper */
function DerivationStepper() {
  const [currIndex, setCurrIndex] = useState(2); // Starts at Step 3 of 5 as in original design
  const step = DERIVATION_STEPS[currIndex];

  return (
    <div className="lp-derivation-stepper">
      <div className="lp-derivation-head">
        <div className="lp-derivation-pills" role="tablist" aria-label="Derivation steps">
          {DERIVATION_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              role="tab"
              aria-selected={idx === currIndex}
              className={`lp-step-pill ${idx === currIndex ? "is-active" : ""}`}
              onClick={() => setCurrIndex(idx)}
              title={`Jump to ${s.title}`}
            >
              {s.step}
            </button>
          ))}
        </div>
        <span className="lp-show-step">Step {step.step} of 5</span>
      </div>

      <div className="lp-derivation-display">
        <Formula tex={step.primary} className="lp-formula-lg lp-derivation-primary" />
        {step.faint && (
          <Formula tex={step.faint} className="lp-formula-md lp-chalk-faint lp-derivation-faint" />
        )}
      </div>

      <div className="lp-derivation-nav">
        <button
          type="button"
          className="lp-nav-btn"
          disabled={currIndex === 0}
          onClick={() => setCurrIndex((prev) => Math.max(0, prev - 1))}
          aria-label="Previous derivation step"
        >
          ← Prev
        </button>
        <span className="lp-step-caption">{step.note}</span>
        <button
          type="button"
          className="lp-nav-btn"
          disabled={currIndex === DERIVATION_STEPS.length - 1}
          onClick={() => setCurrIndex((prev) => Math.min(DERIVATION_STEPS.length - 1, prev + 1))}
          aria-label="Next derivation step"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* The Orchestrated Wrong-Answer Exchange Set-Piece */
function WrongAnswerExchange() {
  const [phase, setPhase] = useState(0); // 0: unobserved, 1: question, 2: typing, 3: pause, 4: red correction, 5: cta ready
  const [typedText, setTypedText] = useState("");
  const [pivoted, setPivoted] = useState(false);
  const containerRef = useRef(null);
  const fullAnswer = "Current increases.";

  // Viewport trigger using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && phase === 0) {
          startSequence();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [phase]);

  const startSequence = () => {
    setPhase(1);
    setTypedText("");
    setPivoted(false);

    // 1. Question appears, then after 600ms typing begins
    setTimeout(() => {
      setPhase(2);
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx++;
        setTypedText(fullAnswer.slice(0, charIdx));
        if (charIdx >= fullAnswer.length) {
          clearInterval(typeInterval);
          // 2. Pause reading beat (850ms)
          setPhase(3);
          setTimeout(() => {
            // 3. Red correction resolves
            setPhase(4);
            // 4. CTA button activates after correction registers
            setTimeout(() => {
              setPhase(5);
            }, 600);
          }, 850);
        }
      }, 55);
    }, 600);
  };

  const handleReplay = (e) => {
    e.preventDefault();
    startSequence();
  };

  return (
    <div className="lp-board" ref={containerRef}>
      {/* Turn 1: Teacher's Question */}
      <div className={`lp-turn lp-turn-teacher ${phase >= 1 ? "is-visible" : "is-pending"}`}>
        <span className="lp-who">Dr. Maya</span>
        <p>What happens to current if resistance increases while voltage stays constant?</p>
      </div>

      {/* Turn 2: Student Answer with typing cadence */}
      <div className={`lp-turn lp-turn-student ${phase >= 2 ? "is-visible" : "is-pending"}`}>
        <span className="lp-who">You</span>
        <p className="lp-typing-line">
          {typedText || (phase >= 3 ? fullAnswer : "")}
          {phase === 2 && <span className="lp-typing-cursor" aria-hidden="true">|</span>}
        </p>
      </div>

      {/* Turn 3: Red Pen Correction */}
      <div className={`lp-turn lp-turn-mark ${phase >= 4 ? "is-visible" : "is-pending"}`}>
        <div className="lp-turn-mark-header">
          <span className="lp-who">Marked in red</span>
          <span className="lp-correction-badge">Misconception detected</span>
        </div>
        <p>
          Reading <span className="lp-inline-tex">V = I·R</span> as though I rises with R.
          R is a divisor, not a multiplier.
        </p>
      </div>

      {/* Turn 4: CTA Action and Expansion */}
      {!pivoted ? (
        <div className={`lp-action-wrap ${phase >= 5 ? "is-active" : "is-inactive"}`}>
          <button
            type="button"
            className="lp-reveal lp-btn-press"
            onClick={() => setPivoted(true)}
            disabled={phase < 5}
          >
            Show what she does next
          </button>
          {phase >= 4 && (
            <button type="button" className="lp-replay-link" onClick={handleReplay}>
              ↺ Replay exchange
            </button>
          )}
        </div>
      ) : (
        <div className="lp-pivot">
          <div className="lp-turn lp-turn-teacher">
            <span className="lp-who">Dr. Maya</span>
            <p>
              Don't take my word for it, rearrange it. R sits underneath, so as R grows the
              whole fraction shrinks.
            </p>
            <Formula tex="I = \frac{V}{R}" className="lp-formula-lg lp-formula-inset" />
            <p>
              Picture a water pipe. Squeeze it and less water gets through each second, even
              though the pump is pushing exactly as hard as before. Resistance is the squeeze.
            </p>
          </div>
          <div className="lp-turn lp-turn-teacher lp-turn-again">
            <span className="lp-who">Dr. Maya asks again</span>
            <p>So if I triple R and leave V alone, what happens to I?</p>
          </div>
          <p className="lp-pivot-note">
            Same concept, different analogy, then a fresh question to check it took. The
            lesson doesn't move on until it does.
          </p>
          <div className="lp-pivot-actions">
            <button type="button" className="lp-replay-link" onClick={handleReplay}>
              ↺ Replay this exchange from the start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Landing({ onStart }) {
  // The board is the page while you're here.
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f8fafc";
    document.documentElement.classList.add("lp-on");
    return () => {
      document.body.style.backgroundColor = prev;
      document.documentElement.classList.remove("lp-on");
    };
  }, []);

  const jump = (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lp">
      <div className="lp-grain" aria-hidden="true" />

      {/* ---------------------------------------------------------- */}
      <nav className="lp-rail">
        <a className="lp-mark" href="#top">
          <span className="lp-mark-deva">शिक्षक</span>
          <span className="lp-mark-latin">ShikshakAI</span>
        </a>
        <div className="lp-rail-links">
          <a href="#teaching" onClick={jump("teaching")}>How it teaches</a>
          <a href="#adapting" onClick={jump("adapting")}>When you're wrong</a>
          <a href="#faculty" onClick={jump("faculty")}>The faculty</a>
        </div>
        <button type="button" className="lp-btn lp-btn-solid lp-rail-cta lp-btn-press" onClick={onStart}>
          Start a lesson
        </button>
      </nav>

      {/* ---------------------------------------------------------- */}
      <header className="lp-hero" id="top">
        <h1 className="lp-headline">
          A teacher that notices
          <br />
          you didn't get it.
        </h1>

        <div className="lp-hero-grid">
          <div className="lp-hero-say">
            <p className="lp-lede">
              Give it a topic, or hand it your own textbook. It plans a lesson, teaches it out
              loud with diagrams and formulas, stops to ask you questions, and re-explains
              whatever didn't land. It teaches in English, Hindi, and Hinglish.
            </p>
            <div className="lp-hero-do">
              <button type="button" className="lp-btn lp-btn-solid lp-btn-lg lp-btn-press" onClick={onStart}>
                Start a lesson
              </button>
              <a className="lp-btn lp-btn-quiet lp-btn-lg lp-btn-press" href="#adapting" onClick={jump("adapting")}>
                See it change tack
              </a>
            </div>
          </div>

          {/* The hero V = I·R panel resolves in on load */}
          <div className="lp-hero-board">
            <div className="lp-write">
              <p className="lp-write-row lp-chalk-faint">Given a constant temperature,</p>
              <Formula tex="V = I \cdot R" className="lp-write-row lp-formula-xl" />
              <Formula tex="I = \frac{V}{R}" className="lp-write-row lp-formula-lg" />
              <p className="lp-write-row lp-underline-haldi">So raise R, and I falls.</p>
              <p className="lp-write-row lp-margin-note">
                “current increases” — the slip almost everyone makes here
              </p>
            </div>
          </div>
        </div>

        {/* Chalk tray: also the palette legend */}
        <div className="lp-tray">
          <div className="lp-tray-ledge">
            <span className="lp-stick lp-stick-white"><i /> explains</span>
            <span className="lp-stick lp-stick-haldi"><i /> emphasises</span>
            <span className="lp-stick lp-stick-red"><i /> corrects</span>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      <section className="lp-section" id="teaching">
        <div className="lp-section-head">
          <h2 className="lp-h2">Eight moves a teacher makes and a chatbot skips</h2>
          <p className="lp-sub">
            Ask a chatbot a question and it answers. That's one move. Teaching is the
            other seven, and the seventh is the one that matters: it goes back.
          </p>
        </div>

        <ol className="lp-loop">
          {TEACHING_LOOP.map((step) => (
            <li key={step.n} className={`lp-move ${step.loops ? "is-pivot" : ""}`} tabIndex={0}>
              <span className="lp-move-n" aria-hidden="true">{step.n}</span>
              <h3 className="lp-move-name">{step.name}</h3>
              <p className="lp-move-line">{step.line}</p>
              {step.loops && (
                <span className="lp-move-back">
                  <svg viewBox="0 0 60 26" className="lp-loop-path" aria-hidden="true">
                    <path className="lp-loop-arc" d="M56 20 q-26 -20 -50 -6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path className="lp-loop-arrow" d="M6 14 l0 8 m0 -8 l8 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  back to Explain, with a new analogy
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="lp-smudge" aria-hidden="true" />

        <div className="lp-timetable">
          <h3 className="lp-h3">One topic, four lessons</h3>
          <p className="lp-sub lp-sub-tight">
            Time isn't a slider on the same script. It changes what gets taught at all.
          </p>
          <dl className="lp-times">
            {DURATIONS.map((d) => (
              <div className="lp-time" key={d.t} tabIndex={0}>
                <dt>{d.t}</dt>
                <dd>{d.shape}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      <section className="lp-section lp-section-adapt" id="adapting">
        <div className="lp-section-head">
          <h2 className="lp-h2">When you get it wrong, it changes tack</h2>
          <p className="lp-sub">
            A wrong answer isn't a score. It's a signal about which idea is missing.
            Here is a real exchange from the physics lesson.
          </p>
        </div>

        {/* Fully orchestrated set-piece */}
        <WrongAnswerExchange />
      </section>

      {/* ---------------------------------------------------------- */}
      <section className="lp-section" id="showing">
        <div className="lp-section-head">
          <h2 className="lp-h2">It draws what the subject needs</h2>
          <p className="lp-sub">
            A formula, a circuit, and a function call are three different kinds of thing.
            The board picks the form from the concept rather than printing every subject
            into the same bullet list.
          </p>
        </div>

        <div className="lp-shows">
          <figure className="lp-show lp-show-wide" tabIndex={0}>
            <ChalkCircuit />
            <figcaption>
              <strong>Physics</strong>
              Circuits, forces, and processes as diagrams, drawn live as she narrates them.
            </figcaption>
          </figure>

          <figure className="lp-show" tabIndex={0}>
            <div className="lp-show-body">
              <DerivationStepper />
            </div>
            <figcaption>
              <strong>Mathematics</strong>
              Derivations advance one line at a time, so you can stop where you lost the thread.
            </figcaption>
          </figure>

          <figure className="lp-show lp-show-code" tabIndex={0}>
            <div className="lp-code">
              <pre>{`def current(v, r):
    return v / r

print(current(24, 6))`}</pre>
              <div className="lp-code-out">
                <span>4.0</span>
              </div>
            </div>
            <figcaption>
              <strong>Programming</strong>
              Code with its output underneath, because the output is the explanation.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      <section className="lp-section lp-section-faculty" id="faculty">
        <div className="lp-section-head">
          <h2 className="lp-h2">Three teachers, three tempers</h2>
          <p className="lp-sub">
            Subject matter changes how a thing should be taught, so it changes who teaches it.
            Each has their own voice, pacing, and way into a problem.
          </p>
        </div>

        <div className="lp-faculty">
          {FACULTY.map((t) => (
            <article className="lp-teacher" key={t.id} tabIndex={0}>
              <ChalkPortrait variant={t.id} />
              <h3 className="lp-teacher-name">{t.name}</h3>
              <p className="lp-teacher-subject">{t.subject}</p>
              <p className="lp-teacher-manner">{t.manner}</p>
              <p className="lp-teacher-opener">{t.opener}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      <section className="lp-close">
        <h2 className="lp-close-h">Pick a topic. It will take it from there.</h2>
        <p className="lp-close-p">
          Ohm's law, binary search, Newton's laws, or कबीर के दोहे are ready to go. Or upload a
          PDF, a set of notes, or a deck and it will teach from that instead.
        </p>
        <button type="button" className="lp-btn lp-btn-solid lp-btn-lg lp-btn-press" onClick={onStart}>
          Start a lesson
        </button>
      </section>

      <footer className="lp-foot">
        <p>ShikshakAI, built for the AI Innovation Hackathon 2026.</p>
        <p className="lp-foot-stack">
          Neural voice from Edge-TTS. Mathematics set with KaTeX, diagrams with Mermaid.
          React 19 on the front, FastAPI behind it.
        </p>
      </footer>
    </div>
  );
}
