import edge_tts
import asyncio
import base64

# Personas and specific neural voices
TEACHER_VOICE_MAPPINGS = {
    "dr-maya": {
        "en": "en-IN-NeerjaNeural",         # Warm, analytical Indian English female
        "en-US": "en-US-JennyNeural",
        "hi": "hi-IN-SwaraNeural",          # Fluent Hindi female
        "hinglish": "hi-IN-SwaraNeural",
    },
    "prof-alex": {
        "en": "en-IN-PrabhatNeural",        # Practical Tech Indian English male
        "en-US": "en-US-ChristopherNeural", # American Tech male
        "hi": "hi-IN-MadhurNeural",         # Fluent Hindi male
        "hinglish": "hi-IN-MadhurNeural",
    },
    "ananya": {
        "en": "en-IN-NeerjaNeural",
        "en-US": "en-US-JennyNeural",
        "hi": "hi-IN-KavyaNeural",          # Expressive, gentle Hindi female
        "hinglish": "hi-IN-KavyaNeural",
    },
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"

async def generate_speech(text: str, language: str = "en", teacher_id: str = "dr-maya") -> str:
    """
    Generates high-quality neural voice audio using Microsoft Edge TTS in-memory.
    Selects voice tailored to teacher persona and language.
    Returns a base64 data URI string (data:audio/mp3;base64,...) for serverless & cloud readiness.
    """
    teacher_voices = TEACHER_VOICE_MAPPINGS.get(teacher_id.lower(), TEACHER_VOICE_MAPPINGS["dr-maya"])
    voice = teacher_voices.get(language.lower(), teacher_voices.get("en", DEFAULT_VOICE))
    
    communicate = edge_tts.Communicate(text, voice)
    
    audio_bytes = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
            
    b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:audio/mp3;base64,{b64_audio}"
