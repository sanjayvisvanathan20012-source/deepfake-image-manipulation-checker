import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_detector import get_model
from PIL import Image
import torch

client = TestClient(app)

def create_synthetic_image(format="JPEG", size=(256, 256), mode="RGB"):
    img = Image.new(mode, size, color="purple" if mode != "RGBA" else (128, 0, 128, 255))
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.read()

def test_ai_detector_valid_image():
    img_bytes = create_synthetic_image(format="JPEG", size=(224, 224), mode="RGB")
    response = client.post(
        "/api/v1/analyze/ai-detector",
        files={"file": ("test_ai.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert "synthetic_probability" in data
    prob = data["synthetic_probability"]
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
    
    assert data["classification_label"] in [
        "Low synthetic signals observed",
        "Ambiguous / Inconclusive visual patterns",
        "Prominent synthetic generation patterns detected"
    ]
    assert data["confidence_band"] in ["LOW", "MEDIUM", "HIGH"]
    assert len(data["model_identifier"]) > 0
    assert data["device_used"] in ["mps", "cuda", "cpu"]
    
    explanation = data["explanation"]
    assert "what" in explanation and len(explanation["what"]) > 0
    assert "why" in explanation and len(explanation["why"]) > 0
    assert "caveats" in explanation and len(explanation["caveats"]) > 0

def test_device_selection_mps_or_cpu():
    detector = get_model()
    if torch.backends.mps.is_available():
        assert detector.device_used == "mps"
    elif torch.cuda.is_available():
        assert detector.device_used == "cuda"
    else:
        assert detector.device_used == "cpu"

def test_explainability_caveats_present():
    img_bytes = create_synthetic_image(format="JPEG", size=(128, 128))
    response = client.post(
        "/api/v1/analyze/ai-detector",
        files={"file": ("test_caveats.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    caveats = data["explanation"]["caveats"].lower()
    assert "social media" in caveats or "compression" in caveats
    assert "digital" in caveats or "post-processing" in caveats
    assert "definitive" in caveats

def test_ai_detector_grayscale_and_non_standard_aspect_ratio():
    # Grayscale non-square image
    img_bytes = create_synthetic_image(format="PNG", size=(350, 110), mode="L")
    response = client.post(
        "/api/v1/analyze/ai-detector",
        files={"file": ("test_gray.png", img_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["synthetic_probability"] <= 1.0
