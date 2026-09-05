import React from "react";
import VisualRenderer from "./visuals/VisualRenderer";
import TeacherPanel from "./TeacherPanel";
import TeacherCaptionCard from "./TeacherCaptionCard";
import CheckpointStage from "./CheckpointStage";
import AdaptiveFeedback from "./AdaptiveFeedback";
import AskDoubtCard from "./AskDoubtCard";

export default function LessonStage({
  currentScene,
  topic = "Linear Equations",
  teacherState = "explaining",
  isPlaying = false,
  audioUrl = null,
  onAudioEnded,
  currentTeacher,
  playbackSpeed = 1,
  onToggleSpeed,
  onReplay,
  showSubtitles = true,
  audioCurrentTime = 0,
  audioDuration = 0,
  onTimeUpdate,
  // Checkpoint & Feedback Props
  isCheckpoint = false,
  evalResult = null,
  isEvaluating = false,
  onSubmitAnswer,
  onContinueFromFeedback,
  onTriggerAdaptiveScene,
  // Doubt Panel Props
  language = "en",
  isDoubtMinimized = false,
  onToggleMinimizeDoubt,
  doubtInputRef,
}) {
  const isFeedbackMode = Boolean(evalResult);

  return (
    <div className={`studio-hero-lesson-stage ${isDoubtMinimized ? "has-doubt-minimized" : "has-doubt-docked"}`}>
      {/* Visual Canvas Area (Dominant Center Stage) */}
      <div className={`lesson-canvas-viewport ${isDoubtMinimized ? "is-doubt-minimized" : "is-doubt-docked"}`}>
        {isFeedbackMode ? (
          <AdaptiveFeedback
            result={evalResult}
            onContinue={onContinueFromFeedback}
            onTriggerAdaptiveScene={onTriggerAdaptiveScene}
            teacherName={currentTeacher?.name || "Dr. Maya"}
          />
        ) : isCheckpoint ? (
          <CheckpointStage
            question={currentScene?.question || "What is the foundational principle being applied?"}
            options={currentScene?.options || ["Option A", "Option B", "Option C", "Option D"]}
            visual={currentScene?.visual}
            topic={topic}
            onSubmitAnswer={onSubmitAnswer}
            isEvaluating={isEvaluating}
            teacherName={currentTeacher?.name || "Dr. Maya"}
          />
        ) : (
          <VisualRenderer
            visual={currentScene?.visual}
            topic={topic}
            stepType={currentScene?.step_type}
            teacherScript={currentScene?.teacher_script || ""}
            sceneScript={currentScene?.scene_script}
            currentScene={currentScene}
            audioUrl={audioUrl}
            teacherName={currentTeacher?.name || "Dr. Maya"}
            isPlaying={isPlaying}
            audioCurrentTime={audioCurrentTime}
            audioDuration={audioDuration}
            playbackSpeed={playbackSpeed}
            onTogglePlay={isPlaying ? onAudioEnded : onReplay}
            onToggleSpeed={onToggleSpeed}
            onTimeUpdate={onTimeUpdate}
          />
        )}
      </div>

      {/* Floating AI Teacher & Caption Stack (Left Anchor) */}
      <div className="lesson-teacher-floating-anchor">
        <TeacherPanel
          teacherState={teacherState}
          scriptText={currentScene?.teacher_script || ""}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          onAudioEnded={onAudioEnded}
          onTimeUpdate={onTimeUpdate}
          currentTeacher={currentTeacher}
          playbackSpeed={playbackSpeed}
          onToggleSpeed={onToggleSpeed}
          onReplay={onReplay}
        />

        {/* Dedicated Premium Caption & Transcript Card Directly Below Teacher */}
        {!isCheckpoint && !isFeedbackMode && (
          <TeacherCaptionCard
            text={currentScene?.teacher_script || ""}
            teacherName={currentTeacher?.name || "Dr. Maya"}
            isPlaying={isPlaying}
            isVisible={showSubtitles}
          />
        )}
      </div>

      {/* Floating Interactive Ask Doubt Card (Right Anchor) */}
      <div className={`lesson-doubt-floating-anchor ${isDoubtMinimized ? "is-minimized" : ""}`}>
        <AskDoubtCard
          topic={topic}
          currentSceneTitle={currentScene?.visual?.title || currentScene?.step_type || "Lesson Concept"}
          currentVisualContent={currentScene?.visual?.content || ""}
          teacherName={currentTeacher?.name || "Dr. Maya"}
          language={language}
          isMinimized={isDoubtMinimized}
          onToggleMinimize={onToggleMinimizeDoubt}
          inputRef={doubtInputRef}
        />
      </div>
    </div>
  );
}

