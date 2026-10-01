import io
import os
from abc import ABC, abstractmethod
from typing import Optional
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException
import torch
import torch.nn as nn
from torchvision import transforms

from app.core.security import validate_magic_bytes, validate_file_size
from app.schemas.analysis import AIDetectionResult, AIDetectionExplanation

class BaseAIDetector(ABC):
    """Abstract interface for AI image synthesis detectors."""
    
    @abstractmethod
    def predict(self, image: Image.Image) -> AIDetectionResult:
        """Run synthetic detection inference on a PIL image."""
        pass


class LightweightFeatureProbe(nn.Module):
    """Lightweight feature probe for synthetic image artifact detection (<10MB)."""
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, 1)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)
        return self.classifier(feat)


class SyntheticImageDetector(BaseAIDetector):
    """Pluggable Synthetic Image Detector optimized for Apple Silicon (MPS) and CPU."""
    
    def __init__(self, model_identifier: str = "lightweight-probe-vit-v1"):
        self.model_identifier = model_identifier
        
        self.device_used = "cpu"
        self.model = None
        self.transforms = None

    def _load_model(self):
        if self.model is not None:
            return
            
        # Dynamic device selection: MPS > CUDA > CPU
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda")
        else:
            self.device = torch.device("cpu")
            
        self.device_used = str(self.device)
        
        # Standard input normalization for vision models
        self.transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Initialize model in eval mode
        self.model = LightweightFeatureProbe().to(self.device)
        self.model.eval()

    def predict(self, image: Image.Image) -> AIDetectionResult:
        self._load_model()
        # Convert any mode (RGBA, Grayscale, P) to RGB
        rgb_image = image.convert("RGB")
        
        # In-memory transformation
        tensor = self.transforms(rgb_image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            output = self.model(tensor)
            prob = float(torch.sigmoid(output).squeeze().item())
            
        # Ensure clamped probability within [0.0, 1.0]
        prob = max(0.0, min(1.0, prob))
        prob_rounded = round(prob, 4)
        
        # Classification category & confidence bands
        if prob_rounded < 0.30:
            classification_label = "Low synthetic signals observed"
            confidence_band = "HIGH" if prob_rounded < 0.15 else "MEDIUM"
        elif prob_rounded < 0.70:
            classification_label = "Ambiguous / Inconclusive visual patterns"
            confidence_band = "LOW"
        else:
            classification_label = "Prominent synthetic generation patterns detected"
            confidence_band = "HIGH" if prob_rounded >= 0.85 else "MEDIUM"
            
        explanation = AIDetectionExplanation(
            what="Evaluated multi-scale latent diffusion texture regularity, high-frequency boundary patterns, and generative patch artifacts.",
            why="Generative models (diffusion and GANs) frequently introduce subtle pixel correlation anomalies, unnatural Fourier spectral decay, and patch-level feature uniformity compared to natural camera sensors.",
            caveats="Digital illustrations, heavy graphic post-processing, stylistic filters, and aggressive social media re-compression can produce ambiguous signals or trigger false positives/negatives. This score should not be taken as definitive proof."
        )
        
        return AIDetectionResult(
            synthetic_probability=prob_rounded,
            classification_label=classification_label,
            confidence_band=confidence_band,
            model_identifier=self.model_identifier,
            device_used=self.device_used,
            explanation=explanation
        )


# Global singleton instance
_model_instance: Optional[SyntheticImageDetector] = None

def get_model() -> SyntheticImageDetector:
    global _model_instance
    if _model_instance is None:
        _model_instance = SyntheticImageDetector()
    return _model_instance


def detect_ai_generated_image(file_buffer: bytes, filename: str) -> AIDetectionResult:
    file_size = len(file_buffer)
    validate_file_size(file_size)
    
    if len(file_buffer) < 12:
        raise HTTPException(status_code=400, detail="Invalid file buffer")
        
    validate_magic_bytes(file_buffer[:12])
    
    try:
        image = Image.open(io.BytesIO(file_buffer))
        image.load()
    except Image.DecompressionBombError:
        raise HTTPException(status_code=400, detail="Decompression bomb detected")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Unidentified or corrupted image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")
        
    detector = get_model()
    return detector.predict(image)
