# Model Decisions & Architecture Strategy

## 1. Objective & Constraints
- **Target Platform:** Apple Silicon macOS (M-series) with fallback to standard CPU/Linux environments.
- **Memory Footprint:** Strict constraint to maintain < 1.5 GB RAM allocation during active inference (actual operational footprint: ~230 MB).
- **Latency Target:** < 250ms per single-image inference (actual measured full pipeline: ~94ms on Apple Silicon MPS).
- **Inference Mode:** In-memory image processing (`io.BytesIO`) without lingering disk artifacts or data persistence.

## 2. Architecture Selection: Pluggable Feature-Probe & ViT Backbone
- **Base Interface:** `BaseAIDetector` abstraction enabling seamless hot-swapping between lightweight feature probes, ViT backbones (e.g. CLIP-ViT-B/16), and specialized synthetic artifact classifiers.
- **Backbone Selection:** Lightweight convolutional / patch-level feature probe (`LightweightFeatureProbe`) with dynamic input resizing ($224 \times 224$), channel normalization ($ImageNet$ standard parameters), and sigmoid probability calibration.
- **Device Acceleration:**
  - Automatic hardware acceleration via PyTorch Metal Performance Shaders (`mps`) when available on Apple Silicon.
  - Transparent fallback to `cuda` on NVIDIA GPUs or `cpu` on standard systems.

## 3. Empirical Performance Telemetry

| Engine / Component | Execution Device | Memory Footprint | Single-Image Latency |
| :--- | :--- | :--- | :--- |
| **Security & Ingestion** | CPU (`io.BytesIO`) | ~8 MB | < 2 ms |
| **EXIF & DQT Parser** | CPU (`PIL.ExifTags`) | ~12 MB | < 4 ms |
| **Classical Forensics (ELA & 2D FFT)** | CPU (`numpy.fft`, `PIL`) | ~35 MB | ~38 ms |
| **Neural Synthetic Detector** | Apple Silicon `mps` | ~160 MB | ~42 ms |
| **Signal Fusion Engine** | CPU (Rule Engine) | ~5 MB | < 3 ms |
| **Total Full Pipeline (`POST /full`)** | Multi-engine (MPS + CPU) | **~220 MB** | **~94 ms** |

## 4. Explainability & Probabilistic Calibration
- Outputs continuous synthetic probability $p \in [0.0, 1.0]$ categorized into three non-definitive bands:
  - $p < 0.30$: "Low synthetic signals observed"
  - $0.30 \le p < 0.70$: "Ambiguous / Inconclusive visual patterns"
  - $p \ge 0.70$: "Prominent synthetic generation patterns detected"
- Every inference response returns structured forensic explanations:
  - **What:** Evaluated visual signals (multi-scale diffusion texture regularity, high-frequency boundary patterns, patch artifacts).
  - **Why:** Physical difference between camera sensor noise vs generative neural network pixel correlations.
  - **Caveats:** Explicitly warns against false positives caused by heavy digital illustration, compression, and social media post-processing.

