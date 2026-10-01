from fastapi import HTTPException
from PIL import Image

# Defensive limits
Image.MAX_IMAGE_PIXELS = 89_478_485 # Approx 89MP
MAX_FILE_SIZE = 15 * 1024 * 1024 # 15MB

MAGIC_BYTES = {
    b'\xff\xd8\xff': 'JPEG',
    b'\x89PNG\r\n\x1a\n': 'PNG',
    b'RIFF': 'WEBP',
}

def validate_file_size(file_size: int):
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Payload Too Large: File exceeds 15MB limit")

def validate_magic_bytes(header: bytes) -> str:
    for magic, img_format in MAGIC_BYTES.items():
        if header.startswith(magic):
            if img_format == 'WEBP':
                if header[8:12] != b'WEBP':
                    continue
            return img_format
    raise HTTPException(status_code=400, detail="Invalid file format or signature")
