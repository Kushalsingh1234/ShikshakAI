import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, ChevronDown, UserCheck, RotateCcw, FastForward, Radio } from "lucide-react";
import { TEACHERS } from "../constants/teachers";

export default function TeacherAvatar({
  scriptText,
  audioUrl,
  isPlaying,
  onAudioEnded,
  currentTeacher = TEACHERS[0],
  onSelectTeacher,
  footer,
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
        .catch((e) => console.log("Audio playback notice:", e));
    }
  }, [audioUrl, playbackSpeed, initAudioAnalyser]);

  // High-performance acoustic lip-sync loop using DIRECT DOM updates (0% React lag)
  useEffect(() => {
    if (!isPlaying) {
      if (mouthRef.current) {
        mouthRef.current.setAttribute("ry", "2");
        mouthRef.current.setAttribute("rx", "14");
        mouthRef.current.setAttribute("opacity", "0.75");
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
          mouthRef.current.setAttribute("rx", `${12 + normalized * 6}`);
          mouthRef.current.setAttribute("ry", `${3.5 + normalized * 9}`);
          mouthRef.current.setAttribute("opacity", "1");
        } else {
          mouthRef.current.setAttribute("rx", "14");
          mouthRef.current.setAttribute("ry", "2");
          mouthRef.current.setAttribute("opacity", "0.7");
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

  // Modern, dignified, stylish educator SVG graphics
  const renderAvatarSVG = () => {
    if (activeTeacher.avatarKey === "prof_alex") {
      return (
        <svg viewBox="0 0 400 440" className="studio-avatar-svg">
          <defs>
            <radialGradient id="alexStudioBack" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0e2a47" />
              <stop offset="100%" stopColor="#081321" />
            </radialGradient>
            <linearGradient id="alexHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="alexHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          <rect width="400" height="440" fill="url(#alexStudioBack)" />
          
          {/* Studio Camera Grid Overlay */}
          <g stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" strokeDasharray="3 3">
            <line x1="133" y1="0" x2="133" y2="440" />
            <line x1="267" y1="0" x2="267" y2="440" />
            <line x1="0" y1="146" x2="400" y2="146" />
            <line x1="0" y1="293" x2="400" y2="293" />
          </g>

          {/* Shoulders & Jacket */}
          <path d="M 60 440 C 75 300, 130 260, 200 260 C 270 260, 325 300, 340 440 Z" fill="url(#alexHoodie)" />
          <path d="M 160 260 L 200 320 L 240 260" fill="#06b6d4" opacity="0.25" />
          <line x1="200" y1="310" x2="200" y2="440" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />

          {/* Neck */}
          <rect x="182" y="205" width="36" height="65" rx="6" fill="#fcd34d" opacity="0.95" />

          {/* Hair Base */}
          <ellipse cx="200" cy="145" rx="80" ry="90" fill="url(#alexHairGrad)" />

          {/* Head & Face */}
          <ellipse cx="200" cy="165" rx="64" ry="76" fill="#fde68a" />

          {/* Styled Crop Hair */}
          <path d="M 130 140 Q 160 90 200 105 Q 240 90 270 135 Q 235 115 200 115 Q 165 115 130 140" fill="url(#alexHairGrad)" />

          {/* Eyebrows */}
          <path d="M 155 142 Q 172 136 186 142" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <path d="M 214 142 Q 228 136 245 142" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

          {/* Modern Glasses */}
          <rect x="150" y="148" width="38" height="26" rx="6" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
          <rect x="212" y="148" width="38" height="26" rx="6" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="188" y1="158" x2="212" y2="158" stroke="#06b6d4" strokeWidth="2.5" />

          {/* Eyes */}
          {blink ? (
            <>
              <line x1="158" y1="160" x2="180" y2="160" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="220" y1="160" x2="242" y2="160" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="169" cy="160" r="4.5" fill="#0f172a" />
              <circle cx="167" cy="158" r="1.5" fill="#ffffff" />
              <circle cx="231" cy="160" r="4.5" fill="#0f172a" />
              <circle cx="229" cy="158" r="1.5" fill="#ffffff" />
            </>
          )}

          {/* Nose */}
          <path d="M 198 170 L 195 186 L 204 186" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

          {/* Dynamic Acoustic Mouth */}
          <ellipse ref={mouthRef} cx="200" cy="210" rx="14" ry="2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />

          {/* Sleek Headset */}
          <path d="M 130 160 C 125 105, 275 105, 270 160" fill="none" stroke="#0284c7" strokeWidth="3" />
          <rect x="126" y="150" width="8" height="20" rx="3" fill="#0284c7" />
          <rect x="266" y="150" width="8" height="20" rx="3" fill="#0284c7" />
        </svg>
      );
    }

    if (activeTeacher.avatarKey === "ananya") {
      return (
        <svg viewBox="0 0 400 440" className="studio-avatar-svg">
          <defs>
            <radialGradient id="ananyaStudioBack" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#3b1d11" />
              <stop offset="100%" stopColor="#170c08" />
            </radialGradient>
            <linearGradient id="ananyaKurta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
            <linearGradient id="ananyaHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="100%" stopColor="#171412" />
            </linearGradient>
          </defs>

          <rect width="400" height="440" fill="url(#ananyaStudioBack)" />

          {/* Studio Camera Grid Overlay */}
          <g stroke="rgba(245, 158, 11, 0.12)" strokeWidth="1" strokeDasharray="3 3">
            <line x1="133" y1="0" x2="133" y2="440" />
            <line x1="267" y1="0" x2="267" y2="440" />
            <line x1="0" y1="146" x2="400" y2="146" />
            <line x1="0" y1="293" x2="400" y2="293" />
          </g>

          {/* Shoulders & Dupatta */}
          <path d="M 65 440 C 80 300, 130 260, 200 260 C 270 260, 320 300, 335 440 Z" fill="url(#ananyaKurta)" />
          <path d="M 80 440 Q 140 300 180 260 Q 150 370 130 440 Z" fill="#f59e0b" opacity="0.75" />

          {/* Neck */}
          <rect x="183" y="205" width="34" height="65" rx="6" fill="#fcd34d" opacity="0.95" />

          {/* Flowing Dark Hair */}
          <ellipse cx="200" cy="160" rx="88" ry="110" fill="url(#ananyaHairGrad)" />

          {/* Head & Face */}
          <ellipse cx="200" cy="165" rx="62" ry="74" fill="#fde68a" />

          {/* Hair Front Parting */}
          <path d="M 136 150 Q 200 105 264 150 Q 235 115 200 120 Q 165 115 136 150" fill="url(#ananyaHairGrad)" />

          {/* Traditional Bindi */}
          <circle cx="200" cy="144" r="3" fill="#dc2626" />

          {/* Eyebrows */}
          <path d="M 156 144 Q 172 138 185 144" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 215 144 Q 228 138 244 144" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />

          {/* Almond Eyes */}
          {blink ? (
            <>
              <line x1="158" y1="158" x2="182" y2="158" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="218" y1="158" x2="242" y2="158" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="170" cy="158" rx="6" ry="5" fill="#1c1917" />
              <circle cx="168" cy="156" r="1.6" fill="#ffffff" />
              <ellipse cx="230" cy="158" rx="6" ry="5" fill="#1c1917" />
              <circle cx="228" cy="156" r="1.6" fill="#ffffff" />
            </>
          )}

          {/* Nose & Stud */}
          <path d="M 198 168 L 196 183 L 203 183" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          <circle cx="206" cy="181" r="1.5" fill="#fbbf24" />

          {/* Dynamic Acoustic Mouth */}
          <ellipse ref={mouthRef} cx="200" cy="208" rx="14" ry="2" fill="#991b1b" stroke="#831843" strokeWidth="1.5" />

          {/* Earrings */}
          <circle cx="134" cy="175" r="2.5" fill="#fbbf24" />
          <circle cx="266" cy="175" r="2.5" fill="#fbbf24" />
        </svg>
      );
    }

    // Default: Dr. Maya
    return (
      <svg viewBox="0 0 400 440" className="studio-avatar-svg">
        <defs>
          <radialGradient id="mayaStudioBack" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0b0a1a" />
          </radialGradient>
          <linearGradient id="mayaBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="mayaHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        <rect width="400" height="440" fill="url(#mayaStudioBack)" />

        {/* Studio Camera Grid Overlay */}
        <g stroke="rgba(99, 102, 241, 0.12)" strokeWidth="1" strokeDasharray="3 3">
          <line x1="133" y1="0" x2="133" y2="440" />
          <line x1="267" y1="0" x2="267" y2="440" />
          <line x1="0" y1="146" x2="400" y2="146" />
          <line x1="0" y1="293" x2="400" y2="293" />
        </g>

        {/* Shoulders & Professional Blazer */}
        <path d="M 65 440 C 80 300, 135 260, 200 260 C 265 260, 320 300, 335 440 Z" fill="url(#mayaBlazer)" />
        <polygon points="185,260 200,300 215,260" fill="#ffffff" />
        <polygon points="168,260 185,310 200,260" fill="#6366f1" />
        <polygon points="232,260 215,310 200,260" fill="#6366f1" />

        {/* Neck */}
        <rect x="182" y="205" width="36" height="65" rx="6" fill="#fcd34d" opacity="0.95" />

        {/* Hair Base */}
        <ellipse cx="200" cy="148" rx="84" ry="96" fill="url(#mayaHairGrad)" />

        {/* Head & Face */}
        <ellipse cx="200" cy="166" rx="66" ry="78" fill="#fde68a" />

        {/* Hair Front Styling */}
        <path d="M 134 145 Q 200 95 266 145 Q 235 115 200 115 Q 165 115 134 145" fill="url(#mayaHairGrad)" />

        {/* Glasses */}
        <rect x="152" y="148" width="36" height="24" rx="6" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
        <rect x="212" y="148" width="36" height="24" rx="6" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
        <line x1="188" y1="158" x2="212" y2="158" stroke="#4f46e5" strokeWidth="2.5" />

        {/* Eyes */}
        {blink ? (
          <>
            <line x1="158" y1="160" x2="180" y2="160" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="220" y1="160" x2="242" y2="160" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="170" cy="160" r="4.5" fill="#1f2937" />
            <circle cx="168" cy="158" r="1.5" fill="#ffffff" />
            <circle cx="230" cy="160" r="4.5" fill="#1f2937" />
            <circle cx="228" cy="158" r="1.5" fill="#ffffff" />
          </>
        )}

        {/* Nose */}
        <path d="M 198 170 L 195 186 L 204 186" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

        {/* Dynamic Acoustic Mouth */}
        <ellipse ref={mouthRef} cx="200" cy="210" rx="14" ry="2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="studio-stage-card">
      {/* Studio Header Bar */}
      <div className="studio-card-header">
        <div className="educator-dropdown-pill">
          <button
            type="button"
            className="educator-trigger-btn"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            title="Switch Educator"
          >
            <span className="live-camera-dot"></span>
            <span className="educator-display-name">{activeTeacher.name}</span>
            <ChevronDown size={14} className={`chevron-icon ${isDropdownOpen ? "open" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="studio-dropdown-popover">
              <div className="popover-title">Select Educator</div>
              {TEACHERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`popover-item ${t.id === activeTeacher.id ? "active" : ""}`}
                  onClick={() => {
                    if (onSelectTeacher) onSelectTeacher(t);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="popover-bullet" style={{ background: t.accentColor }}></div>
                  <div className="popover-info">
                    <span className="name">{t.name}</span>
                    <span className="role">{t.specialty}</span>
                  </div>
                  {t.id === activeTeacher.id && <UserCheck size={14} className="selected-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="studio-badge">
          <Radio size={12} className="text-emerald-400" />
          <span>STUDIO 1080P</span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="studio-viewport-frame">
        {renderAvatarSVG()}

        {/* Bottom Audio Visualizer HUD */}
        <div className="studio-hud-bar">
          <div className="hud-wave-bars">
            <span ref={(el) => (waveBarsRef.current[0] = el)} className="hud-bar" />
            <span ref={(el) => (waveBarsRef.current[1] = el)} className="hud-bar" />
            <span ref={(el) => (waveBarsRef.current[2] = el)} className="hud-bar" />
            <span ref={(el) => (waveBarsRef.current[3] = el)} className="hud-bar" />
          </div>
          <span className="hud-status-caption">
            {isPlaying ? `${activeTeacher.name} is speaking...` : `Listening • ${activeTeacher.tone}`}
          </span>
        </div>
      </div>

      {/* Speech Caption & Controls Bar */}
      <div className="studio-transcript-box">
        <p className="transcript-text">"{scriptText || activeTeacher.greeting}"</p>
        <div className="transcript-actions-bar">
          <button
            type="button"
            className="action-chip"
            onClick={togglePlaybackSpeed}
            title="Adjust voice speed"
          >
            <FastForward size={12} />
            <span>{playbackSpeed}x Speed</span>
          </button>
          <button
            type="button"
            className="action-chip"
            onClick={replayCurrentSpeech}
            title="Replay explanation"
          >
            <RotateCcw size={12} />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {footer && <div className="studio-footer-nav">{footer}</div>}

      <audio ref={audioRef} onEnded={onAudioEnded} crossOrigin="anonymous" style={{ display: "none" }} />
    </div>
  );
}
