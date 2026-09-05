import React, { useState, useEffect, useRef } from "react";
import StudioHeader from "./StudioHeader";
import LessonStage from "./LessonStage";
import SceneTimeline from "./SceneTimeline";
import PlaybackBar from "./PlaybackBar";
import AskTeacherModal from "./AskTeacherModal";
import StudyNotesModal from "../StudyNotesModal";
import { generateTTS, evaluateAnswer, fetchAdaptiveScene } from "../../services/api";
import "./StudioShell.css";

export default function StudioShell({
  lessonPlan,
  currentTeacher,
  onExit,
  studentScore = { correct: 0, total: 0 },
  onUpdateScore,
  evalHistory = [],
  onAddEvalRecord,
}) {
  const [scenes, setScenes] = useState(() => lessonPlan?.steps || []);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [teacherState, setTeacherState] = useState("explaining");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoAdvanceMode, setAutoAdvanceMode] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Checkpoint & Feedback state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Modals & Doubt Panel state
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDoubtMinimized, setIsDoubtMinimized] = useState(false);
  const doubtInputRef = useRef(null);

  const handleOpenAskTeacher = () => {
    setIsDoubtMinimized(false);
    setTimeout(() => {
      doubtInputRef.current?.focus();
    }, 120);
  };

  const autoAdvanceTimeoutRef = useRef(null);

  // Sync scenes when lessonPlan prop changes
  useEffect(() => {
    if (lessonPlan?.steps) {
      setScenes(lessonPlan.steps);
      setCurrentSceneIndex(0);
      setEvalResult(null);
    }
  }, [lessonPlan]);

  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const isCheckpointScene = currentScene?.step_type === "checkpoint";

  // Play audio for current scene
  const playSceneAudio = async (scene) => {
    if (!scene) return;
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

    if (scene.step_type === "checkpoint") {
      setTeacherState("listening");
      setIsPlayingAudio(false);
      setCurrentAudioUrl(null);
      return;
    }

    setTeacherState("speaking");
    setIsPlayingAudio(true);

    try {
      const textToSpeak = scene.teacher_script || "Let's explore this core principle together.";
      const audioUrl = await generateTTS(
        textToSpeak,
        lessonPlan?.language || "en",
        currentTeacher?.id || "dr-maya"
      );
      setCurrentAudioUrl(audioUrl);
    } catch (err) {
      console.warn("TTS generation unavailable, running visual animation mode:", err);
      // Fallback timer simulation for speech
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleAudioEnded();
      }, 5000);
    }
  };

  // Trigger audio on scene change
  useEffect(() => {
    if (currentScene && !evalResult) {
      playSceneAudio(currentScene);
    }
    return () => {
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, [currentSceneIndex, evalResult]);

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setTeacherState("explaining");

    if (autoAdvanceMode && !isCheckpointScene && !evalResult) {
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNextScene();
      }, 1500);
    }
  };

  const handleNextScene = () => {
    setEvalResult(null);
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  const handlePrevScene = () => {
    setEvalResult(null);
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
    }
  };

  const handleReplayAudio = () => {
    if (currentScene) {
      playSceneAudio(currentScene);
    }
  };

  const handleToggleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
  };

  const handleTogglePlay = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setTeacherState("idle");
    } else {
      handleReplayAudio();
    }
  };

  // Checkpoint evaluation & Adaptation
  const handleSubmitAnswer = async (studentAnswer) => {
    setIsEvaluating(true);
    setTeacherState("thinking");

    try {
      const evaluation = await evaluateAnswer({
        question: currentScene.question || "Linear Equation Checkpoint",
        student_answer: studentAnswer,
        correct_answer: currentScene.correct_answer || "x = 3",
        misconception_guide: currentScene.misconception_guide || "",
        language: lessonPlan?.language || "en",
      });

      setIsEvaluating(false);
      setEvalResult(evaluation);

      // Update analytics
      if (onUpdateScore) {
        onUpdateScore({
          correct: studentScore.correct + (evaluation.is_correct ? 1 : 0),
          total: studentScore.total + 1,
        });
      }
      if (onAddEvalRecord) {
        onAddEvalRecord({
          step_id: currentScene.id,
          question: currentScene.question,
          student_answer: studentAnswer,
          is_correct: evaluation.is_correct,
          feedback: evaluation.feedback,
        });
      }

      if (evaluation.is_correct) {
        setTeacherState("celebrating");
      } else {
        setTeacherState("correcting");
      }
    } catch (err) {
      setIsEvaluating(false);
      const isCorrect = studentAnswer.toLowerCase().includes("3");
      const fallbackEval = {
        is_correct: isCorrect,
        misconception_detected: !isCorrect,
        detected_misconception: !isCorrect
          ? "Subtracting from only one side creates an unbalanced equation."
          : null,
        feedback: isCorrect
          ? "Spot on! You isolated x by keeping both sides balanced."
          : "Not quite. Remember that subtracting 4 must be done on both sides to keep the scale balanced.",
        adaptive_action: isCorrect ? "proceed" : "re_explain_with_analogy",
      };
      setEvalResult(fallbackEval);
      setTeacherState(isCorrect ? "celebrating" : "correcting");
    }
  };

  // When student clicks "Explore Simpler Balance Analogy"
  const handleTriggerAdaptiveScene = async () => {
    try {
      const adaptiveSceneData = await fetchAdaptiveScene({
        topic: lessonPlan?.topic || "Linear Equations",
        misconception: evalResult?.detected_misconception || "Unbalanced operation across equals sign",
        original_question: currentScene?.question || "2x + 4 = 10",
        student_answer: "Incorrect Step",
        language: lessonPlan?.language || "en",
      });

      // Insert adaptive scene right after current checkpoint
      const updatedScenes = [...scenes];
      updatedScenes.splice(currentSceneIndex + 1, 0, adaptiveSceneData);
      setScenes(updatedScenes);
      setEvalResult(null);
      setCurrentSceneIndex((prev) => prev + 1);
    } catch (err) {
      // Local fallback adaptive scene
      const fallbackAdaptive = {
        id: 999,
        step_type: "concept",
        teacher_script: "Let's look at the balance scale again. When you remove 4 from the left, you MUST remove 4 from the right to keep the scale perfectly flat.",
        visual: {
          type: "balance",
          title: "The Symmetrical Balance Analogy",
          content: "Left: [2x + 4] - 4  ===  Right: [10] - 4",
        },
      };
      const updatedScenes = [...scenes];
      updatedScenes.splice(currentSceneIndex + 1, 0, fallbackAdaptive);
      setScenes(updatedScenes);
      setEvalResult(null);
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="studio-production-shell">
      {/* 1. Minimal Premium Header */}
      <StudioHeader
        topic={lessonPlan?.topic || "Linear Equations"}
        teacherName={currentTeacher?.name || "Dr. Maya"}
        currentScene={currentSceneIndex + 1}
        totalScenes={scenes.length}
        onExit={onExit}
        onOpenNotes={() => setIsNotesModalOpen(true)}
        onOpenAskTeacher={handleOpenAskTeacher}
      />

      {/* 2. Grand Hero Lesson Stage */}
      <main className="studio-stage-arena">
        <LessonStage
          currentScene={currentScene}
          topic={lessonPlan?.topic || "Linear Equations"}
          language={lessonPlan?.language || "en"}
          teacherState={teacherState}
          isPlaying={isPlayingAudio}
          audioUrl={currentAudioUrl}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          onTimeUpdate={(time, dur) => {
            setAudioCurrentTime(time);
            if (dur) setAudioDuration(dur);
          }}
          onAudioEnded={handleAudioEnded}
          currentTeacher={currentTeacher}
          playbackSpeed={playbackSpeed}
          onToggleSpeed={handleToggleSpeed}
          onReplay={handleReplayAudio}
          showSubtitles={showSubtitles}
          isCheckpoint={isCheckpointScene}
          evalResult={evalResult}
          isEvaluating={isEvaluating}
          onSubmitAnswer={handleSubmitAnswer}
          onContinueFromFeedback={handleNextScene}
          onTriggerAdaptiveScene={handleTriggerAdaptiveScene}
          isDoubtMinimized={isDoubtMinimized}
          onToggleMinimizeDoubt={() => setIsDoubtMinimized((prev) => !prev)}
          doubtInputRef={doubtInputRef}
        />
      </main>

      {/* 3. Cinematic Milestone Scene Timeline */}
      <footer className="studio-bottom-deck">
        <SceneTimeline
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          onSelectScene={(idx) => {
            setEvalResult(null);
            setCurrentSceneIndex(idx);
          }}
        />

        {/* 4. Minimal Playback Bar */}
        <PlaybackBar
          isPlaying={isPlayingAudio}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrevScene}
          onNext={handleNextScene}
          onReplay={handleReplayAudio}
          isFirst={currentSceneIndex === 0}
          isLast={currentSceneIndex === scenes.length - 1}
          autoMode={autoAdvanceMode}
          onToggleAuto={() => setAutoAdvanceMode((prev) => !prev)}
          showSubtitles={showSubtitles}
          onToggleSubtitles={() => setShowSubtitles((prev) => !prev)}
          speed={playbackSpeed}
          onToggleSpeed={handleToggleSpeed}
        />
      </footer>

      {/* Contextual Ask Maya Modal */}
      <AskTeacherModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        topic={lessonPlan?.topic || "Linear Equations"}
        currentSceneTitle={currentScene?.visual?.title || currentScene?.step_type || "Lesson Concept"}
        currentVisualContent={currentScene?.visual?.content || ""}
        teacherName={currentTeacher?.name || "Dr. Maya"}
        language={lessonPlan?.language || "en"}
      />

      {/* Study Notes Modal */}
      <StudyNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        lessonPlan={lessonPlan}
        teacherName={currentTeacher?.name || "Dr. Maya"}
        currentStepIndex={currentSceneIndex}
      />
    </div>
  );
}
