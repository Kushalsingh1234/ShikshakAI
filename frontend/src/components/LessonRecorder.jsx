import React, { useState, useRef, useEffect } from "react";
import { Video, Square, Download, Sparkles, CheckCircle2, Play, AlertCircle } from "lucide-react";

export default function LessonRecorder({ lessonTitle = "AI_Lesson" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
  const [recordTimeSeconds, setRecordTimeSeconds] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Timer logic during recording
  useEffect(() => {
    if (isRecording) {
      setRecordTimeSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Use getDisplayMedia to capture the current browser window/tab + audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser", frameRate: { ideal: 30 } },
        audio: true,
      });

      streamRef.current = stream;
      recordedChunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setShowPreviewModal(true);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Handle user stopping screen share via browser bar
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording();
        }
      };

      mediaRecorder.start(1000); // chunk every second
      setIsRecording(true);
    } catch (err) {
      console.warn("Screen recording setup notice:", err);
      alert("Unable to start screen recording. Please grant screen capture permission when prompted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDownload = () => {
    if (!recordedBlobUrl) return;
    const a = document.createElement("a");
    a.href = recordedBlobUrl;
    const safeTopic = (lessonTopicFormatted(lessonTitle) || "Lesson").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `ShikshakAI_${safeTopic}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const lessonTopicFormatted = (title) => {
    return title ? title.replace(/\s+/g, "_") : "AI_Lesson";
  };

  return (
    <>
      {/* Top Bar Recording Pill / Button */}
      <div className="recorder-container">
        {!isRecording ? (
          <button
            type="button"
            className="record-btn start"
            onClick={startRecording}
            title="Record & Export Video Lesson"
          >
            <Video size={15} />
            <span>Record Lesson</span>
          </button>
        ) : (
          <button
            type="button"
            className="record-btn recording"
            onClick={stopRecording}
            title="Stop & Save Recording"
          >
            <span className="rec-pulse-dot"></span>
            <span>REC {formatTime(recordTimeSeconds)}</span>
            <Square size={13} className="stop-icon" />
          </button>
        )}
      </div>

      {/* Recording Preview & Download Modal */}
      {showPreviewModal && (
        <div className="recorder-modal-overlay">
          <div className="recorder-modal-card">
            <div className="recorder-modal-header">
              <div className="rec-badge-group">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <h4>Lesson Video Ready for Export</h4>
              </div>
              <button
                type="button"
                className="close-rec-modal"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="video-preview-wrapper">
              <video
                src={recordedBlobUrl}
                controls
                autoPlay
                className="lesson-video-player"
              />
            </div>

            <div className="recorder-modal-footer">
              <div className="video-stats">
                <span>Duration: {formatTime(recordTimeSeconds)}</span>
                <span>Format: WebM Video (High Quality)</span>
              </div>

              <div className="video-actions">
                <button
                  type="button"
                  className="discard-btn"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setRecordedBlobUrl(null);
                  }}
                >
                  Discard
                </button>

                <button
                  type="button"
                  className="download-video-btn"
                  onClick={handleDownload}
                >
                  <Download size={16} />
                  <span>Download Video (.webm)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
