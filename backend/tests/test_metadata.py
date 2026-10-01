import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from PIL import Image

client = TestClient(app)

def create_test_image(format="JPEG", size=(100, 100)):
    img = Image.new('RGB', size, color='red')
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.read()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_ingestion_valid_jpeg():
    img = Image.new('RGB', (100, 100))
    exif = img.getexif()
    exif[0x010F] = "TestMake" # Make tag
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif)
    buf.seek(0)
    
    response = client.post(
        "/api/v1/analyze/metadata",
        files={"file": ("test.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["has_exif"] is True
    assert "Make" in data["metadata"]["exif_data"]
    assert data["metadata"]["exif_data"]["Make"] == "TestMake"
    assert data["metadata"]["quantization_tables"] is not None

def test_ingestion_clean_png():
    img_bytes = create_test_image(format="PNG")
    response = client.post(
        "/api/v1/analyze/metadata",
        files={"file": ("test.png", img_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["has_exif"] is False
    assert "inconclusive" in data["metadata"]["note"].lower()

def test_corrupted_buffer():
    response = client.post(
        "/api/v1/analyze/metadata",
        files={"file": ("test.jpg", b"not_an_image_data_at_all", "image/jpeg")}
    )
    assert response.status_code == 400

def test_oversized_payload():
    huge_buf = b"0" * (15 * 1024 * 1024 + 1)
    response = client.post(
        "/api/v1/analyze/metadata",
        files={"file": ("huge.jpg", huge_buf, "image/jpeg")}
    )
    assert response.status_code == 413
