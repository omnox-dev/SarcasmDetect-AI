"""Gemini client with a safe mock fallback for local development.

This helper will call a real Gemini-like API when `GEMINI_API_KEY` is set and
`GEMINI_API_URL` is configured. When those are missing (or the URL contains
the example placeholder), it returns a canned JSON string so the app can be
tested/demoed without external credentials.
"""
from __future__ import annotations

import os
import json
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fastapi.exceptions import HTTPException

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Google Generative AI API endpoint - using gemini-flash-latest (stable API with text output)
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
)

# Enhanced system prompt for better sarcasm detection with strict JSON output
SYSTEM_PROMPT = """Analyze the following text for sarcasm and tone. Return ONLY a valid JSON object, nothing else. No explanation, no markdown, no extra text.

The JSON must have exactly these keys:
{
  "sarcasm_label": "sarcastic" or "not_sarcastic",
  "sarcasm_intensity": 0-100,
  "emotions": [{"label": "emotion_name", "prob": 0.0-1.0}],
  "risk_score": 0-100,
  "highlights": ["phrase1", "phrase2"],
  "explanation": "brief explanation in 1-2 sentences"
}"""

DEFAULT_HEADERS = {"Content-Type": "application/json"}


def _create_session(total_retries: int = 3, backoff_factor: float = 0.5) -> requests.Session:
    s = requests.Session()
    retries = Retry(
        total=total_retries,
        backoff_factor=backoff_factor,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST", "GET"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retries)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    s.headers.update(DEFAULT_HEADERS)
    return s


_SESSION = _create_session()


def _extract_text_from_response(data) -> str:
    """Extract text from Google Generative AI API response format."""
    if not data:
        return ""
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        # Google Generative AI format: candidates[0].content.parts[0].text
        if "candidates" in data and isinstance(data["candidates"], list) and len(data["candidates"]) > 0:
            first = data["candidates"][0]
            if isinstance(first, dict):
                # Check for content.parts[0].text
                if "content" in first and isinstance(first["content"], dict):
                    parts = first["content"].get("parts", [])
                    if parts and len(parts) > 0 and isinstance(parts[0], dict):
                        text = parts[0].get("text")
                        if text:
                            return text
                # Fallback: check for direct text field
                if "text" in first:
                    return first["text"]
            if isinstance(first, str):
                return first
        # Legacy formats
        for k in ("text", "output", "result"):
            if k in data and isinstance(data[k], str):
                return data[k]
        if "choices" in data and isinstance(data["choices"], list) and len(data["choices"]) > 0:
            c = data["choices"][0]
            if isinstance(c, dict) and "text" in c:
                return c["text"]
            if isinstance(c, str):
                return c
    try:
        return str(data)
    except Exception:
        return ""


def _find_first_json_substring(s: str) -> str | None:
    """Find the first balanced JSON object in a string and return it.

    This scans for the first '{' and then walks forward counting braces to find
    the matching closing '}'. Returns the substring including braces, or None.
    """
    if not s or '{' not in s:
        return None
    start = s.find('{')
    depth = 0
    for i in range(start, len(s)):
        ch = s[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return s[start:i+1]
    return None


def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str, timeout: int = 60) -> str:
    """Transcribe audio using Gemini API with inline audio data.
    
    Args:
        audio_bytes: Raw audio file bytes
        mime_type: MIME type of the audio (e.g., 'audio/mp3', 'audio/wav', 'video/mp4')
        timeout: Request timeout in seconds
        
    Returns:
        Transcript text string
    """
    import base64
    
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, returning mock transcript")
        return "This is a mocked transcript for demo purposes."
    
    # Convert audio bytes to base64
    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    # Gemini API payload with inline audio
    payload = {
        "contents": [{
            "parts": [
                {"text": "Generate a transcript of the speech in this audio. Return only the transcript text, nothing else."},
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": audio_b64
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 2000,
        }
    }
    
    logger.info(f"Transcribing audio with Gemini API (mime_type={mime_type}, size={len(audio_bytes)} bytes)")
    
    try:
        resp = _SESSION.post(GEMINI_API_URL, json=payload, timeout=timeout)
        logger.debug("Transcription response status: %s", resp.status_code)
        resp.raise_for_status()
    except Exception as e:
        logger.error("Gemini audio transcription error: %s", e)
        if 'resp' in locals():
            logger.error("Response status: %s", resp.status_code)
            logger.error("Response body: %s", resp.text[:500])
        raise HTTPException(status_code=502, detail=f"Audio transcription failed: {str(e)}")
    
    try:
        data = resp.json()
        transcript = _extract_text_from_response(data)
        logger.info(f"Transcription successful, length: {len(transcript)} chars")
        return transcript.strip()
    except Exception as e:
        logger.error("Failed to parse transcription response: %s", e)
        raise HTTPException(status_code=502, detail="Invalid transcription response")


def call_gemini(prompt_text: str, max_tokens: int = 180, temperature: float = 0.0, timeout: int = 30) -> str:
    """Call Gemini-like API and return a text blob. Falls back to a canned JSON for demos.

    Returns a string which is either the model output or a JSON string suitable
    for parsing by the downstream code.
    """
    # If no API key is configured, return a canned response
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, returning mock response")
        mock = {
            "sarcasm_label": "not_sarcastic",
            "sarcasm_intensity": 5,
            "emotions": [{"label": "neutral", "prob": 0.8}],
            "risk_score": 10,
            "highlights": ["demo highlight"],
            "explanation": "This is a mocked analysis for demo/testing purposes.",
        }
        return json.dumps(mock)

    # Google Generative AI API payload format
    payload = {
        "contents": [{
            "parts": [{
                "text": SYSTEM_PROMPT + "\n\n" + prompt_text
            }]
        }],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 1000,  # Increased to ensure complete JSON response
        }
    }
    logger.debug("Calling Gemini API: url=%s", GEMINI_API_URL)
    logger.debug("Payload sent to Gemini API: %s", payload)
    try:
        resp = _SESSION.post(GEMINI_API_URL, json=payload, timeout=timeout)
        logger.debug("Response status code: %s", resp.status_code)
        logger.debug("Response text: %s", resp.text[:500])
        resp.raise_for_status()
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        if 'resp' in locals():
            logger.error("Response status: %s", resp.status_code)
            logger.error("Response body: %s", resp.text[:500])
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")

    try:
        data = resp.json()
    except ValueError:
        logger.error("Failed to parse JSON response from Gemini API: %s", resp.text)
        raise HTTPException(status_code=502, detail="Invalid JSON response from Gemini API")

    logger.debug("Response from Gemini API: %s", data)
    text = _extract_text_from_response(data)
    # If the model returned extra commentary around the JSON, try to extract a JSON substring
    try:
        parsed = None
        # If direct text looks like JSON, return it
        if text.strip().startswith('{'):
            return text
        # Try to find a JSON object inside the text
        json_sub = _find_first_json_substring(text)
        if json_sub:
            return json_sub
        return text
    except Exception:
        return text
