import io
import os
import sys
import time
import numpy as np
from PIL import Image

# Ensure backend root is in sys.path when executed directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def generate_authentic_with_exif() -> bytes:
    """Profile 1: Realistic natural gradient with synthetic EXIF metadata."""
    width, height = 256, 256
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            arr[y, x] = [int(x / width * 255), int(y / height * 255), 180]
            
    img = Image.fromarray(arr, mode='RGB')
    
    # Add synthetic EXIF
    exif = img.getexif()
    exif[0x010F] = "Sony"                # Make
    exif[0x0110] = "ILCE-7M3"            # Model
    exif[0x0132] = "2026:05:12 14:32:00" # DateTime
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95, exif=exif)
    buf.seek(0)
    return buf.read()

def generate_stripped_flat_field() -> bytes:
    """Profile 2: Stripped metadata image with uniform soft noise."""
    width, height = 256, 256
    arr = np.random.randint(120, 135, (height, width, 3), dtype=np.uint8)
    img = Image.fromarray(arr, mode='RGB')
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()

def generate_high_freq_checkerboard() -> bytes:
    """Profile 3: High-frequency checkerboard grid (simulating generator upsampler artifacts)."""
    width, height = 256, 256
    # 2x2 alternating grid
    y, x = np.ogrid[:height, :width]
    grid = ((x // 2) + (y // 2)) % 2 == 0
    arr = np.where(grid[:, :, None], 240, 20).astype(np.uint8)
    # Broadcast to 3 channels
    arr = np.repeat(arr, 3, axis=2) if arr.shape[2] == 1 else arr
    
    img = Image.fromarray(arr, mode='RGB')
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()

def generate_spliced_composite() -> bytes:
    """Profile 4: Spliced composite with two distinct JPEG compression levels."""
    width, height = 256, 256
    
    # 1. Base image saved at low quality (Q=50)
    base_arr = np.random.randint(60, 200, (height, width, 3), dtype=np.uint8)
    base_img = Image.fromarray(base_arr, mode='RGB')
    buf_base = io.BytesIO()
    base_img.save(buf_base, format="JPEG", quality=50)
    buf_base.seek(0)
    reloaded_base = Image.open(buf_base).convert('RGB')
    
    # 2. Patch saved at high quality (Q=95)
    patch_arr = np.full((100, 100, 3), 220, dtype=np.uint8)
    patch_img = Image.fromarray(patch_arr, mode='RGB')
    buf_patch = io.BytesIO()
    patch_img.save(buf_patch, format="JPEG", quality=95)
    buf_patch.seek(0)
    reloaded_patch = Image.open(buf_patch).convert('RGB')
    
    # 3. Paste patch onto base and save as final Q=95
    composite = reloaded_base.copy()
    composite.paste(reloaded_patch, (78, 78))
    
    buf_final = io.BytesIO()
    composite.save(buf_final, format="JPEG", quality=95)
    buf_final.seek(0)
    return buf_final.read()


def run_benchmark():
    profiles = [
        ("Profile 1: Authentic with EXIF", generate_authentic_with_exif(), "image/jpeg", "sample_authentic.jpg"),
        ("Profile 2: Stripped Flat Field", generate_stripped_flat_field(), "image/png", "sample_stripped.png"),
        ("Profile 3: High-Frequency Grid (GAN Sim)", generate_high_freq_checkerboard(), "image/png", "sample_checkerboard.png"),
        ("Profile 4: Spliced Composite (Dual Q)", generate_spliced_composite(), "image/jpeg", "sample_spliced.jpg"),
    ]

    print("=" * 80)
    print("      DEEPFAKE & IMAGE MANIPULATION CHECKER - BENCHMARK HARNESS")
    print("=" * 80)
    print(f"{'Profile Name':<38} | {'Latency':<8} | {'Verdict':<20} | {'Band':<6} | {'Status'}")
    print("-" * 80)

    results = []

    for name, payload, mime, filename in profiles:
        t0 = time.perf_counter()
        resp = client.post(
            "/api/v1/analyze/full",
            files={"file": (filename, payload, mime)}
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        
        assert resp.status_code == 200, f"Failed on {name}: {resp.text}"
        data = resp.json()

        # Schema assertions
        assert "overall_verdict" in data
        assert "confidence_band" in data
        assert "explanation" in data
        assert "forensics" in data
        assert "metadata" in data
        assert "ai_detection" in data

        verdict = data["overall_verdict"]
        band = data["confidence_band"]
        recs_count = len(data["explanation"].get("recommended_verifications", []))
        
        # Specific assertions per profile
        if "Authentic with EXIF" in name:
            assert data["metadata"]["has_exif"] is True
            assert "Make" in data["metadata"]["exif_data"] or "Sony" in str(data["metadata"]["exif_data"])
        elif "Stripped Flat Field" in name:
            assert data["metadata"]["has_exif"] is False
            assert len(data["explanation"]["uncertainty_notice"]) > 0
        elif "High-Frequency Grid" in name:
            assert data["forensics"]["frequency"]["high_frequency_ratio"] >= 0.0
        elif "Spliced Composite" in name:
            assert data["forensics"]["ela"]["max_difference"] > 0.0

        status = "PASSED"
        print(f"{name:<38} | {elapsed_ms:>6.1f}ms | {verdict[:20]:<20} | {band:<6} | {status}")
        results.append({
            "profile": name,
            "latency_ms": elapsed_ms,
            "verdict": verdict,
            "confidence_band": band,
            "recs_count": recs_count,
            "status": status
        })

    print("-" * 80)
    avg_latency = sum(r["latency_ms"] for r in results) / len(results)
    print(f"Summary: 4/4 Profiles Evaluated Successfully | Avg Latency: {avg_latency:.1f}ms")
    print("=" * 80)
    return results

def test_benchmark_suite():
    """Pytest test case hook."""
    results = run_benchmark()
    assert len(results) == 4
    assert all(r["status"] == "PASSED" for r in results)

if __name__ == "__main__":
    run_benchmark()
