# Deepfake & Image Manipulation Checker

An investigative, explainable forensic platform designed to assist analysts, journalists, and researchers in evaluating digital image integrity. The system leverages a decoupled multi-signal analysis pipeline to detect generative AI artifacts, compression disparities, and metadata anomalies without relying on brittle binary "real vs. fake" verdicts.

---

## 🔍 Core Philosophy & Forensic Methodology

Automated classifiers that claim 100% certainty often fail when encountering social media recompression, image cropping, or artistic digital illustration. 

This platform acts as an **assistive investigative tool** that evaluates four independent layers of forensic signals:
1. **Defensive Ingestion & Screening:** Validates file magic bytes and dimension limits to prevent malicious decompression bombs while loading all payloads into volatile memory (`io.BytesIO`).
2. **Metadata & Provenance Analysis:** Extracts camera hardware tags (Make/Model/Lens), capture timestamps, GPS coordinates, and JPEG Discrete Quantization Tables (DQT). Missing metadata is treated objectively without false accusations.
3. **Classical Compression & Frequency Forensics:** 
   - **Error Level Analysis (ELA):** Analyzes compression deltas against a 95% JPEG recompression baseline to expose localized splicing or editing.
   - **2D Fast Fourier Transform (FFT):** Examines the 2D frequency spectrum to detect high-frequency periodic grid anomalies typical of neural generator upsampling.
4. **Neural Generative Feature Probe:** Evaluates multi-scale texture correlations and boundary continuity using PyTorch with Apple Silicon Metal Performance Shaders (`mps`) hardware acceleration.
5. **Calibrated Signal Fusion:** A rule-based evidence matrix synthesizes all observations into four calibrated archetype conditions with plain-English summaries, transparent uncertainty caveats, and actionable verification checklists.

---

## 🛡️ Privacy & Zero-Retention Architecture

- **Zero Disk Persistence:** Uploaded image files and computed forensic maps are processed entirely in-memory and discarded upon request completion.
- **Client-Side Report Export:** Downloadable JSON reports (`forensic_report_<timestamp>.json`) are generated directly in the browser with no server-side logging.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (Python 3.13 tested on macOS)
- **Node.js 18+** & npm
- (Optional) Apple Silicon Mac for native `mps` PyTorch acceleration.

---

### 1. Backend Setup

The backend runs on **port 8001** (port 8000 is reserved to prevent local port collisions).

```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment (if not already created)
python3 -m venv ../venv
source ../venv/bin/activate

# Install dependencies
pip install -r ../venv/requirements.txt  # or pip install fastapi uvicorn pillow numpy torch torchvision

# Launch development server
uvicorn app.main:app --port 8001 --reload
```

The FastAPI backend will be live at `http://127.0.0.1:8001`. Interactive API documentation is available at `http://127.0.0.1:8001/docs`.

---

### 2. Frontend Setup

The frontend runs on **port 5173**.

```bash
# In a new terminal tab, navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser to interact with the forensic dashboard.

---

## 🧪 Testing & Benchmark Evaluation

### Run Unit & Integration Tests
```bash
cd backend
source ../venv/bin/activate
pytest -v
```

### Run Synthetic Benchmark Evaluation Harness
An automated benchmark suite tests the unified pipeline across four distinct image archetypes:
1. Uncompressed authentic-pattern capture with synthetic EXIF metadata.
2. Metadata-stripped flat field image.
3. High-frequency checkerboard grid (simulating generator upsampler artifacts).
4. Composite spliced image with two distinct JPEG compression levels.

```bash
cd backend
source ../venv/bin/activate
python tests/benchmark_evaluation.py
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 📁 Repository Structure

```
├── 01_PROJECT_MASTER_CONTEXT.md    # Master rules & non-negotiables
├── 02_PROJECT_TRACKER.md           # Milestone & execution tracker
├── 04_MODEL_DECISIONS.md           # Model architecture & device selection
├── 05_EXPERIMENT_LOG.md            # Experiment log & performance telemetry
├── 06_ARCHITECTURE.md              # System topography & API data contracts
├── README.md                       # Project overview & developer guide
├── backend/
│   ├── app/
│   │   ├── core/                   # Defensive ingestion & validation
│   │   ├── schemas/                # Pydantic data schemas
│   │   ├── services/               # Metadata, ELA, FFT, AI detector, & Fusion
│   │   └── main.py                 # FastAPI application routes & CORS
│   └── tests/                      # Pytest suite & benchmark evaluation harness
└── frontend/
    ├── src/
    │   ├── components/             # Apple glassmorphic UI components
    │   ├── App.jsx                 # 4-stage analysis state machine
    │   └── main.jsx                # React root entry point
    └── package.json
```
