import React, { useState, useRef, useEffect } from "react";
import { Video, Square, Download, Sparkles, CheckCircle2, Play, AlertCircle, FileDown } from "lucide-react";

export default function LessonRecorder({ lessonTitle = "AI_Lesson", currentStepScript = "" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
  const [recordTimeSeconds, setRecordTimeSeconds] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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
    setErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen recording is not supported in this browser environment. You can use the Export Notes button instead!");
      return;
    }

    try {
      let stream;
      try {
        // First try requesting video and system audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } catch (audioErr) {
        // Fallback to video-only if audio capture is denied or unsupported by OS
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      recordedChunksRef.current = [];

      // Determine supported mimeType
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        mimeType = "video/webm;codecs=vp8";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setShowPreviewModal(true);
        // Stop all tracks cleanly
        stream.getTracks().forEach((track) => track.stop());
      };

      // Handle user stopping screen share via browser floating bar
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks()[0].onended = () => {
          stopRecording();
        };
      }

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.warn("Screen recording notice:", err);
      // Don't pop alert if user simply pressed 'Cancel' on the prompt
      if (err.name !== "NotAllowedError") {
        setErrorMsg("Recording could not start: " + (err.message || "Permission required"));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleDownloadVideo = () => {
    if (!recordedBlobUrl) return;
    const a = document.createElement("a");
    a.href = recordedBlobUrl;
    const safeTopic = (lessonTitle || "Lesson").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `ShikshakAI_${safeTopic}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportNotes = () => {
    const textContent = `# ShikshakAI - Lesson Notes: ${lessonTitle}\nDate: ${new Date().toLocaleDateString()}\n\nTeacher Script Transcript:\n${currentStepScript || "Educational session completed."}\n`;
    const blob = new Blob([textContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ShikshakAI_${lessonTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="recorder-container">
        {!isRecording ? (
          <div className="recorder-button-group">
            <button
              type="button"
              className="record-btn start"
              onClick={startRecording}
              title="Record Video Lesson with AI Avatar and Smartboard"
            >
              <Video size={14} />
              <span>Record Lesson</span>
            </button>
            <button
              type="button"
              className="export-notes-pill"
              onClick={handleExportNotes}
              title="Export Lesson Notes as Markdown"
            >
              <FileDown size={13} />
              <span>Notes</span>
            </button>
          </div>
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

      {errorMsg && (
        <div className="recorder-error-toast" onClick={() => setErrorMsg(null)}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recording Preview & Download Modal */}
      {showPreviewModal && (
        <div className="recorder-modal-overlay">
          <div className="recorder-modal-card">
            <div className="recorder-modal-header">
              <div className="rec-badge-group">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h4>Lesson Video Captured!</h4>
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
                <span>Format: WebM Video</span>
              </div>
              <div className="video-actions">
                <button
                  type="button"
                  className="discard-btn"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="download-video-btn"
                  onClick={handleDownloadVideo}
                >
                  <Download size={14} />
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
