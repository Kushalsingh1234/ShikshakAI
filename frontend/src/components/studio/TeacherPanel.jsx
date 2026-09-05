import React, { useEffect, useRef, useState, useCallback } from "react";
import { FastForward, RotateCcw, Mic, CheckCircle2, AlertCircle } from "lucide-react";
import { TEACHERS } from "../../constants/teachers";

export default function TeacherPanel({
  teacherState = "explaining", // "speaking" | "explaining" | "listening" | "thinking" | "questioning" | "celebrating" | "correcting"
  scriptText = "",
  audioUrl = null,
  isPlaying = false,
  onAudioEnded,
  onTimeUpdate,
  currentTeacher = TEACHERS[0],
  playbackSpeed = 1,
  onToggleSpeed,
  onReplay,
}) {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceConnectedRef = useRef(false);
  const talkImgRef = useRef(null);
  const waveBarsRef = useRef([]);
  const smoothedApertureRef = useRef(0);

  const [blink, setBlink] = useState(false);

  // Resume AudioContext on any user gesture to satisfy browser autoplay policies
  const unlockAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudioContext, { once: true });
    window.addEventListener("keydown", unlockAudioContext, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudioContext);
      window.removeEventListener("keydown", unlockAudioContext);
    };
  }, [unlockAudioContext]);

  // Setup Web Audio API Analyzer for real-time acoustic lip-sync
  const initAudioAnalyser = useCallback(() => {
    if (!audioRef.current || sourceConnectedRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.4;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyserRef.current = analyser;
      sourceConnectedRef.current = true;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Audio element already routed or cross-origin policy applied
    }
  }, []);

  // Audio Playback synchronization
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => {
          initAudioAnalyser();
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume().catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [audioUrl, playbackSpeed, initAudioAnalyser]);

  // High-Fidelity Acoustic & Biomechanical Lip Sync Engine (60fps Direct DOM)
  useEffect(() => {
    let animId = null;

    const updateLipSync = () => {
      const isSpeaking =
        isPlaying &&
        audioRef.current &&
        !audioRef.current.paused &&
        !audioRef.current.ended;

      if (isSpeaking) {
        let hasRealAcoustic = false;
        let acousticAperture = 0;
        let barValues = [6, 8, 7, 5];

        // 1. Analyze vocal formant frequency energy if analyser is active
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Vocal tract formants typically reside in lower-mid frequencies
          let formantSum = 0;
          for (let i = 1; i <= 6; i++) {
            formantSum += dataArray[i] || 0;
          }
          const formantAvg = formantSum / 6;

          if (formantAvg > 8) {
            hasRealAcoustic = true;
            // Normalize speech formant volume: 0 = closed, 1 = wide open
            acousticAperture = Math.min(1, Math.max(0, (formantAvg - 12) / 65));

            barValues = [
              Math.max(4, Math.min(22, (dataArray[2] || 0) / 10)),
              Math.max(4, Math.min(24, (dataArray[4] || 0) / 9)),
              Math.max(4, Math.min(22, (dataArray[7] || 0) / 11)),
              Math.max(4, Math.min(18, (dataArray[10] || 0) / 12)),
            ];
          }
        }

        // 2. Continuous Biomechanical Syllable Envelope (3.8Hz natural cadence)
        const currentTime = audioRef.current.currentTime || Date.now() / 1000;
        const phase = currentTime * 3.8 * Math.PI * 2;
        const rawWave =
          Math.sin(phase) * 0.55 +
          Math.sin(phase * 0.5 + 0.5) * 0.25 +
          Math.cos(phase * 1.7) * 0.2;
        
        // Shape into crisp phonemic vowel openings and consonant closures
        const syllableAperture = Math.max(0, Math.min(1, Math.pow(Math.max(0, rawWave + 0.38), 1.5)));

        // 3. Composite Target Aperture
        let targetAperture = 0;
        if (hasRealAcoustic) {
          targetAperture = acousticAperture * 0.65 + (syllableAperture * acousticAperture) * 0.35;
        } else {
          targetAperture = syllableAperture * 0.88;
          const bounce = Math.sin(phase) * 5 + 10;
          barValues = [bounce, bounce * 1.2, bounce * 0.9, bounce * 0.7];
        }

        // 4. Physiological Co-Articulation Filter (fast attack, natural relaxation)
        const smoothing = targetAperture > smoothedApertureRef.current ? 0.38 : 0.25;
        smoothedApertureRef.current += (targetAperture - smoothedApertureRef.current) * smoothing;
        const aperture = Math.max(0, Math.min(1, smoothedApertureRef.current));

        // 5. Anatomical Lip Viseme Modulation (Pixel-perfect color-matched layer)
        if (talkImgRef.current) {
          // Clean opacity crossfade of precisely aligned vermilion mouth layer
          const mouthOpen = Math.max(0, Math.min(1, aperture));
          talkImgRef.current.style.opacity = String(mouthOpen);
          talkImgRef.current.style.transform = "none";
        }

        // 6. Real-time Equalizer Wave HUD Update
        if (waveBarsRef.current) {
          waveBarsRef.current.forEach((bar, idx) => {
            if (bar) {
              bar.style.height = `${Math.max(4, barValues[idx] || 4)}px`;
            }
          });
        }
      } else {
        // Resting neutral expression
        smoothedApertureRef.current = 0;
        if (talkImgRef.current) {
          talkImgRef.current.style.opacity = "0";
          talkImgRef.current.style.transform = "none";
        }
        if (waveBarsRef.current) {
          waveBarsRef.current.forEach((bar) => {
            if (bar) bar.style.height = "4px";
          });
        }
      }

      animId = requestAnimationFrame(updateLipSync);
    };

    animId = requestAnimationFrame(updateLipSync);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Natural Eyelid Blink Simulation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 4000 + Math.random() * 1800);
    return () => clearInterval(blinkInterval);
  }, []);

  const getStatusText = () => {
    switch (teacherState) {
      case "listening":
        return `${currentTeacher.name} is listening...`;
      case "thinking":
        return `${currentTeacher.name} is analyzing your answer...`;
      case "celebrating":
        return `✓ Great! Concept mastered.`;
      case "correcting":
        return `Let's try that another way.`;
      case "questioning":
        return `Checkpoint question active`;
      default:
        return isPlaying ? `${currentTeacher.name} is speaking...` : `Active Lesson`;
    }
  };

  const activeTeacher = currentTeacher || TEACHERS[0];

  return (
    <div
      className={`floating-teacher-panel state-${teacherState}`}
      onClick={() => {
        unlockAudioContext();
        if (audioRef.current && audioRef.current.paused && audioUrl) {
          audioRef.current.play().catch(() => {});
        }
      }}
    >
      {/* Teacher Status Halo Header */}
      <div className="teacher-panel-top">
        <div className="teacher-meta-tag">
          <span className="status-live-dot" />
          <span className="teacher-display-name">{activeTeacher.name}</span>
        </div>
        <div className="teacher-state-badge">
          {teacherState === "celebrating" && <CheckCircle2 size={12} className="text-emerald-400" />}
          {teacherState === "correcting" && <AlertCircle size={12} className="text-amber-400" />}
          {teacherState === "listening" && <Mic size={12} className="text-sky-400 animate-pulse" />}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Photorealistic Human AI Educator Camera Feed with Acoustic Lip-Sync */}
      <div className={`teacher-avatar-viewport ${isPlaying ? "is-speaking" : ""} ${blink ? "is-blinking" : ""}`}>
        <div className="teacher-camera-frame">
          {/* Base Neutral Expression Frame (Rock-solid, razor sharp eyes, hair, shoulders) */}
          <img
            src={activeTeacher.avatarUrl || "/avatars/dr_maya.jpg"}
            alt={activeTeacher.name}
            className="teacher-human-img teacher-idle-img"
          />

          {/* Active Speaking Viseme Layer (Feathered mouth & jaw drop, dynamically articulated) */}
          <img
            ref={talkImgRef}
            src={activeTeacher.avatarTalkUrl || "/avatars/dr_maya_mouth.png"}
            alt={`${activeTeacher.name} Speaking`}
            className="teacher-human-img teacher-talk-img"
            style={{ opacity: 0 }}
          />

          {/* Live Studio Feed Status Overlays */}
          <div className="camera-feed-header">
            <div className="feed-rec-badge">
              <span className="feed-rec-dot" />
              <span>LIVE</span>
            </div>
            <span className="feed-quality-badge">1080p HD</span>
          </div>

          {/* Reactive Mood Lighting Glow */}
          <div className={`teacher-mood-overlay mood-${teacherState}`} />
        </div>

        {/* Live Audio Waveform Equalizer HUD */}
        <div className="teacher-wave-hud">
          <div className="hud-bars-row">
            <span ref={(el) => (waveBarsRef.current[0] = el)} className="hud-wave-bar" />
            <span ref={(el) => (waveBarsRef.current[1] = el)} className="hud-wave-bar" />
            <span ref={(el) => (waveBarsRef.current[2] = el)} className="hud-wave-bar" />
            <span ref={(el) => (waveBarsRef.current[3] = el)} className="hud-wave-bar" />
          </div>
          <span className="hud-label">{isPlaying ? "Neural Voice Active" : "Ready"}</span>
        </div>
      </div>

      {/* Quick Playback & Speed Controls */}
      <div className="teacher-panel-actions">
        <button
          type="button"
          className="panel-chip-btn"
          onClick={onToggleSpeed}
          title="Adjust spoken explanation speed"
        >
          <FastForward size={12} />
          <span>{playbackSpeed}x</span>
        </button>

        <button
          type="button"
          className="panel-chip-btn"
          onClick={onReplay}
          title="Replay explanation"
        >
          <RotateCcw size={12} />
          <span>Replay</span>
        </button>
      </div>

      <audio
        ref={audioRef}
        onEnded={onAudioEnded}
        onTimeUpdate={(e) => {
          if (onTimeUpdate && e.target) {
            onTimeUpdate(e.target.currentTime, e.target.duration || 0);
          }
        }}
        onLoadedMetadata={(e) => {
          if (onTimeUpdate && e.target) {
            onTimeUpdate(e.target.currentTime, e.target.duration || 0);
          }
        }}
        playsInline
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
    </div>
  );
}
