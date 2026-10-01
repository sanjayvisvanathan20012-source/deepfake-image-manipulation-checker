import os
import torch
torch.set_num_threads(1)
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from app.services.metadata import extract_metadata
from app.services.forensics import analyze_forensics
from app.services.ai_detector import detect_ai_generated_image
from app.services.fusion import analyze_full_pipeline
from app.schemas.analysis import (
    AnalysisResponse,
    ForensicAnalysisReport,
    AIDetectionResult,
    FullAnalysisReport
)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app = FastAPI(title="Deepfake & Image Manipulation Checker API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

env_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

# Configure CORS for local development and dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
@limiter.exempt
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/analyze/metadata", response_model=AnalysisResponse)
async def analyze_metadata(request: Request, file: UploadFile = File(...)):
    file_buffer = await file.read()
    return extract_metadata(file_buffer, file.filename or "unknown")

@app.post("/api/v1/analyze/forensics", response_model=ForensicAnalysisReport)
async def analyze_image_forensics(request: Request, file: UploadFile = File(...)):
    file_buffer = await file.read()
    return analyze_forensics(file_buffer, file.filename or "unknown")

@app.post("/api/v1/analyze/ai-detector", response_model=AIDetectionResult)
async def analyze_ai_detection(request: Request, file: UploadFile = File(...)):
    file_buffer = await file.read()
    return detect_ai_generated_image(file_buffer, file.filename or "unknown")

@app.post("/api/v1/analyze/full", response_model=FullAnalysisReport)
@limiter.limit("15/minute")
async def analyze_full(request: Request, file: UploadFile = File(...)):
    file_buffer = await file.read()
    return analyze_full_pipeline(file_buffer, file.filename or "unknown")
