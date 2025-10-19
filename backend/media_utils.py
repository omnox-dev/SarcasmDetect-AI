"""OCR utilities using OCR.space API."""
import os
import base64
import requests
import logging

logger = logging.getLogger(__name__)

ENABLE_OCR = os.getenv("ENABLE_OCR", "true").lower() == "true"
ENABLE_ASR = os.getenv("ENABLE_ASR", "false").lower() == "true"
OCR_SPACE_API_KEY = os.getenv("OCR_SPACE_API_KEY", "helloworld")


def extract_ocr_from_bytes(image_bytes: bytes) -> str:
    url = "https://api.ocr.space/parse/image"
    # Prefer multipart file upload rather than base64 payload — more robust for some file types
    files = {'file': ('upload.png', image_bytes, 'image/png')}
    data = {'apikey': OCR_SPACE_API_KEY, 'language': 'eng', 'OCREngine': 2}
    response = requests.post(url, files=files, data=data, timeout=60)
    response.raise_for_status()
    result = response.json()
    # Helpful debug logging for troubleshooting provider errors (dev-only)
    logger.debug("OCR.space response: %s", result)
    if result.get('OCRExitCode') != 1:
        # Prefer structured messages when available
        err_msg = result.get('ErrorMessage') or result.get('ErrorDetails') or ['Unknown']
        # ErrorMessage may be a list
        if isinstance(err_msg, list):
            err_msg = err_msg[0]
        raise Exception(f"OCR failed: {err_msg}")
    return result['ParsedResults'][0]['ParsedText'].strip()


def extract_ocr_bytes(data: bytes, filename: str) -> dict:
    try:
        text = extract_ocr_from_bytes(data)
        return {'text': text, 'filename': filename}
    except Exception as e:
        return {'error': str(e)}
