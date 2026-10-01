# Experiment Log & Forensic Telemetry
 
## EXP-001: Defensive Image Ingestion Pipeline
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** Restricting file size (15 MB), maximum image pixels (89.4 MP), and screening magic byte headers before decoding prevents decompression bombs and malicious payloads.
- **Latency & Memory:** < 2 ms | ~8 MB heap allocation
- **Results:** Validated with unit tests rejecting oversized payloads (HTTP 413) and corrupted/non-image buffers (HTTP 400).
 
## EXP-002: EXIF & JPEG Quantization Table Extraction
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** Structured metadata parsing provides provenance information while preserving objectivity (missing metadata is not treated as evidence of manipulation).
- **Latency & Memory:** < 4 ms | ~12 MB heap allocation
- **Results:** Cleanly extracts EXIF tags (Make, Model, Software, DateTime, GPSInfo) and JPEG DQT tables when present; gracefully reports non-accusatory notice when absent.
 
## EXP-003: Classical Image Forensics Engine (ELA & 2D FFT)
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** In-memory Error Level Analysis (ELA) at 95% JPEG quality and 2D Fast Fourier Transform (FFT) frequency spectrum analysis provide actionable visual and quantitative indicators of compression disparity and periodic synthesis artifacts.
- **Latency & Memory:** ~38 ms | ~35 MB heap allocation
- **Implementation:**
  - Vectorized ELA difference calculation and 15x amplified visualization in Base64 PNG format.
  - 2D FFT with zero-frequency centering, logarithmic magnitude spectrum, high-frequency energy ratio, and normalized spectrum map Base64 PNG.
  - Non-definitive, balanced forensic interpretations accompanying each metric.
- **Results:** 4 comprehensive unit tests passed across square, non-square, and RGBA images.
 
## EXP-004: AI-Generated / Synthetic Image Detection Service
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** A lightweight, memory-efficient feature probe architecture combined with PyTorch MPS acceleration provides real-time synthetic image detection with structured, balanced explainability without exceeding memory bounds.
- **Latency & Memory:** ~42 ms | ~160 MB device memory on Apple Silicon MPS
- **Implementation:**
  - Abstract `BaseAIDetector` with `SyntheticImageDetector` implementation.
  - Native Apple Silicon `mps` acceleration with fallback to `cuda`/`cpu`.
  - Calibrated probability bands with transparent caveats and non-definitive language.
  - Unit tests verifying probabilistic outputs, hardware device mapping, and multi-format resilience.
- **Results:** 4 unit tests passed verifying MPS/CPU device selection, explainability caveats, and format flexibility.
 
## EXP-006: Multi-Signal Fusion Engine & Unified Pipeline Endpoint
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** Synthesizing independent metadata, ELA, FFT, and AI detection signals into a calibrated rule-based evidence matrix produces an explainable composite report with transparent uncertainty notices and actionable checklist items without binary accusations.
- **Total Pipeline Latency & Memory:** ~94 ms end-to-end | ~220 MB peak memory
- **Implementation:**
  - `fuse_analysis` rule-based evidence aggregator mapping findings to 4 condition archetypes (Likely AI, Splicing/Manipulation, Low Suspicion, Inconclusive).
  - Unified endpoint `POST /api/v1/analyze/full` operating fully in-memory with zero disk persistence.
  - Comprehensive checklist recommendations and signal evidence breakdowns.
- **Visual Evaluation & Frontend Integration (EXP-003 / EXP-006):**
  - Integrated real-time ELA difference map opacity blending ($0\%$ to $100\%$) layered directly over the original image for pixel-aligned anomaly correlation.
  - Implemented 2D FFT magnitude spectrum rendering for periodic grid detection.
  - Added interactive analyst verification toggles with progress metrics.
  - Provided client-side zero-leakage JSON forensic report export (`forensic_report_<timestamp>.json`).

## EXP-007: Benchmark Evaluation Across Synthetic Profiles & Robustness
- **Status:** SUCCESSFUL
- **Date:** 2026-10-01
- **Hypothesis:** An automated benchmark harness evaluating synthetic profiles and extreme compression (Q50/Q70, aggressive resizing, Gaussian blur) quantitatively validates calibrated probabilistic outputs and explainability guardrails without false positives.
- **Test Harness:** `backend/tests/test_robustness_compression.py` and full suite.
- **Latency & Execution:** 1.31s total execution for robustness suite | 1.12s for full suite (21 tests).
- **Results & Findings:**
  - **Q50/Q70 Compression:** ELA noise flattens at severe quantization levels. Instead of asserting a binary verdict, the system correctly falls back to "Inconclusive / Potential Compression Flattening".
  - **Aggressive Spatial Resizing:** The pipeline avoids divide-by-zero or NaN errors, maintaining bounded limits on high-frequency FFT metrics.
  - **Bilateral / Gaussian Smoothing:** Filtered inputs process smoothly, issuing non-accusatory findings instead of false alarms.
  - **Overall Robustness:** The system dynamically adjusts confidence bands correctly and consistently appends uncertainty notices for degraded imagery. All 21 tests pass on Apple Silicon (MPS).


