import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Play, Pause, RotateCcw, RotateCw, FastForward } from "lucide-react";

function ExplainerScrubberComponent({
  currentTime = 0,
  duration = 10,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward,
  sceneCues = [],
  activeCueIndex = 0,
  playbackSpeed = 1,
  onToggleSpeed,
}) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const [hoverState, setHoverState] = useState({ visible: false, x: 0, time: 0, cueLabel: "" });

  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  const currentPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const displayPercent = isDragging ? dragPercent : currentPercent;

  // Calculate seek time from clientX
  const getTimeFromClientX = useCallback(
    (clientX) => {
      if (!barRef.current || duration <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e) => {
    if (duration <= 0) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const seekTime = getTimeFromClientX(clientX);
    setDragPercent((seekTime / duration) * 100);
    if (onSeek) onSeek(seekTime);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const seekTime = getTimeFromClientX(clientX);
      setDragPercent((seekTime / duration) * 100);
      if (onSeek) onSeek(seekTime);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, duration, getTimeFromClientX, onSeek]);

  // Hover Preview Tooltip Handler
  const handleMouseMove = (e) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = hoverX / rect.width;
    const hoverTime = ratio * duration;

    // Find corresponding cue
    const targetCue = sceneCues.find(
      (c) => hoverTime >= c.start_time && hoverTime < c.start_time + c.duration
    );
    const cueLabel = targetCue
      ? targetCue.narration_text?.slice(0, 32) + "..."
      : `Scene preview`;

    setHoverState({
      visible: true,
      x: hoverX,
      time: hoverTime,
      cueLabel,
    });
  };

  const handleMouseLeave = () => {
    setHoverState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="explainer-scrubber-bar" role="region" aria-label="Explanation Timeline Controls">
      {/* 1. Scrubber Track with Chapter Marks */}
      <div
        className="scrubber-track-container"
        ref={barRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-label="Timeline position"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onSeek && onSeek(Math.max(0, currentTime - 5));
          if (e.key === "ArrowRight") onSeek && onSeek(Math.min(duration, currentTime + 5));
          if (e.key === " ") {
            e.preventDefault();
            onTogglePlay && onTogglePlay();
          }
        }}
      >
        <div className="scrubber-track-bg">
          <div
            className="scrubber-track-progress"
            style={{ width: `${displayPercent}%` }}
          />

          {/* Scene Cue Milestone Ticks */}
          {sceneCues.map((cue, idx) => {
            const cuePercent = duration > 0 ? (cue.start_time / duration) * 100 : 0;
            const isPassed = idx <= activeCueIndex;
            return (
              <div
                key={cue.id || idx}
                className={`scrubber-cue-tick ${isPassed ? "is-passed" : ""} ${idx === activeCueIndex ? "is-current" : ""}`}
                style={{ left: `${cuePercent}%` }}
                title={`Scene ${idx + 1}: ${cue.narration_text?.slice(0, 45)}...`}
              />
            );
          })}

          <div
            className={`scrubber-thumb-handle ${isDragging ? "is-dragging" : ""}`}
            style={{ left: `${displayPercent}%` }}
          />
        </div>

        {/* Hover Time & Scene Preview Tooltip */}
        {hoverState.visible && (
          <div
            className="scrubber-hover-preview"
            style={{ left: `${hoverState.x}px` }}
          >
            <span className="hover-time-text">{formatTime(hoverState.time)}</span>
            <span className="hover-cue-text">{hoverState.cueLabel}</span>
          </div>
        )}
      </div>

      {/* 2. Controls & Status Row */}
      <div className="scrubber-controls-row">
        <div className="controls-left-group">
          <button
            type="button"
            className="scrubber-btn play-pause-btn"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause Video Explanation" : "Play Video Explanation"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>

          <button
            type="button"
            className="scrubber-btn skip-btn"
            onClick={onSkipBack}
            aria-label="Rewind 5 seconds"
            title="Rewind 5 seconds (Left Arrow)"
          >
            <RotateCcw size={15} />
            <span className="skip-text">5s</span>
          </button>

          <button
            type="button"
            className="scrubber-btn skip-btn"
            onClick={onSkipForward}
            aria-label="Forward 5 seconds"
            title="Forward 5 seconds (Right Arrow)"
          >
            <RotateCw size={15} />
            <span className="skip-text">5s</span>
          </button>

          <div className="scrubber-time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="time-sep">/</span>
            <span className="total-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls-right-group">
          {/* Active Scene Cue Badge */}
          <div className="scrubber-cue-badge">
            <span className="cue-dot" />
            <span>
              Scene {activeCueIndex + 1} of {sceneCues.length || 1}
            </span>
          </div>

          <button
            type="button"
            className="scrubber-btn speed-btn"
            onClick={onToggleSpeed}
            aria-label={`Playback Speed: ${playbackSpeed}x`}
            title="Cycle Playback Speed"
          >
            <FastForward size={14} />
            <span>{playbackSpeed}x</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const ExplainerScrubber = memo(ExplainerScrubberComponent);
export default ExplainerScrubber;

