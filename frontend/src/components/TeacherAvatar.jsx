import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

export default function TeacherAvatar({ scriptText, audioUrl, isPlaying, onAudioEnded, teacherName = "Dr. Maya" }) {
  const audioRef = useRef(null);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [blink, setBlink] = useState(false);

  // Sync audio playback
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.log("Audio autoplay prevented:", e));
    }
  }, [audioUrl]);

  // Lip-sync simulation during audio playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 140);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="teacher-stage-card">
      <div className="teacher-header">
        <div className="teacher-profile-badge">
          <div className="status-indicator online"></div>
          <span className="teacher-title">{teacherName} (AI Educator)</span>
        </div>
        <div className="voice-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Neural Voice Active</span>
        </div>
      </div>

      {/* Interactive AI Avatar Viewport */}
      <div className="avatar-viewport">
        <svg viewBox="0 0 400 450" className={`teacher-svg ${isPlaying ? "speaking" : "idle"}`}>
          {/* Subtle Ambient Glow */}
          <defs>
            <radialGradient id="teacherGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="180" r="160" fill="url(#teacherGlow)" />

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

        {/* Floating Speech Status Overlay */}
        <div className="speech-status-bar">
          <div className="wave-bars">
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
            <span className={`bar ${isPlaying ? "active" : ""}`}></span>
          </div>
          <span className="speech-caption-text">
            {isPlaying ? "Explaining concept..." : "Listening to student"}
          </span>
        </div>
      </div>

      {/* Subtitles & Spoken Transcript */}
      <div className="teacher-speech-box">
        <p className="speech-transcript">"{scriptText || "Ready to begin our lesson."}"</p>
      </div>

      <audio
        ref={audioRef}
        onEnded={onAudioEnded}
        style={{ display: "none" }}
      />
    </div>
  );
}
