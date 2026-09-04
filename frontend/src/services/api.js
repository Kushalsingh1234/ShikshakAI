const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not yet connected:", err);
    return null;
  }
}

export async function fetchAIConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config`);
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch AI config:", err);
    return null;
  }
}

export async function saveAIKey(keys) {
  const res = await fetch(`${BACKEND_URL}/api/config/key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(keys),
  });
  if (!res.ok) throw new Error("Failed to save API key");
  return await res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BACKEND_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return await res.json();
}

export async function fetchLessonPlan({ topic, learner_level, target_duration_minutes, language, uploaded_filename }) {
  const res = await fetch(`${BACKEND_URL}/api/lesson/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, learner_level, target_duration_minutes, language, uploaded_filename }),
  });
  if (!res.ok) throw new Error("Failed to generate lesson plan");
  return await res.json();
}

export async function generateTTS(text, language = "en", teacherId = "dr-maya") {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("language", language);
  formData.append("teacher_id", teacherId);
  const res = await fetch(`${BACKEND_URL}/api/tts/speak`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to generate speech");
  const data = await res.json();
  if (data.audio_url.startsWith("data:") || data.audio_url.startsWith("http")) {
    return data.audio_url;
  }
  return `${BACKEND_URL}${data.audio_url}`;
}

export async function evaluateAnswer({ question, student_answer, correct_answer, misconception_guide, language }) {
  const res = await fetch(`${BACKEND_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, student_answer, correct_answer, misconception_guide, language }),
  });
  if (!res.ok) throw new Error("Evaluation request failed");
  return await res.json();
}

