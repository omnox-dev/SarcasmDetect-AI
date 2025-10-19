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

app = FastAPI(title="SarcasmDetect API")

# Allow local development origins; change in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    # Build compact per-call prompt
    context_snippet = "\n".join(req.context[-3:]) if req.context else ""
    prompt_text = f'Text: "{req.text}"\nContext: "{context_snippet}"\nReturn JSON.'

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

    # Normalize certain fields which may be returned as JSON-encoded strings
    def try_parse_json_field(val):
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return val
        return val

    emotions = try_parse_json_field(parsed.get("emotions", [])) or []
    highlights = try_parse_json_field(parsed.get("highlights", [])) or []
    attention_regions = try_parse_json_field(parsed.get("attention_regions", [])) or []

    # Minimal validation and fallback defaults
    resp = {
        "sarcasm_label": parsed.get("sarcasm_label", "not_sarcastic"),
        "sarcasm_intensity": int(parsed.get("sarcasm_intensity", 0)),
        "emotions": emotions,
        "risk_score": int(parsed.get("risk_score", 0)),
        "highlights": highlights,
        "explanation": parsed.get("explanation", ""),
    }

    return resp


@app.get("/health")
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

    resp = {
        "transcript": transcript,
        "sarcasm_label": parsed.get("sarcasm_label", "not_sarcastic"),
        "sarcasm_intensity": int(parsed.get("sarcasm_intensity", 0)),
        "emotions": try_parse_json_field(parsed.get("emotions", [])) or [],
        "timestamps_explanations": try_parse_json_field(parsed.get("timestamps_explanations", [])) or [],
        "risk_score": int(parsed.get("risk_score", 0)),
        "highlights": try_parse_json_field(parsed.get("highlights", [])) or [],
        "explanation": parsed.get("explanation", ""),
    }
    return resp


@app.post("/api/analyze/image", response_model=ImageAnalyzeResponse)
async def analyze_image(file: UploadFile = File(...), ocr_text: Optional[str] = Form(None), image_caption: Optional[str] = Form(None)):
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

    prompt_text = f'OCR text: "{ocr_text}"\nImage caption: "{image_caption or ""}"\nReturn JSON.'
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

    resp = {
        "ocr_text": ocr_text,
        "sarcasm_label": parsed.get("sarcasm_label", "not_sarcastic"),
        "offensive_flag": parsed.get("offensive_flag", False),
        "attention_regions": try_parse_json_field(parsed.get("attention_regions", [])) or [],
        "sarcasm_intensity": int(parsed.get("sarcasm_intensity", 0)),
        "emotions": try_parse_json_field(parsed.get("emotions", [])) or [],
        "risk_score": int(parsed.get("risk_score", 0)),
        "highlights": try_parse_json_field(parsed.get("highlights", [])) or [],
        "explanation": parsed.get("explanation", ""),
    }
    return resp
