import React from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Subtitles,
  Film,
  Zap,
} from "lucide-react";

export default function PlaybackBar({
  isPlaying = false,
  onTogglePlay,
  onPrev,
  onNext,
  onReplay,
  isFirst = false,
  isLast = false,
  autoMode = true,
  onToggleAuto,
  showSubtitles = true,
  onToggleSubtitles,
  speed = 1,
  onToggleSpeed,
}) {
  return (
    <div className="studio-playback-bar">
      {/* Left controls: Prev / Replay */}
      <div className="playback-group-left">
        <button
          type="button"
          className="pb-btn pb-nav"
          onClick={onPrev}
          disabled={isFirst}
          title="Previous Scene"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          className="pb-btn pb-subtle"
          onClick={onReplay}
          title="Replay spoken narration"
        >
          <RotateCcw size={14} />
          <span>Replay</span>
        </button>
      </div>

      {/* Center Main Action: Play/Pause or Next */}
      <div className="playback-group-center">
        <button
          type="button"
          className={`pb-main-play-btn ${isPlaying ? "is-playing" : ""}`}
          onClick={onTogglePlay}
          title={isPlaying ? "Pause Narration" : "Play Narration"}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <button
          type="button"
          className="pb-btn pb-primary-next"
          onClick={onNext}
          title={isLast ? "Complete Session" : "Next Scene"}
        >
          <span>{isLast ? "Complete Lesson" : "Next"}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Right controls: Speed, Auto-Advance, Subtitles */}
      <div className="playback-group-right">
        <button
          type="button"
          className="pb-btn pb-subtle"
          onClick={onToggleSpeed}
          title="Adjust spoken narration speed"
        >
          <Zap size={13} />
          <span>{speed}x</span>
        </button>

        <button
          type="button"
          className={`pb-btn pb-chip ${autoMode ? "is-active" : ""}`}
          onClick={onToggleAuto}
          title="Auto-Advance continuous lecture mode"
        >
          <Film size={13} />
          <span>{autoMode ? "Auto" : "Manual"}</span>
        </button>

        <button
          type="button"
          className={`pb-btn pb-chip ${showSubtitles ? "is-active" : ""}`}
          onClick={onToggleSubtitles}
          title="Toggle Subtitles"
        >
          <Subtitles size={13} />
          <span>CC</span>
        </button>
      </div>
    </div>
  );
}
