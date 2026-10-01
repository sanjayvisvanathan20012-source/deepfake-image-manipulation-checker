from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ImageProperties(BaseModel):
    width: int
    height: int
    format: str
    mode: str

class MetadataReport(BaseModel):
    has_exif: bool
    exif_data: Dict[str, Any] = Field(default_factory=dict)
    quantization_tables: Optional[Dict[str, Any]] = None
    note: Optional[str] = None

class AnalysisResponse(BaseModel):
    filename: str
    file_size: int
    properties: ImageProperties
    metadata: MetadataReport

class ELAResult(BaseModel):
    mean_difference: float
    max_difference: float
    std_difference: float
    ela_image_base64: str
    interpretation: str

class FrequencyResult(BaseModel):
    high_frequency_ratio: float
    spectrum_image_base64: str
    interpretation: str

class AIDetectionExplanation(BaseModel):
    what: str
    why: str
    caveats: str

class AIDetectionResult(BaseModel):
    synthetic_probability: float
    classification_label: str
    confidence_band: str
    model_identifier: str
    device_used: str
    explanation: AIDetectionExplanation

class SignalEvidence(BaseModel):
    signal_name: str
    status: str
    weight: str
    observation: str

class FusionExplanation(BaseModel):
    summary: str
    evidence_signals: list[SignalEvidence]
    uncertainty_notice: str
    recommended_verifications: list[str]

class ForensicAnalysisReport(BaseModel):
    filename: str
    file_size: int
    properties: ImageProperties
    ela: ELAResult
    frequency: FrequencyResult
    ai_detection: Optional[AIDetectionResult] = None

class FullAnalysisReport(BaseModel):
    filename: str
    file_size: int
    properties: ImageProperties
    metadata: MetadataReport
    forensics: ForensicAnalysisReport
    ai_detection: AIDetectionResult
    overall_verdict: str
    confidence_band: str
    explanation: FusionExplanation
