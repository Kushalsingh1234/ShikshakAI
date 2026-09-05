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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(`${BACKEND_URL}/api/lesson/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, learner_level, target_duration_minutes, language, uploaded_filename }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Failed to generate lesson plan");
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function fetchGeneratedCourse({ topic, learner_level = "beginner", language = "en" }) {
  const res = await fetch(`${BACKEND_URL}/api/course/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, learner_level, language }),
  });
  if (!res.ok) throw new Error("Failed to generate course");
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

export async function askTeacherQuestion({ topic, scene_title, teacher_name, current_visual_content, question, language = "en" }) {
  const res = await fetch(`${BACKEND_URL}/api/studio/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      scene_title,
      teacher_name,
      current_visual_content,
      question,
      language
    }),
  });
  if (!res.ok) throw new Error("Failed to ask teacher question");
  return await res.json();
}

export async function fetchAdaptiveScene({ topic, misconception, original_question, student_answer, language = "en" }) {
  const res = await fetch(`${BACKEND_URL}/api/studio/adapt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      misconception,
      original_question,
      student_answer,
      language
    }),
  });
  if (!res.ok) throw new Error("Failed to generate adaptive scene");
  return await res.json();
}

export async function fetchExplanationScript({
  topic,
  teacher_script,
  step_type = "explanation",
  visual_type = null,
  visual_title = null,
  visual_content = null,
  language = "en"
}) {
  const res = await fetch(`${BACKEND_URL}/api/explanation/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      teacher_script,
      step_type,
      visual_type,
      visual_title,
      visual_content,
      language
    }),
  });
  if (!res.ok) throw new Error("Failed to generate explanation script");
  return await res.json();
}


