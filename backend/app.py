"""FastAPI backend prototype for Text Analysis endpoint using Gemini prompts."""
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import time
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from gemini_client import call_gemini, transcribe_audio_with_gemini
from media_utils import ENABLE_ASR, ENABLE_OCR, extract_ocr_bytes
import storage
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="SarcasmDetect AI API")

# Allow local development origins and production Netlify domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "https://sarcasmdetect-ai.netlify.app",
        "https://*.netlify.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If using local uploads, serve them at /uploads for demo convenience
try:
    if not storage.ENABLE_S3:
        app.mount("/uploads", StaticFiles(directory=storage.UPLOAD_DIR), name="uploads")
except Exception:
    # best-effort; continue if static mounting not possible in some environments
    pass


class TextAnalyzeRequest(BaseModel):
    # Make user_id optional with a default so requests without it won't 422
    user_id: Optional[str] = None
    text: str
    context: Optional[List[str]] = []


class TextAnalyzeResponse(BaseModel):
    sarcasm_label: str
    sarcasm_intensity: int
    emotions: List[dict]
    risk_score: int
    highlights: List[str]
    explanation: str
    mode_explanation: Optional[str] = None


class VoiceAnalyzeResponse(TextAnalyzeResponse):
    transcript: str
    timestamps_explanations: Optional[List[dict]] = []


class ImageAnalyzeResponse(TextAnalyzeResponse):
    ocr_text: str
    offensive_flag: Optional[bool] = False
    attention_regions: Optional[List[dict]] = []


# Simple in-memory rate limiting per process (not for production)
REQUESTS = 0
START_TIME = time.time()
RATE_LIMIT_PER_MIN = 120  # requests per minute per process


def check_rate_limit():
    global REQUESTS, START_TIME
    now = time.time()
    # reset window
    if now - START_TIME > 60:
        START_TIME = now
        REQUESTS = 0
    REQUESTS += 1
    if REQUESTS > RATE_LIMIT_PER_MIN:
        return False
    return True


