import io
import pytest
from PIL import Image, ImageDraw, ImageFilter
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def generate_test_image():
    # Generate a simple RGB image in memory
    img = Image.new("RGB", (400, 400), color=(100, 150, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 300, 300], fill=(255, 100, 100))
    return img

def test_robustness_severe_jpeg_quantization():
    img = generate_test_image()
    
    # Q50
    buf50 = io.BytesIO()
    img.save(buf50, format="JPEG", quality=50)
    buf50.seek(0)
    
    res50 = client.post(
        "/api/v1/analyze/full",
        files={"file": ("test_q50.jpg", buf50, "image/jpeg")}
    )
    assert res50.status_code == 200
    data50 = res50.json()
    assert "uncertainty_notice" in data50["explanation"]
    
    # Q70
    buf70 = io.BytesIO()
    img.save(buf70, format="JPEG", quality=70)
    buf70.seek(0)
    
    res70 = client.post(
        "/api/v1/analyze/full",
        files={"file": ("test_q70.jpg", buf70, "image/jpeg")}
    )
    assert res70.status_code == 200
    data70 = res70.json()
    assert "uncertainty_notice" in data70["explanation"]

def test_robustness_aggressive_spatial_resizing():
    img = generate_test_image()
    # downsample to 25% (100x100)
    img_small = img.resize((100, 100), Image.Resampling.BICUBIC)
    # upscale back to 400x400
    img_large = img_small.resize((400, 400), Image.Resampling.BICUBIC)
    
    buf = io.BytesIO()
    img_large.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    
    res = client.post(
        "/api/v1/analyze/full",
        files={"file": ("test_resize.jpg", buf, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    # valid metadata dimensions
    assert data["properties"]["width"] == 400
    assert data["properties"]["height"] == 400
    
    # no NaN or infinite in FFT/ELA
    ela = data["forensics"]["ela"]
    fft = data["forensics"]["frequency"]
    assert ela["mean_difference"] >= 0
    assert fft["high_frequency_ratio"] >= 0

def test_robustness_bilateral_gaussian_smoothing():
    img = generate_test_image()
    img_blur = img.filter(ImageFilter.GaussianBlur(radius=2.0))
    
    buf = io.BytesIO()
    img_blur.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    
    res = client.post(
        "/api/v1/analyze/full",
        files={"file": ("test_blur.jpg", buf, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    assert "overall_verdict" in data

def test_robustness_spliced_image_q60_compression():
    # Base image
    img = Image.new("RGB", (400, 400), color=(50, 50, 50))
    # Patch image
    patch = Image.new("RGB", (100, 100), color=(200, 200, 200))
    
    # Splice patch into base
    img.paste(patch, (150, 150))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=60)
    buf.seek(0)
    
    res = client.post(
        "/api/v1/analyze/full",
        files={"file": ("test_splice_q60.jpg", buf, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    
    # Check if system falls back to Inconclusive / Potential Compression Flattening
    # Since it's synthesized via Pillow and Q60, it will likely lack EXIF and have flattened ELA
    assert data["overall_verdict"] == "Inconclusive / Potential Compression Flattening"
