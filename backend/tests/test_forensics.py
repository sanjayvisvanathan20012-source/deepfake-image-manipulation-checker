import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from PIL import Image

client = TestClient(app)

def create_synthetic_image(format="JPEG", size=(120, 80), mode="RGB"):
    img = Image.new(mode, size, color="blue" if mode != "RGBA" else (0, 0, 255, 128))
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.read()

def test_ela_analysis_valid_jpeg():
    img_bytes = create_synthetic_image(format="JPEG", size=(100, 100))
    response = client.post(
        "/api/v1/analyze/forensics",
        files={"file": ("test_ela.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check ELA response
    ela = data["ela"]
    assert "mean_difference" in ela
    assert "max_difference" in ela
    assert "std_difference" in ela
    assert isinstance(ela["mean_difference"], float)
    assert isinstance(ela["max_difference"], float)
    assert isinstance(ela["std_difference"], float)
    assert ela["mean_difference"] >= 0.0
    assert ela["max_difference"] >= 0.0
    assert ela["std_difference"] >= 0.0
    
    assert ela["ela_image_base64"].startswith("data:image/png;base64,")
    assert len(ela["ela_image_base64"]) > 50

def test_fft_analysis_valid_image():
    img_bytes = create_synthetic_image(format="JPEG", size=(150, 150))
    response = client.post(
        "/api/v1/analyze/forensics",
        files={"file": ("test_fft.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check Frequency response
    freq = data["frequency"]
    assert "high_frequency_ratio" in freq
    assert isinstance(freq["high_frequency_ratio"], float)
    assert 0.0 <= freq["high_frequency_ratio"] <= 1.0
    assert freq["spectrum_image_base64"].startswith("data:image/png;base64,")
    assert len(freq["spectrum_image_base64"]) > 50

def test_forensics_non_square_and_rgba_png():
    # Non-square RGBA PNG
    img_bytes = create_synthetic_image(format="PNG", size=(200, 75), mode="RGBA")
    response = client.post(
        "/api/v1/analyze/forensics",
        files={"file": ("test_rgba.png", img_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["properties"]["width"] == 200
    assert data["properties"]["height"] == 75
    assert data["properties"]["format"] == "PNG"
    assert data["properties"]["mode"] == "RGBA"
    assert data["ela"]["ela_image_base64"].startswith("data:image/png;base64,")
    assert data["frequency"]["spectrum_image_base64"].startswith("data:image/png;base64,")

def test_explainability_notes_balanced():
    img_bytes = create_synthetic_image(format="JPEG", size=(100, 100))
    response = client.post(
        "/api/v1/analyze/forensics",
        files={"file": ("test_explain.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    ela_interp = data["ela"]["interpretation"].lower()
    freq_interp = data["frequency"]["interpretation"].lower()
    
    # Verify non-accusatory and informative language
    assert "normal" in ela_interp or "suggest" in ela_interp
    assert "spikes" in freq_interp or "natural" in freq_interp
