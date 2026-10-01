import io
import os
import base64
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException

from app.core.security import validate_magic_bytes, validate_file_size
from app.schemas.analysis import (
    ImageProperties,
    ELAResult,
    FrequencyResult,
    ForensicAnalysisReport
)

def perform_ela(image: Image.Image) -> ELAResult:
    # Ensure RGB conversion for uniform JPEG compression
    rgb_image = image.convert("RGB")
    
    buffer_jpeg = io.BytesIO()
    rgb_image.save(buffer_jpeg, format="JPEG", quality=95)
    buffer_jpeg.seek(0)
    recompressed_image = Image.open(buffer_jpeg)
    
    orig_arr = np.array(rgb_image, dtype=np.float32)
    recomp_arr = np.array(recompressed_image, dtype=np.float32)
    diff = np.abs(orig_arr - recomp_arr)
    
    mean_diff = float(np.mean(diff))
    max_diff = float(np.max(diff))
    std_diff = float(np.std(diff))
    
    # Scale difference map 15x and clamp to 0-255
    scaled_diff = np.clip(diff * 15.0, 0, 255).astype(np.uint8)
    diff_img = Image.fromarray(scaled_diff)
    
    ela_buf = io.BytesIO()
    diff_img.save(ela_buf, format="PNG")
    ela_b64 = base64.b64encode(ela_buf.getvalue()).decode("utf-8")
    ela_data_url = f"data:image/png;base64,{ela_b64}"
    
    interpretation = (
        "High uniform difference across the image is normal for fresh saves or non-JPEG inputs, "
        "whereas localized patches with starkly higher ELA response may suggest spliced or re-saved regions."
    )
    
    return ELAResult(
        mean_difference=round(mean_diff, 4),
        max_difference=round(max_diff, 4),
        std_difference=round(std_diff, 4),
        ela_image_base64=ela_data_url,
        interpretation=interpretation
    )

def perform_fft_analysis(image: Image.Image) -> FrequencyResult:
    gray_image = image.convert("L")
    gray_arr = np.array(gray_image, dtype=np.float32)
    
    # 2D FFT & shift zero-frequency component to center
    f = np.fft.fft2(gray_arr)
    f_shift = np.fft.fftshift(f)
    mag = np.abs(f_shift)
    
    # Logarithmic magnitude spectrum
    magnitude_spectrum = 20.0 * np.log(mag + 1e-9)
    
    rows, cols = gray_arr.shape
    crow, ccol = rows // 2, cols // 2
    r = max(1, int(min(rows, cols) * 0.1))
    
    y, x = np.ogrid[:rows, :cols]
    mask = (x - ccol) ** 2 + (y - crow) ** 2 <= r ** 2
    
    total_energy = float(np.sum(mag ** 2))
    low_freq_energy = float(np.sum(mag[mask] ** 2))
    high_freq_energy = max(0.0, total_energy - low_freq_energy)
    high_frequency_ratio = float(high_freq_energy / (total_energy + 1e-9))
    
    # Normalized 8-bit visual spectrum map
    min_val = float(np.min(magnitude_spectrum))
    max_val = float(np.max(magnitude_spectrum))
    if max_val > min_val:
        norm_spectrum = ((magnitude_spectrum - min_val) / (max_val - min_val) * 255.0).astype(np.uint8)
    else:
        norm_spectrum = np.zeros_like(magnitude_spectrum, dtype=np.uint8)
        
    spec_img = Image.fromarray(norm_spectrum)
    spec_buf = io.BytesIO()
    spec_img.save(spec_buf, format="PNG")
    spec_b64 = base64.b64encode(spec_buf.getvalue()).decode("utf-8")
    spec_data_url = f"data:image/png;base64,{spec_b64}"
    
    interpretation = (
        "Subtle periodic spikes or unnatural grid-like patterns can occur in synthetic upsamplers "
        "or diffusion models, but sharp natural image boundaries also cause horizontal/vertical cross-lines."
    )
    
    return FrequencyResult(
        high_frequency_ratio=round(high_frequency_ratio, 4),
        spectrum_image_base64=spec_data_url,
        interpretation=interpretation
    )

def analyze_forensics(file_buffer: bytes, filename: str) -> ForensicAnalysisReport:
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
    
    ela_res = perform_ela(image)
    freq_res = perform_fft_analysis(image)
    
    return ForensicAnalysisReport(
        filename=os.path.basename(filename),
        file_size=file_size,
        properties=properties,
        ela=ela_res,
        frequency=freq_res
    )
