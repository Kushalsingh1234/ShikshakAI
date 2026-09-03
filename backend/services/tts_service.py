import edge_tts
import asyncio
import base64

VOICE_MAPPINGS = {
    "en": "en-IN-NeerjaNeural",         # Natural Indian English
    "en-US": "en-US-ChristopherNeural", # American English
    "hi": "hi-IN-SwaraNeural",          # Hindi Neural
    "hinglish": "hi-IN-MadhurNeural",   # Hinglish / Indian Accent
}

async def generate_speech(text: str, language: str = "en") -> str:
    """
    Generates high-quality neural voice audio using Microsoft Edge TTS in-memory.
    Returns a data URI string (data:audio/mp3;base64,...) that plays directly in browsers
    and works 100% reliably in serverless environments like Vercel and AWS.
    """
    voice = VOICE_MAPPINGS.get(language.lower(), "en-IN-NeerjaNeural")
    communicate = edge_tts.Communicate(text, voice)
    
    audio_bytes = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
            
    b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:audio/mp3;base64,{b64_audio}"
