import io
from PIL import Image, ExifTags, UnidentifiedImageError
from fastapi import HTTPException
from app.schemas.analysis import MetadataReport, ImageProperties, AnalysisResponse
from app.core.security import validate_magic_bytes, validate_file_size
import os

def extract_metadata(file_buffer: bytes, filename: str) -> AnalysisResponse:
    file_size = len(file_buffer)
    validate_file_size(file_size)
    
    if len(file_buffer) < 12:
        raise HTTPException(status_code=400, detail="Invalid file buffer")
    
    validate_magic_bytes(file_buffer[:12])
    
    try:
        image = Image.open(io.BytesIO(file_buffer))
        image.load()
    except Image.DecompressionBombError:
        raise HTTPException(status_code=400, detail="Decompression bomb detected")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Unidentified or corrupted image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")
        
    properties = ImageProperties(
        width=image.width,
        height=image.height,
        format=image.format or "UNKNOWN",
        mode=image.mode
    )
    
    exif_data = {}
    has_exif = False
    
    raw_exif = image.getexif()
    if raw_exif:
        has_exif = True
        for tag_id, data in raw_exif.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            if tag_name in ['Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal', 'SubSecTime', 'GPSInfo']:
                exif_data[tag_name] = str(data)
                
    quantization_tables = None
    if image.format == 'JPEG' and hasattr(image, 'quantization'):
        quantization_tables = {str(k): list(v) for k, v in image.quantization.items()}
            
    note = None
    if not has_exif:
        note = "Missing metadata is inconclusive and common across social media platforms. Never flag missing EXIF as proof of manipulation."
        
    metadata = MetadataReport(
        has_exif=has_exif,
        exif_data=exif_data,
        quantization_tables=quantization_tables,
        note=note
    )
    
    safe_filename = os.path.basename(filename)
    
    return AnalysisResponse(
        filename=safe_filename,
        file_size=file_size,
        properties=properties,
        metadata=metadata
    )
