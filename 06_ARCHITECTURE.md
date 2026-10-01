# System Architecture & Signal Flow

## 1. System Topography & Port Mapping

```
                                  ┌───────────────────────────────┐
                                  │      Client Browser           │
                                  │   (React + Vite on :5173)     │
                                  └───────────────┬───────────────┘
                                                  │ HTTP Multipart (Zero Disk Retention)
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Backend Forensic Server (FastAPI + Uvicorn on port :8001)                                       │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 1: Ingestion & Defensive Screening (security.py)                                    │  │
│  │ - 15 MB payload limit & 89.4 MP dimension cap (prevent decompression bombs)               │  │
│  │ - Magic byte validation (JPEG, PNG, WebP)                                                 │  │
│  │ - In-memory buffer management (`io.BytesIO`)                                              │  │
│  └─────────────────────────────────────────┬─────────────────────────────────────────────────┘  │
│                                            │ Valid In-Memory PIL Image & Buffer                 │
│                                            ▼                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Multi-Engine In-Memory Analysis                                                           │  │
│  │                                                                                           │  │
│  │  ├─ Layer 2A: Metadata & EXIF Parser (metadata.py)                                        │  │
│  │  │  - EXIF tags, GPS metadata, and JPEG Quantization Tables (DQT)                         │  │
│  │  │  - Non-accusatory missing EXIF handling (no false positives for web-shared images)     │  │
│  │  │                                                                                        │  │
│  │  ├─ Layer 2B: Classical Visual Forensics (forensics.py)                                   │  │
│  │  │  - Error Level Analysis (ELA) @ 95% JPEG quality recompression                         │  │
│  │  │  - 2D Fast Fourier Transform (FFT) centered magnitude spectrum & high-freq energy     │  │
│  │  │                                                                                        │  │
│  │  └─ Layer 3: Neural Generative Artifact Detector (ai_detector.py)                         │  │
│  │     - PyTorch Metal Performance Shaders (`mps`) on Apple Silicon with CPU fallback        │  │
│  │     - Multi-scale patch & boundary feature probe with continuous probability calibration  │  │
│  └─────────────────────────────────────────┬─────────────────────────────────────────────────┘  │
│                                            │ Multi-Signal Findings                              │
│                                            ▼                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 4: Multi-Signal Fusion Engine (fusion.py)                                           │  │
│  │ - Rule-based evidence aggregation mapping into 4 condition archetypes                     │  │
│  │ - Calibrated confidence bands (LOW / MEDIUM / HIGH)                                      │  │
│  │ - Contextual uncertainty notices & non-binary forensic verdicts                           │  │
│  │ - Actionable verification checklist recommendations                                       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints & Data Contracts

All endpoints accept `multipart/form-data` with key `file` and return structured JSON responses.

### 2.1 `GET /health`
Health check verifying service liveness and available acceleration devices.
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "device": "mps"
}
```

### 2.2 `POST /api/v1/analyze/metadata`
Independent metadata inspection endpoint.
- **Response Schema:** `AnalysisResponse` (file properties, EXIF dictionary, JPEG DQT tables).

### 2.3 `POST /api/v1/analyze/forensics`
Independent classical forensics endpoint.
- **Response Schema:** `ForensicAnalysisReport` (`ela`: mean/max/std diff, Base64 ELA map; `frequency`: high-frequency ratio, Base64 FFT spectrum).

### 2.4 `POST /api/v1/analyze/ai-detector`
Independent neural generative detection endpoint.
- **Response Schema:** `AIDetectionResult` (synthetic probability, classification label, confidence band, device used, structured explanation).

### 2.5 `POST /api/v1/analyze/full`
Unified multi-signal fusion pipeline endpoint.
- **Response Schema:** `FullAnalysisReport`
```json
{
  "filename": "sample.jpg",
  "file_size": 248102,
  "properties": { "width": 1200, "height": 800, "format": "JPEG", "mode": "RGB" },
  "metadata": { "has_exif": true, "exif_data": { ... }, "quantization_tables": { ... } },
  "forensics": {
    "ela": { "mean_difference": 3.42, "max_difference": 48.0, "std_difference": 4.12, "ela_image_base64": "data:image/png;base64,...", "interpretation": "..." },
    "frequency": { "high_frequency_ratio": 0.142, "spectrum_image_base64": "data:image/png;base64,...", "interpretation": "..." }
  },
  "ai_detection": {
    "synthetic_probability": 0.12,
    "classification_label": "Low synthetic signals observed",
    "confidence_band": "LOW",
    "model_identifier": "LightweightFeatureProbe-v1",
    "device_used": "mps",
    "explanation": { "what": "...", "why": "...", "caveats": "..." }
  },
  "overall_verdict": "Low Suspicion / Consistent Natural Signals",
  "confidence_band": "LOW",
  "explanation": {
    "summary": "...",
    "evidence_signals": [ ... ],
    "uncertainty_notice": "...",
    "recommended_verifications": [ ... ]
  }
}
```

---

## 3. Frontend Architecture

Built with React 18, Vite, and Tailwind CSS using an Apple-inspired light glassmorphic aesthetic.

### 3.1 State Machine Flow (`App.jsx`)
- **Landing (`landing`):** Educational entry point explaining forensic capabilities.
- **Authentication (`auth`):** Frosted glass login view with mock credential session persistence.
- **Upload (`upload`):** Client drag-and-drop zone with immediate file size and MIME-type validation.
- **Processing (`processing`):** Live animated multi-signal progress indicator.
- **Forensic Workbench (`workbench`):** Visual exploration of original image, ELA difference map, and 2D FFT spectrum side-by-side with assessment signals.
- **Audit & Report (`audit`):** Comprehensive synthesis banner, interactive verification checklist, and JSON export.

### 3.2 Key Explainability Components
- **`ForensicViewer.jsx`:** Features an interactive **Overlay Opacity Slider** ($0\%$ to $100\%$) and quick-presets (`0%`, `50%`, `100%`) allowing pixel-perfect comparative alignment between the raw image and the ELA difference map.
- **`VerificationChecklist.jsx`:** Interactive checkbox state tracking analyst verifications with in-browser **Zero-Retention JSON Report Export** (`forensic_report_<timestamp>.json`).
- **`MetadataInspector.jsx`:** Structured rendering of EXIF tags and DQT tables with nested object formatting and array unpacking.
- **`VerdictBanner.jsx`:** Dynamic calibrated assessment banner with risk bands and continuous probability gauges.
- **`StepProgress.jsx`:** Interactive stepper navigation enabling free exploration between all completed review stages.
- **`Navbar.jsx`**: Global translucent header containing tool identity and 'Sign In' trigger.
- **`LoginModal.jsx`**: Frosted glass modal offering email/password and social login options.
- **`UploadZone.jsx`**: Drag-and-drop input handling with client-side validation logic.

