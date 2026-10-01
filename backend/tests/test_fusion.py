import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from PIL import Image

client = TestClient(app)

def create_synthetic_image(format="JPEG", size=(150, 150), exif=None):
    img = Image.new('RGB', size, color='green')
    buf = io.BytesIO()
    if exif:
        img.save(buf, format=format, exif=exif)
    else:
        img.save(buf, format=format)
    buf.seek(0)
    return buf.read()

def test_full_pipeline_execution():
    img_bytes = create_synthetic_image(format="JPEG", size=(128, 128))
    response = client.post(
        "/api/v1/analyze/full",
        files={"file": ("sample.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    # Sub-reports presence
    assert "filename" in data
    assert "properties" in data
    assert "metadata" in data
    assert "forensics" in data
    assert "ai_detection" in data
    assert "overall_verdict" in data
    assert "confidence_band" in data
    assert "explanation" in data
    
    # Check nested fields
    assert data["forensics"]["ela"]["ela_image_base64"].startswith("data:image/png;base64,")
    assert data["forensics"]["frequency"]["spectrum_image_base64"].startswith("data:image/png;base64,")
    assert 0.0 <= data["ai_detection"]["synthetic_probability"] <= 1.0

def test_inconclusive_branch_uncertainty_notice():
    # Clean PNG without EXIF
    img = Image.new('RGB', (100, 100), color='white')
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    response = client.post(
        "/api/v1/analyze/full",
        files={"file": ("plain.png", buf.read(), "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    
    uncertainty = data["explanation"]["uncertainty_notice"].lower()
    assert "probabilistic" in uncertainty
    assert "false positives" in uncertainty or "social media" in uncertainty

def test_recommended_verifications_checklist():
    img_bytes = create_synthetic_image(format="JPEG", size=(100, 100))
    response = client.post(
        "/api/v1/analyze/full",
        files={"file": ("checklist_test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    
    recs = data["explanation"]["recommended_verifications"]
    assert isinstance(recs, list)
    assert len(recs) >= 2
    assert any("reverse image search" in r.lower() for r in recs)

def test_endpoints_regression_check():
    img_bytes = create_synthetic_image(format="JPEG", size=(100, 100))
    
    # 1. Metadata endpoint
    r_meta = client.post("/api/v1/analyze/metadata", files={"file": ("test.jpg", img_bytes, "image/jpeg")})
    assert r_meta.status_code == 200
    assert "properties" in r_meta.json()
    
    # 2. Forensics endpoint
    r_forensics = client.post("/api/v1/analyze/forensics", files={"file": ("test.jpg", img_bytes, "image/jpeg")})
    assert r_forensics.status_code == 200
    assert "ela" in r_forensics.json()
    
    # 3. AI Detector endpoint
    r_ai = client.post("/api/v1/analyze/ai-detector", files={"file": ("test.jpg", img_bytes, "image/jpeg")})
    assert r_ai.status_code == 200
    assert "synthetic_probability" in r_ai.json()
