import edge_tts
import asyncio
import os
import uuid

# Free Edge-TTS Voices
VOICE_MAPPINGS = {
    "en": "en-IN-NeerjaNeural",         # Natural Indian English
    "en-US": "en-US-ChristopherNeural", # American English
    "hi": "hi-IN-SwaraNeural",          # Hindi Neural
    "hinglish": "hi-IN-MadhurNeural",   # Hinglish / Indian Accent
}

async def generate_speech(text: str, language: str = "en", output_dir: str = "static/audio") -> str:
    """
    Generates high quality neural voice audio using Microsoft Edge TTS (100% free, no API key).
    Returns relative filepath to the generated mp3 file.
    """
    os.makedirs(output_dir, exist_ok=True)
    voice = VOICE_MAPPINGS.get(language.lower(), "en-IN-NeerjaNeural")
    
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(output_dir, filename)
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(filepath)
    
    return f"/static/audio/{filename}"
