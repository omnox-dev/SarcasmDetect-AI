"""Simple local file storage module."""
import os
from pathlib import Path

ENABLE_S3 = False
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def save_upload_bytes(data: bytes, filename: str) -> dict:
    filepath = UPLOAD_DIR / filename
    filepath.write_bytes(data)
    return {"file_path": str(filepath), "file_url": f"/uploads/{filename}", "filename": filename}