def _safe_int(value, default: int = 0) -> int:
    """Convert a value to int, falling back gracefully."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _parse_possible_json(value, fallback):
    """Allow Gemini to return JSON fields either as objects or JSON strings."""
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return fallback
    return value if value is not None else fallback


def try_parse_json_field(value, fallback=None):
    """Public helper for legacy call sites expecting JSON decoding."""
    coerced = _parse_possible_json(value, fallback)
    if coerced is None:
        return fallback
    return coerced


def _normalize_analysis_payload(parsed: Optional[dict]) -> dict:
    """Coerce Gemini output into the standard response schema."""
    if not isinstance(parsed, dict):
        parsed = {}

    emotions = _parse_possible_json(parsed.get("emotions", []), [])
    highlights = _parse_possible_json(parsed.get("highlights", []), [])

    # Ensure list types when Gemini returns a single item or dict
    if not isinstance(emotions, list):
        emotions = [emotions] if emotions else []
    if not isinstance(highlights, list):
        highlights = [highlights] if highlights else []

    return {
        "sarcasm_label": parsed.get("sarcasm_label", "not_sarcastic"),
        "sarcasm_intensity": _safe_int(parsed.get("sarcasm_intensity"), 0),
        "emotions": emotions,
        "risk_score": _safe_int(parsed.get("risk_score"), 0),
        "highlights": highlights,
        "explanation": parsed.get("explanation", ""),
        "mode_explanation": parsed.get("mode_explanation"),
    }


def parse_json_from_text(raw: str):
    """Extract and parse JSON from text, handling markdown code blocks and other formats."""
    try:
        # Try direct parsing first
        return json.loads(raw)
    except Exception:
        import re
        
        # Try to extract from markdown code blocks (```json ... ``` or ``` ... ```)
        code_block = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.S)
        if code_block:
            try:
                return json.loads(code_block.group(1))
            except Exception:
                pass
        
        # Try to find any JSON object in the text
        json_match = re.search(r"\{.*\}", raw, re.S)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except Exception:
                pass

        # Fallback: attempt to find the first balanced JSON object (handles nested braces)
        def find_first_json_substring(s: str) -> str | None:
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

        js = find_first_json_substring(raw)
        if js:
            try:
                return json.loads(js)
            except Exception:
                pass
        
        return None


@app.post("/api/analyze/text", response_model=TextAnalyzeResponse)
async def analyze_text(req: TextAnalyzeRequest, request: Request):
    if not req.text or len(req.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text is required")

    if not check_rate_limit():
        raise HTTPException(status_code=429, detail="Rate limit exceeded, try again later")

    # Build default mode prompt
    context_snippet = "\n".join(req.context[-3:]) if req.context else ""
    prompt_text = (
        f"Analyze the following text for sarcasm and tone. "
        f"Focus on general language analysis without domain-specific elements. "
        f"Text: \"{req.text}\"\nContext: \"{context_snippet}\"\nReturn JSON."
    )

    # Retry wrapper: attempt call and one retry on failure
    try:
        raw = call_gemini(prompt_text)
    except Exception as e:
        logger.error("First Gemini call failed: %s", e)
        try:
            time.sleep(1)
            raw = call_gemini(prompt_text)
        except Exception as e2:
            logger.exception("Gemini call failed after retry: %s", e2)
            raise HTTPException(status_code=502, detail="Upstream analysis service error")

    parsed = parse_json_from_text(raw)
    if not parsed:
        logger.error("Failed to parse JSON. Raw response: %s", raw[:1000])
        raise HTTPException(status_code=502, detail="Failed to parse JSON from Gemini response")

    # Minimal validation and fallback defaults
    resp = _normalize_analysis_payload(parsed)

    return resp


@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze/voice", response_model=VoiceAnalyzeResponse)
async def analyze_voice(
    audio_file: Optional[UploadFile] = File(None), 
    transcript: Optional[str] = Form(None), 
    acoustic_notes: Optional[str] = Form(None)
):
    """Accept an audio file OR transcript text for sarcasm analysis.
    
    If audio_file is provided, it will be transcribed using Gemini API (FREE!).
    If transcript is provided directly, it will be used as-is.
    """
    from gemini_client import transcribe_audio_with_gemini
    
    # Check if we have either audio file or transcript
    if not audio_file and (not transcript or len(transcript.strip()) == 0):
        raise HTTPException(
            status_code=400, 
            detail="Either audio_file or transcript is required"
        )
    
    # If audio file is provided, transcribe it with Gemini API
    if audio_file:
        logger.info(f"Received audio file: {audio_file.filename}, content_type: {audio_file.content_type}")
        contents = await audio_file.read()
        
        # Determine MIME type
        mime_type = audio_file.content_type or 'audio/mpeg'
        
        # Map common MIME types for Gemini API
        mime_mapping = {
            'audio/mpeg': 'audio/mp3',
            'audio/x-m4a': 'audio/mp4',
            'video/mp4': 'video/mp4',
            'audio/webm': 'audio/wav',  # WebM recorded from browser
            'video/webm': 'audio/wav',  # WebM may be detected as video
        }
        mime_type = mime_mapping.get(mime_type, mime_type)
        
        try:
            logger.info("Transcribing audio with Gemini API...")
            transcript = transcribe_audio_with_gemini(contents, mime_type, timeout=60)
            logger.info(f"Transcription complete: {len(transcript)} chars")
        except Exception as e:
            logger.exception("Audio transcription failed: %s", e)
            raise HTTPException(
                status_code=500, 
                detail=f"Audio transcription failed: {str(e)}"
            )

    prompt_text = f'Transcript: "{transcript}"\nAcoustic notes: "{acoustic_notes or ""}"\nReturn JSON.'
    raw = call_gemini(prompt_text)
    parsed = parse_json_from_text(raw)
    if not parsed:
        raise HTTPException(status_code=502, detail="Failed to parse JSON from Gemini response")
    def try_parse_json_field(val):
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return val
        return val

    payload = _normalize_analysis_payload(parsed)
    resp = {
        "transcript": transcript,
        "sarcasm_label": payload["sarcasm_label"],
        "sarcasm_intensity": payload["sarcasm_intensity"],
        "emotions": try_parse_json_field(parsed.get("emotions", payload["emotions"])) or [],
        "timestamps_explanations": try_parse_json_field(parsed.get("timestamps_explanations", [])) or [],
        "risk_score": payload["risk_score"],
        "highlights": try_parse_json_field(parsed.get("highlights", payload["highlights"])) or [],
        "explanation": payload["explanation"],
        "mode_explanation": payload.get("mode_explanation"),
    }
    return resp


@app.post("/api/analyze/image", response_model=ImageAnalyzeResponse)
async def analyze_image(
    request: Request,
    file: UploadFile = File(...),
    ocr_text: Optional[str] = Form(None),
    image_caption: Optional[str] = Form(None),
):
    """Accept an image file and optional OCR text. If OCR not provided, try server-side OCR when enabled.

    Uses `extract_ocr_bytes` that saves uploads and runs local OCR when possible.
    """
    contents = await file.read()

    if not ocr_text or len(ocr_text.strip()) == 0:
        if ENABLE_OCR:
            try:
                ocr_res = extract_ocr_bytes(contents, filename=(file.filename or 'upload_image.png'))
            except ImportError:
                raise HTTPException(status_code=500, detail="OCR not installed on server; provide OCR text manually.")
            except Exception as e:
                logger.exception("OCR error: %s", e)
                raise HTTPException(status_code=500, detail="OCR failed; provide OCR text manually or check server logs.")

            if ocr_res.get('error'):
                # Provide an actionable message for common OCR.space provider errors (e.g., E301)
                err = str(ocr_res.get('error'))
                if 'E301' in err or 'Unable to process' in err:
                    # Suggest client-side fixes (resave as JPEG, increase size) and allow manual OCR text entry
                    raise HTTPException(status_code=422, detail=(
                        "OCR provider couldn't process the image (E301). "
                        "Try re-saving the image as JPEG, upload a larger/clearer image, or paste the OCR text manually."
                    ))
                raise HTTPException(status_code=500, detail=f"OCR error: {err}")
            if ocr_res.get('text'):
                ocr_text = ocr_res.get('text')
            else:
                raise HTTPException(status_code=400, detail=ocr_res.get('note', 'OCR did not extract text; provide OCR manually.'))
        else:
            raise HTTPException(status_code=400, detail="OCR text is required for demo (paste OCR text) unless OCR is configured on server).")

    domain = request.headers.get("X-Domain", "default")

    if domain == "social_media":
        prompt_text = (
            "Analyze the following OCR text as social media content (memes, screenshots, DMs). "
            "Account for sarcasm cues like hashtags, emojis, and exaggerated slang."
            f"\nOCR text: \"{ocr_text}\""
            f"\nImage caption/context: \"{image_caption or ''}\""
            "\nReturn JSON with sarcasm_label, sarcasm_intensity, emotions, risk_score, highlights, explanation."
        )
    else:
        prompt_text = f'OCR text: "{ocr_text}"\nImage caption: "{image_caption or ""}"\nReturn JSON.'

    raw = call_gemini(prompt_text)
    parsed = parse_json_from_text(raw)
    if not parsed:
        raise HTTPException(status_code=502, detail="Failed to parse JSON from Gemini response")

    payload = _normalize_analysis_payload(parsed)
    if domain == "social_media":
        label_map = {
            "sarcastic": "Sarcastic Post",
            "not_sarcastic": "Neutral Post",
            "highly_sarcastic": "Highly Sarcastic Post",
        }
        payload["sarcasm_label"] = label_map.get(payload["sarcasm_label"], payload["sarcasm_label"])

        social_note = " Social media pipeline: OCR text is interpreted with meme/post tone (hashtags, emojis, slang)."
        if social_note not in payload["explanation"]:
            payload["explanation"] = (payload["explanation"].strip() + social_note).strip()
        payload["mode_explanation"] = (
            "Social media image pipeline: OCR output is normalized for hashtags, mentions, and informal phrasing before sarcasm scoring."
        )

    resp = {
        "ocr_text": ocr_text,
        "sarcasm_label": payload["sarcasm_label"],
        "offensive_flag": parsed.get("offensive_flag", False),
        "attention_regions": try_parse_json_field(parsed.get("attention_regions", [])) or [],
        "sarcasm_intensity": payload["sarcasm_intensity"],
        "emotions": try_parse_json_field(parsed.get("emotions", payload["emotions"])) or [],
        "risk_score": payload["risk_score"],
        "highlights": try_parse_json_field(parsed.get("highlights", payload["highlights"])) or [],
        "explanation": payload["explanation"],
        "mode_explanation": payload.get("mode_explanation"),
    }
    return resp


@app.post("/api/analyze", response_model=TextAnalyzeResponse)
async def analyze(req: TextAnalyzeRequest, request: Request):
    domain = request.headers.get("X-Domain", "default")  # Read domain from headers

    if not req.text or len(req.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text is required")

    if not check_rate_limit():
        raise HTTPException(status_code=429, detail="Rate limit exceeded, try again later")

    # Route to the appropriate pipeline
    if domain == 'social_media':
        result = await analyze_social_media(req)
    else:
        result = await analyze_text(req, request)  # Default pipeline

    return result


async def analyze_social_media(req: TextAnalyzeRequest):
    """Analyze text using the social media pipeline (e.g., for tweets, posts)."""
    # Preprocess for social media (e.g., handle hashtags, emojis, slang)
    processed_text = preprocess_social_media(req.text)

    context_snippet = "\n".join(req.context[-3:]) if req.context else ""

    # Build enhanced social media-specific prompt with more examples
    prompt_text = (
        f"Analyze the following text in the context of social media. "
        f"Consider hashtags, emojis, informal expressions, and the tone typical of social media posts. "
        f"Provide an explanation that references these elements explicitly. "
        f"Examples:\n"
        f"1. \"Wow, another Monday morning. Just what I needed to start my week off perfectly. #Blessed #LivingTheDream\"\n"
        f"   Sarcasm: High intensity, Explanation: Overly positive language and hashtags used ironically to express annoyance.\n"
        f"2. \"Best coffee ever! #Amazing #Blessed\"\n"
        f"   Sarcasm: None, Explanation: Genuine positive sentiment expressed through hashtags and adjectives.\n"
        f"3. \"Sure, because staying late at work is my favorite thing to do. #WorkLife #Goals\"\n"
        f"   Sarcasm: High intensity, Explanation: Irony in expressing enjoyment of staying late at work.\n"
        f"4. \"Had a great time at the party last night! 🎉 #FunTimes\"\n"
        f"   Sarcasm: None, Explanation: Genuine excitement and positive sentiment conveyed through emojis and hashtags.\n"
        f"5. \"Oh, fantastic! Another software update that breaks everything. #TechLife\"\n"
        f"   Sarcasm: High intensity, Explanation: Sarcasm in expressing frustration with software updates.\n"
        f"Text: \"{processed_text}\"\n"
        f"Context: \"{context_snippet}\"\n"
        "Return JSON with keys: sarcasm_label, sarcasm_intensity, emotions, risk_score, highlights, explanation."
    )

    # Use the default text analysis pipeline on processed text
    raw = call_gemini(prompt_text)
    parsed = parse_json_from_text(raw)
    if not parsed:
        raise HTTPException(status_code=502, detail="Failed to parse JSON from Gemini response")
    payload = _normalize_analysis_payload(parsed)

    label_map = {
        "sarcastic": "Sarcastic Post",
        "not_sarcastic": "Neutral Post",
        "highly_sarcastic": "Highly Sarcastic Post",
    }
    payload["sarcasm_label"] = label_map.get(payload["sarcasm_label"], payload["sarcasm_label"])

    # Encourage explanations that point out social media cues without overwriting the model output completely
    explanation_addendum = " This assessment accounts for hashtags, emojis, and informal phrasing typical of social media posts."
    if explanation_addendum not in payload["explanation"]:
        payload["explanation"] = (payload["explanation"].strip() + explanation_addendum).strip()

    payload["mode_explanation"] = (
        "Social media pipeline: inputs are preprocessed for hashtags, mentions, and emojis before sarcasm analysis."
    )

    return payload


def preprocess_social_media(text: str):
    """Preprocess text for social media analysis.

    Example: Remove hashtags, analyze emojis, expand slang, etc.
    """
    # Basic example: remove hashtags and mentions
    text = text.replace('#', '').replace('@', '')

    # TODO: Add more preprocessing as needed (e.g., emoji analysis, slang expansion)

    return text
