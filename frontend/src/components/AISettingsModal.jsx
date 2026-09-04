import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { fetchAIConfig, saveAIKey } from "../services/api";

export default function AISettingsModal({ isOpen, onClose }) {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [aiConfig, setAIConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const cfg = await fetchAIConfig();
      setAIConfig(cfg);
    } catch (err) {
      console.log("Could not load AI config:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    let keyToSend = "";
    if (selectedProvider === "gemini") keyToSend = geminiKey;
    else if (selectedProvider === "groq") keyToSend = groqKey;
    else if (selectedProvider === "openai") keyToSend = openaiKey;

    try {
      const res = await saveAIKey(selectedProvider, keyToSend);
      setSaveStatus({ type: "success", msg: `Successfully connected ${res.configured_provider.toUpperCase()} AI Engine!` });
      await loadConfig();
    } catch (err) {
      setSaveStatus({ type: "error", msg: err.message || "Failed to update API key." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="study-notes-modal-overlay" onClick={onClose}>
      <div className="ai-settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ai-settings-header">
          <div className="ai-settings-title-group">
            <div className="ai-settings-icon-wrap">
              <Cpu size={22} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="ai-settings-title">AI Engine & Live Model Configuration</h3>
              <p className="ai-settings-subtitle">Connect Google Gemini, Groq, or OpenAI for live adaptive lessons</p>
            </div>
          </div>
          <button type="button" className="notes-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="ai-status-banner">
          <div className="ai-status-left">
            <span className="live-dot-green"></span>
            <div>
              <span className="ai-engine-status-tag">Active Engine:</span>
              <span className="ai-engine-name">
                {aiConfig?.provider === "gemini"
                  ? "Google Gemini 2.0 Flash (Live Multi-Modal)"
                  : aiConfig?.provider === "groq"
                  ? "Groq Llama-3.3 70B (Ultra-Fast)"
                  : aiConfig?.provider === "openai"
                  ? "OpenAI GPT-4o Mini"
                  : "Zero-Key Academic Synthesizer (Offline Intelligent Curriculum)"}
              </span>
            </div>
          </div>
          <span className="ai-status-badge">
            {aiConfig?.is_configured ? "API Key Active" : "Zero-Key Mode Active"}
          </span>
        </div>

        {/* Provider Tabs */}
        <form onSubmit={handleSave} className="ai-settings-body">
          <div className="ai-provider-tabs">
            <button
              type="button"
              className={`provider-tab ${selectedProvider === "gemini" ? "active" : ""}`}
              onClick={() => setSelectedProvider("gemini")}
            >
              <Sparkles size={16} />
              <span>Google Gemini (Free)</span>
            </button>
            <button
              type="button"
              className={`provider-tab ${selectedProvider === "groq" ? "active" : ""}`}
              onClick={() => setSelectedProvider("groq")}
            >
              <Cpu size={16} />
              <span>Groq (Fast)</span>
            </button>
            <button
              type="button"
              className={`provider-tab ${selectedProvider === "openai" ? "active" : ""}`}
              onClick={() => setSelectedProvider("openai")}
            >
              <Key size={16} />
              <span>OpenAI</span>
            </button>
          </div>

          {/* Key Input Section */}
          <div className="ai-key-input-box">
            {selectedProvider === "gemini" && (
              <>
                <div className="input-header-line">
                  <label htmlFor="gemini-key">Google Gemini API Key</label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-key-link"
                  >
                    <span>Get 100% Free Key from Google AI Studio</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <input
                  id="gemini-key"
                  type="password"
                  className="ai-key-field"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <p className="field-hint">
                  Google Gemini 2.0 Flash provides instantaneous multi-modal lecture synthesis and deep step-by-step reasoning.
                </p>
              </>
            )}

            {selectedProvider === "groq" && (
              <>
                <div className="input-header-line">
                  <label htmlFor="groq-key">Groq Cloud API Key</label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-key-link"
                  >
                    <span>Get Free Groq Key</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <input
                  id="groq-key"
                  type="password"
                  className="ai-key-field"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                />
              </>
            )}

            {selectedProvider === "openai" && (
              <>
                <div className="input-header-line">
                  <label htmlFor="openai-key">OpenAI API Key</label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-key-link"
                  >
                    <span>Get OpenAI Key</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <input
                  id="openai-key"
                  type="password"
                  className="ai-key-field"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </>
            )}
          </div>

          {/* Feedback Toast */}
          {saveStatus && (
            <div className={`ai-toast ${saveStatus.type}`}>
              {saveStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{saveStatus.msg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="ai-settings-footer">
            <div className="security-notice">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Keys are stored in local runtime memory and never transmitted to external third parties.</span>
            </div>
            <button
              type="submit"
              className="ai-save-btn"
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
              <span>{isSaving ? "Connecting..." : "Save & Activate"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
