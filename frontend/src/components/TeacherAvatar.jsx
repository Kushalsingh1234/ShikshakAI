import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, ChevronDown, UserCheck, RotateCcw, FastForward, Volume2 } from "lucide-react";
import { TEACHERS } from "../constants/teachers";

export default function TeacherAvatar({
  scriptText,
  audioUrl,
  isPlaying,
  onAudioEnded,
  currentTeacher = TEACHERS[0],
  onSelectTeacher,
}) {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Direct DOM refs to avoid 60fps React re-renders that cause lag
  const mouthRef = useRef(null);
  const waveBarsRef = useRef([]);

  const [blink, setBlink] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Setup Web Audio API Analyzer for real-time acoustic lip synchronization
  const initAudioAnalyser = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      // Audio already connected or handled natively
    }
  }, []);

  // Sync audio playback and apply playback speed
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => {
          initAudioAnalyser();
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
          }
        })
        .catch((e) => console.log("Audio autoplay notice:", e));
    }
  }, [audioUrl, playbackSpeed, initAudioAnalyser]);

  // High-performance acoustic lip-sync loop using DIRECT DOM updates (0% React lag)
  useEffect(() => {
    if (!isPlaying) {
      if (mouthRef.current) {
        mouthRef.current.setAttribute("ry", "1.5");
        mouthRef.current.setAttribute("rx", "12");
        mouthRef.current.setAttribute("opacity", "0.7");
      }
      waveBarsRef.current.forEach((bar) => {
        if (bar) bar.style.height = "4px";
      });
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateAcousticLipSync = () => {
      let normalized = 0;
      let b1 = 4, b2 = 4, b3 = 4, b4 = 4;

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        normalized = Math.min(1, avg / 70);

        b1 = Math.max(4, Math.min(22, dataArray[1] / 9));
        b2 = Math.max(4, Math.min(22, dataArray[4] / 8));
        b3 = Math.max(4, Math.min(22, dataArray[8] / 8));
        b4 = Math.max(4, Math.min(22, dataArray[12] / 9));
      } else {
        const t = Date.now() / 140;
        normalized = Math.sin(t) > 0.15 ? 0.75 : 0;
        b1 = 8 + Math.sin(t * 2) * 6;
        b2 = 14 + Math.cos(t * 2.5) * 6;
        b3 = 12 + Math.sin(t * 3) * 6;
        b4 = 6 + Math.cos(t * 1.5) * 4;
      }

      // DIRECT DOM UPDATE: No React re-renders = 60fps butter smooth
      if (mouthRef.current) {
        if (normalized > 0.08) {
          mouthRef.current.setAttribute("rx", `${11 + normalized * 5}`);
          mouthRef.current.setAttribute("ry", `${3.5 + normalized * 8.5}`);
          mouthRef.current.setAttribute("opacity", "1");
        } else {
          mouthRef.current.setAttribute("rx", "12");
          mouthRef.current.setAttribute("ry", "1.5");
          mouthRef.current.setAttribute("opacity", "0.6");
        }
      }

      // Update wave bars directly
      if (waveBarsRef.current[0]) waveBarsRef.current[0].style.height = `${b1}px`;
      if (waveBarsRef.current[1]) waveBarsRef.current[1].style.height = `${b2}px`;
      if (waveBarsRef.current[2]) waveBarsRef.current[2].style.height = `${b3}px`;
      if (waveBarsRef.current[3]) waveBarsRef.current[3].style.height = `${b4}px`;

      animationFrameRef.current = requestAnimationFrame(updateAcousticLipSync);
    };

    animationFrameRef.current = requestAnimationFrame(updateAcousticLipSync);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4200);
    return () => clearInterval(blinkInterval);
  }, []);

  const togglePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const replayCurrentSpeech = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log(e));
    }
  };

  const activeTeacher = currentTeacher || TEACHERS[0];

  const renderAvatarSVG = () => {
    if (activeTeacher.avatarKey === "prof_alex") {
      return (
        <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
          <defs>
            <radialGradient id="alexGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hoodieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="alexHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="180" r="160" fill="url(#alexGlow)" />
          <path d="M 70 450 C 80 310, 130 275, 200 275 C 270 275, 320 310, 330 450 Z" fill="url(#hoodieGradient)" />
          <path d="M 170 275 Q 200 320 230 275" fill="#06b6d4" opacity="0.4" />
          <line x1="200" y1="310" x2="200" y2="450" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />

          <rect x="180" y="220" width="40" height="65" rx="8" fill="#fcd34d" />
          <ellipse cx="200" cy="155" rx="86" ry="98" fill="url(#alexHair)" />
          <ellipse cx="200" cy="178" rx="70" ry="82" fill="#fde68a" />
          <path d="M 125 150 Q 160 95 200 115 Q 240 100 275 145 Q 240 125 200 125 Q 160 125 125 150" fill="url(#alexHair)" />

          <path d="M 152 154 Q 172 148 185 154" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M 215 154 Q 228 148 248 154" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

          <rect x="146" y="160" width="42" height="28" rx="6" fill="none" stroke="#06b6d4" strokeWidth="3" />
          <rect x="212" y="160" width="42" height="28" rx="6" fill="none" stroke="#06b6d4" strokeWidth="3" />
          <line x1="188" y1="172" x2="212" y2="172" stroke="#06b6d4" strokeWidth="3" />

          {blink ? (
            <>
              <line x1="156" y1="174" x2="178" y2="174" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <line x1="222" y1="174" x2="244" y2="174" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="167" cy="174" r="5" fill="#0f172a" />
              <circle cx="165" cy="172" r="1.5" fill="#ffffff" />
              <circle cx="233" cy="174" r="5" fill="#0f172a" />
              <circle cx="231" cy="172" r="1.5" fill="#ffffff" />
            </>
          )}

          <path d="M 198 186 L 195 202 L 205 202" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

          {/* Direct DOM animated mouth */}
          <ellipse ref={mouthRef} cx="200" cy="226" rx="12" ry="1.5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.6" />

          <path d="M 125 175 C 120 120, 280 120, 275 175" fill="none" stroke="#06b6d4" strokeWidth="4" />
          <rect x="120" y="165" width="10" height="22" rx="4" fill="#0284c7" />
          <rect x="270" y="165" width="10" height="22" rx="4" fill="#0284c7" />
        </svg>
      );
    }

    if (activeTeacher.avatarKey === "ananya") {
      return (
        <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
          <defs>
            <radialGradient id="ananyaGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="kurtaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#9d174d" />
            </linearGradient>
            <linearGradient id="ananyaHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="180" r="160" fill="url(#ananyaGlow)" />
          <path d="M 75 450 C 85 315, 135 275, 200 275 C 265 275, 315 315, 325 450 Z" fill="url(#kurtaGradient)" />
          <path d="M 90 450 Q 150 310 185 275 Q 160 380 140 450 Z" fill="#f59e0b" opacity="0.85" />
          <circle cx="185" cy="285" r="4" fill="#fbbf24" />

          <rect x="182" y="218" width="36" height="68" rx="8" fill="#fcd34d" />
          <ellipse cx="200" cy="180" rx="94" ry="118" fill="url(#ananyaHair)" />
          <ellipse cx="200" cy="176" rx="68" ry="80" fill="#fde68a" />
          <path d="M 132 165 Q 200 115 268 165 Q 235 130 200 135 Q 165 130 132 165" fill="url(#ananyaHair)" />
          <circle cx="200" cy="156" r="3.5" fill="#dc2626" />

          <path d="M 154 156 Q 172 150 186 157" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
          <path d="M 214 157 Q 228 150 246 156" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />

          {blink ? (
            <>
              <line x1="156" y1="172" x2="182" y2="172" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
              <line x1="218" y1="172" x2="244" y2="172" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="169" cy="172" rx="7" ry="5.5" fill="#1c1917" />
              <circle cx="167" cy="170" r="1.8" fill="#ffffff" />
              <ellipse cx="231" cy="172" rx="7" ry="5.5" fill="#1c1917" />
              <circle cx="229" cy="170" r="1.8" fill="#ffffff" />
            </>
          )}

          <path d="M 198 184 L 195 200 L 204 200" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="207" cy="198" r="1.8" fill="#fbbf24" />

          {/* Direct DOM animated mouth */}
          <ellipse ref={mouthRef} cx="200" cy="224" rx="12" ry="1.5" fill="#991b1b" stroke="#831843" strokeWidth="1.5" opacity="0.6" />

          <circle cx="130" cy="192" r="3" fill="#fbbf24" />
          <polygon points="126,196 134,196 130,204" fill="#f59e0b" />
          <circle cx="270" cy="192" r="3" fill="#fbbf24" />
          <polygon points="266,196 274,196 270,204" fill="#f59e0b" />
        </svg>
      );
    }

    // Default: Dr. Maya
    return (
      <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
        <defs>
          <radialGradient id="mayaGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="180" r="160" fill="url(#mayaGlow)" />
        <path d="M 80 450 C 90 320, 140 280, 200 280 C 260 280, 310 320, 320 450 Z" fill="url(#blazerGradient)" />
        <polygon points="180,280 200,320 220,280" fill="#ffffff" />
        <polygon points="160,280 180,330 200,280" fill="#6366f1" />
        <polygon points="240,280 220,330 200,280" fill="#6366f1" />

        <rect x="180" y="220" width="40" height="70" rx="8" fill="#fcd34d" />
        <ellipse cx="200" cy="160" rx="90" ry="105" fill="#1e1b4b" />
        <ellipse cx="200" cy="180" rx="72" ry="85" fill="#fde68a" />
        <path d="M 130 160 Q 200 110 270 160 Q 240 130 200 130 Q 160 130 130 160" fill="#1e1b4b" />

        <rect x="150" y="160" width="38" height="26" rx="8" fill="none" stroke="#4338ca" strokeWidth="3" />
        <rect x="212" y="160" width="38" height="26" rx="8" fill="none" stroke="#4338ca" strokeWidth="3" />
        <line x1="188" y1="172" x2="212" y2="172" stroke="#4338ca" strokeWidth="3" />

        {blink ? (
          <>
            <line x1="158" y1="173" x2="180" y2="173" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <line x1="220" y1="173" x2="242" y2="173" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="169" cy="173" r="5" fill="#1f2937" />
            <circle cx="167" cy="171" r="1.5" fill="#ffffff" />
            <circle cx="231" cy="173" r="5" fill="#1f2937" />
            <circle cx="229" cy="171" r="1.5" fill="#ffffff" />
          </>
        )}

        <path d="M 197 185 L 195 202 L 205 202" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

        {/* Direct DOM animated mouth */}
        <ellipse ref={mouthRef} cx="200" cy="225" rx="12" ry="1.5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  };

  return (
    <div className="teacher-stage-card">
      <div className="teacher-header">
        <div className="teacher-picker-wrapper">
          <button
            type="button"
            className="teacher-profile-badge interactive"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            title="Click to switch AI Educator"
          >
            <div className="status-indicator online"></div>
            <span className="teacher-title">{activeTeacher.name}</span>
            <ChevronDown size={14} className={`dropdown-chevron ${isDropdownOpen ? "open" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="teacher-dropdown-menu">
              <div className="dropdown-header">Select Educator</div>
              {TEACHERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`teacher-option ${t.id === activeTeacher.id ? "active" : ""}`}
                  onClick={() => {
                    if (onSelectTeacher) onSelectTeacher(t);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="teacher-option-bullet" style={{ background: t.accentColor }}></div>
                  <div className="teacher-option-info">
                    <span className="name">{t.name}</span>
                    <span className="spec">{t.specialty}</span>
                  </div>
                  {t.id === activeTeacher.id && <UserCheck size={14} className="selected-check" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="voice-badge">
          <Sparkles size={13} className="sparkle-icon" />
          <span>{activeTeacher.specialty}</span>
        </div>
      </div>

      <div className="avatar-viewport">
        {renderAvatarSVG()}

        <div className="speech-status-bar">
          <div className="wave-bars">
            <span ref={(el) => (waveBarsRef.current[0] = el)} className="bar" />
            <span ref={(el) => (waveBarsRef.current[1] = el)} className="bar" />
            <span ref={(el) => (waveBarsRef.current[2] = el)} className="bar" />
            <span ref={(el) => (waveBarsRef.current[3] = el)} className="bar" />
          </div>
          <span className="speech-caption-text">
            {isPlaying ? `${activeTeacher.name} is speaking...` : `Ready • ${activeTeacher.tone}`}
          </span>
        </div>
      </div>

      <div className="teacher-speech-box">
        <p className="speech-transcript">"{scriptText || activeTeacher.greeting}"</p>
        <div className="voice-controls-bar">
          <button
            type="button"
            className="voice-ctrl-chip"
            onClick={togglePlaybackSpeed}
            title="Adjust voice speed"
          >
            <FastForward size={12} />
            <span>{playbackSpeed}x</span>
          </button>
          <button
            type="button"
            className="voice-ctrl-chip"
            onClick={replayCurrentSpeech}
            title="Replay speech"
          >
            <RotateCcw size={12} />
            <span>Replay</span>
          </button>
        </div>
      </div>

      <audio ref={audioRef} onEnded={onAudioEnded} crossOrigin="anonymous" style={{ display: "none" }} />
    </div>
  );
}
