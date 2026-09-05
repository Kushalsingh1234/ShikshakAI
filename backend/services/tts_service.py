import edge_tts
import asyncio
import base64
import re

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

def clean_text_for_speech(text: str) -> str:
    """
    Sanitizes written teacher script into fluid, natural spoken prose.
    Strips raw markdown, symbols, code markers, and formats mathematical
    symbols into natural verbal equivalents so the TTS engine sounds like
    a human professor rather than reading code/formatting tokens.
    """
    if not text:
        return ""
    
    clean = text

    # 1. Remove markdown code blocks and inline code markers
    clean = re.sub(r'```[\s\S]*?```', ' ', clean)
    clean = re.sub(r'`([^`]+)`', r'\1', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean)

    # 2. Remove markdown bold/italic asterisks & underscores
    clean = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', clean)
    clean = re.sub(r'_{1,3}([^_]+)_{1,3}', r'\1', clean)
    
    # 3. Remove markdown headers (#, ##, ###) and list markers (*, -, +, 1., 2., •)
    clean = re.sub(r'^\s*#{1,6}\s*', '', clean, flags=re.MULTILINE)
    clean = re.sub(r'^\s*[\*\-\+•]\s+', '', clean, flags=re.MULTILINE)
    clean = re.sub(r'^\s*\d+\.\s+', '', clean, flags=re.MULTILINE)

    # 4. Convert LaTeX & Math formulas to natural spoken words
    clean = re.sub(r'(\\frac|\tfrac|\x0crac|\frac)\s*\{?([^}]+)\}?\s*\{?([^}]+)\}?', r'\2 over \3', clean)
    clean = re.sub(r'(\\sqrt|\sqrt)\s*\{?([^}]+)\}?', r'square root of \2', clean)
    
    # Exponents: x^2 -> x squared, x^3 -> x cubed, x^n -> x to the power of n
    clean = re.sub(r'([a-zA-Z0-9\)])\^2\b', r'\1 squared', clean)
    clean = re.sub(r'([a-zA-Z0-9\)])\^3\b', r'\1 cubed', clean)
    clean = re.sub(r'([a-zA-Z0-9\)])\^([a-zA-Z0-9]+)', r'\1 to the power of \2', clean)
    
    # Chemical / Subscripts: CO_2 -> CO2, H_2O -> H2O
    clean = re.sub(r'([A-Z][a-z]?)_(\d+)', r'\1 \2', clean)
    
    # Common math symbols to spoken words
    replacements = [
        (r'\\times\b|\btimes\b|\t\s*imes\b', ' times '),
        (r'\\cdot\b', ' times '),
        (r'\\div\b', ' divided by '),
        (r'\\approx\b', ' approximately '),
        (r'\\le\b', ' less than or equal to '),
        (r'\\ge\b', ' greater than or equal to '),
        (r'\\neq\b|\bneq\b', ' is not equal to '),
        (r'\\pm\b', ' plus or minus '),
        (r'\\theta\b', ' theta '),
        (r'\\pi\b', ' pi '),
        (r'\\lambda\b', ' lambda '),
        (r'\\alpha\b', ' alpha '),
        (r'\\beta\b', ' beta '),
        (r'\\Delta\b', ' delta '),
        (r'\\sum\b', ' sum of '),
        (r'\\int\b', ' integral of '),
        (r'\\infty\b', ' infinity '),
        (r'\\rightarrow\b', ' leads to '),
        (r'(?i)\bO\(log\s*N\)', 'O of log N'),
        (r'->', ' leads to '),
        (r'=>', ' implies that '),
        (r'!=', ' is not equal to '),
        (r'<=', ' is less than or equal to '),
        (r'>=', ' is greater than or equal to '),
        (r'==', ' equals '),
        (r'\s*=\s*', ' equals '),
        (r'\s*\+\s*', ' plus '),
        (r'≈', ' approximately '),
        (r'≠', ' is not equal to '),
        (r'≤', ' is less than or equal to '),
        (r'≥', ' is greater than or equal to '),
        (r'±', ' plus or minus '),
        (r'°C\b', ' degrees Celsius '),
        (r'°F\b', ' degrees Fahrenheit '),
        (r'%', ' percent '),
        (r'&', ' and '),
        (r'\/', ' or '),
    ]
    for pattern, rep in replacements:
        clean = re.sub(pattern, rep, clean)

    # 5. Strip remaining LaTeX command backslashes (e.g. \mathbf, \text, etc.)
    clean = re.sub(r'\\[a-zA-Z]+', ' ', clean)

    # 6. Strip all remaining symbols: $, *, _, ^, ~, |, <, >, {, }, [, ], `, ", #, \
    clean = re.sub(r'[\$\*\_\\\^~\|<>{}\[\]`\"#]', ' ', clean)

    # Strip isolated hyphens
    clean = re.sub(r'(?<=\s)-(?=\s)', ' ', clean)

    # 7. Clean up multiple spaces, line breaks, and punctuation pauses
    clean = re.sub(r'\.{2,}', ', ', clean)
    clean = re.sub(r'\s*;\s*', ', ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()

    return clean

async def generate_speech(text: str, language: str = "en", teacher_id: str = "dr-maya") -> str:
    """
    Generates high-quality neural voice audio using Microsoft Edge TTS in-memory.
    Selects voice tailored to teacher persona and language.
    Sanitizes text so symbols, markdown, and formulas are never read literally.
    Returns a base64 data URI string (data:audio/mp3;base64,...) for serverless & cloud readiness.
    """
    teacher_voices = TEACHER_VOICE_MAPPINGS.get(teacher_id.lower(), TEACHER_VOICE_MAPPINGS["dr-maya"])
    voice = teacher_voices.get(language.lower(), teacher_voices.get("en", DEFAULT_VOICE))
    
    # Thoroughly strip symbols and convert formulas into spoken prose
    spoken_text = clean_text_for_speech(text)
    if not spoken_text:
        spoken_text = "Let us continue our exploration."
    
    communicate = edge_tts.Communicate(spoken_text, voice)
    
    audio_bytes = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
            
    b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:audio/mp3;base64,{b64_audio}"
