import React, { useEffect, useRef, useState } from "react";
import { Sparkles, ChevronDown, UserCheck } from "lucide-react";
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
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink, setBlink] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync audio playback
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((e) => console.log("Audio autoplay prevented:", e));
    }
  }, [audioUrl]);

  // Lip-sync simulation during audio playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 130);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const activeTeacher = currentTeacher || TEACHERS[0];

  // Render SVG avatar specifically customized for each teacher
  const renderAvatarContent = () => {
    if (activeTeacher.avatarKey === "prof_alex") {
      // Prof. Alex: Tech CS Educator with modern hoodie and cyan glasses
      return (
        <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
          <defs>
            <radialGradient id="alexGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
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

          {/* Hoodie Body */}
          <path d="M 70 450 C 80 310, 130 275, 200 275 C 270 275, 320 310, 330 450 Z" fill="url(#hoodieGradient)" />
          {/* Tech zipper / accents */}
          <path d="M 170 275 Q 200 320 230 275" fill="#06b6d4" opacity="0.4" />
          <line x1="200" y1="310" x2="200" y2="450" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />

          {/* Neck */}
          <rect x="180" y="220" width="40" height="65" rx="8" fill="#fcd34d" />

          {/* Spiky Short Hair Back */}
          <ellipse cx="200" cy="155" rx="86" ry="98" fill="url(#alexHair)" />

          {/* Head & Face */}
          <ellipse cx="200" cy="178" rx="70" ry="82" fill="#fde68a" />

          {/* Hair Top / Front styled crop */}
          <path d="M 125 150 Q 160 95 200 115 Q 240 100 275 145 Q 240 125 200 125 Q 160 125 125 150" fill="url(#alexHair)" />

          {/* Eyebrows */}
          <path d="M 152 154 Q 172 148 185 154" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 215 154 Q 228 148 248 154" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />

          {/* Tech Frame Glasses (Cyan square-rim) */}
          <rect x="146" y="160" width="42" height="28" rx="6" fill="none" stroke="#06b6d4" strokeWidth="3" />
          <rect x="212" y="160" width="42" height="28" rx="6" fill="none" stroke="#06b6d4" strokeWidth="3" />
          <line x1="188" y1="172" x2="212" y2="172" stroke="#06b6d4" strokeWidth="3" />

          {/* Eyes */}
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

          {/* Nose */}
          <path d="M 198 186 L 195 202 L 205 202" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

          {/* Animated Mouth */}
          {mouthOpen ? (
            <ellipse cx="200" cy="226" rx="14" ry="9" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
          ) : (
            <path d="M 188 226 Q 200 234 212 226" fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Tech Headset */}
          <path d="M 125 175 C 120 120, 280 120, 275 175" fill="none" stroke="#06b6d4" strokeWidth="4" />
          <rect x="120" y="165" width="10" height="22" rx="4" fill="#0284c7" />
          <rect x="270" y="165" width="10" height="22" rx="4" fill="#0284c7" />
          <path d="M 125 180 Q 150 220 180 225" fill="none" stroke="#0284c7" strokeWidth="2.5" />
          <circle cx="180" cy="225" r="4" fill="#38bdf8" />

          {/* Dynamic Speaking Pulse */}
          {isPlaying && (
            <g opacity="0.8">
              <circle cx="340" cy="190" r="12" fill="none" stroke="#38bdf8" strokeWidth="2">
                <animate attributeName="r" values="8;24;8" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.4s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>
      );
    }

    if (activeTeacher.avatarKey === "ananya") {
      // Ananya: Humanities Mentor with warm tones, traditional bindi, and shawl
      return (
        <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
          <defs>
            <radialGradient id="ananyaGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
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

          {/* Shoulders & Traditional Kurta */}
          <path d="M 75 450 C 85 315, 135 275, 200 275 C 265 275, 315 315, 325 450 Z" fill="url(#kurtaGradient)" />
          {/* Dupatta drape */}
          <path d="M 90 450 Q 150 310 185 275 Q 160 380 140 450 Z" fill="#f59e0b" opacity="0.85" />
          <circle cx="185" cy="285" r="4" fill="#fbbf24" />

          {/* Neck */}
          <rect x="182" y="218" width="36" height="68" rx="8" fill="#fcd34d" />

          {/* Long Hair Flow */}
          <ellipse cx="200" cy="180" rx="94" ry="118" fill="url(#ananyaHair)" />

          {/* Head & Face */}
          <ellipse cx="200" cy="176" rx="68" ry="80" fill="#fde68a" />

          {/* Front Hair Parting */}
          <path d="M 132 165 Q 200 115 268 165 Q 235 130 200 135 Q 165 130 132 165" fill="url(#ananyaHair)" />

          {/* Red Bindi */}
          <circle cx="200" cy="156" r="3.5" fill="#dc2626" />

          {/* Eyebrows */}
          <path d="M 154 156 Q 172 150 186 157" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
          <path d="M 214 157 Q 228 150 246 156" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />

          {/* Eyes (Almond shape) */}
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

          {/* Small Nose Ring / Stud */}
          <path d="M 198 184 L 195 200 L 204 200" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="207" cy="198" r="1.8" fill="#fbbf24" />

          {/* Animated Warm Smile / Mouth */}
          {mouthOpen ? (
            <ellipse cx="200" cy="224" rx="13" ry="8" fill="#991b1b" stroke="#831843" strokeWidth="1.5" />
          ) : (
            <path d="M 188 223 Q 200 231 212 223" fill="none" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Jhumka Earrings */}
          <circle cx="130" cy="192" r="3" fill="#fbbf24" />
          <polygon points="126,196 134,196 130,204" fill="#f59e0b" />
          <circle cx="270" cy="192" r="3" fill="#fbbf24" />
          <polygon points="266,196 274,196 270,204" fill="#f59e0b" />

          {/* Dynamic Speaking Pulse */}
          {isPlaying && (
            <g opacity="0.8">
              <circle cx="340" cy="190" r="12" fill="none" stroke="#f59e0b" strokeWidth="2">
                <animate attributeName="r" values="8;24;8" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>
      );
    }

    // Default: Dr. Maya (Physics / Math)
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

        {/* Shoulders & Suit */}
        <path d="M 80 450 C 90 320, 140 280, 200 280 C 260 280, 310 320, 320 450 Z" fill="url(#blazerGradient)" />
        {/* Shirt Collar */}
        <polygon points="180,280 200,320 220,280" fill="#ffffff" />
        <polygon points="160,280 180,330 200,280" fill="#6366f1" />
        <polygon points="240,280 220,330 200,280" fill="#6366f1" />

        {/* Neck */}
        <rect x="180" y="220" width="40" height="70" rx="8" fill="#fcd34d" />

        {/* Hair Back */}
        <ellipse cx="200" cy="160" rx="90" ry="105" fill="#1e1b4b" />

        {/* Head & Face */}
        <ellipse cx="200" cy="180" rx="72" ry="85" fill="#fde68a" />

        {/* Hair Front */}
        <path d="M 130 160 Q 200 110 270 160 Q 240 130 200 130 Q 160 130 130 160" fill="#1e1b4b" />

        {/* Glasses */}
        <rect x="150" y="160" width="38" height="26" rx="8" fill="none" stroke="#4338ca" strokeWidth="3.5" />
        <rect x="212" y="160" width="38" height="26" rx="8" fill="none" stroke="#4338ca" strokeWidth="3.5" />
        <line x1="188" y1="172" x2="212" y2="172" stroke="#4338ca" strokeWidth="3.5" />

        {/* Eyes */}
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

        {/* Nose */}
        <path d="M 197 185 L 195 202 L 205 202" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

        {/* Animated Mouth (Lip-sync to Speech) */}
        {mouthOpen ? (
          <ellipse cx="200" cy="225" rx="14" ry="9" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
        ) : (
          <path d="M 188 225 Q 200 231 212 225" fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Dynamic Gesture Waves when speaking */}
        {isPlaying && (
          <g opacity="0.7">
            <circle cx="340" cy="200" r="12" fill="none" stroke="#818cf8" strokeWidth="2">
              <animate attributeName="r" values="8;24;8" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="teacher-stage-card">
      <div className="teacher-header">
        {/* Teacher Selection Dropdown Pill */}
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
              <div className="dropdown-header">Switch AI Teacher</div>
              {TEACHERS.map((t) => (
                <button
                  key={t.id}
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
          <Sparkles size={14} className="sparkle-icon" />
          <span>{activeTeacher.specialty}</span>
        </div>
      </div>

      {/* Interactive AI Avatar Viewport */}
      <div className="avatar-viewport">
        {renderAvatarContent()}

        {/* Floating Speech Status Overlay */}
        <div className="speech-status-bar">
          <div className="wave-bars">
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
          </div>
          <span className="speech-caption-text">
            {isPlaying ? `${activeTeacher.name} is explaining...` : `Ready to assist • ${activeTeacher.tone}`}
          </span>
        </div>
      </div>

      {/* Subtitles & Spoken Transcript */}
      <div className="teacher-speech-box">
        <p className="speech-transcript">"{scriptText || activeTeacher.greeting}"</p>
      </div>

      <audio ref={audioRef} onEnded={onAudioEnded} style={{ display: "none" }} />
    </div>
  );
}
