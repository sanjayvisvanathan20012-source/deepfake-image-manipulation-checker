import io
import os
from typing import List

from app.schemas.analysis import (
    AnalysisResponse,
    ForensicAnalysisReport,
    AIDetectionResult,
    FullAnalysisReport,
    SignalEvidence,
    FusionExplanation
)
from app.services.metadata import extract_metadata
from app.services.forensics import analyze_forensics
from app.services.ai_detector import detect_ai_generated_image

UNCERTAINTY_NOTICE = (
    "All digital forensic assessments are probabilistic in nature. Factors such as repeated social media compression, "
    "screenshotting, image resizing, and graphic filters alter pixel noise and can yield false positives or false negatives. "
    "These findings should serve as assistive screening, never absolute proof."
)

DEFAULT_VERIFICATIONS = [
    "Perform reverse image search (e.g., Google Images, TinEye) to trace earliest published provenance.",
    "Inspect facial landmarks, ear symmetry, and pupil reflections for anatomical coherence.",
    "Examine background lines, textures, and repeating patterns for structural warping or diffusion smearing.",
    "Check lighting direction and shadow consistency across subjects and surrounding objects."
]

def fuse_analysis(
    metadata_res: AnalysisResponse,
    forensics_res: ForensicAnalysisReport,
    ai_res: AIDetectionResult
) -> FullAnalysisReport:
    p = ai_res.synthetic_probability
    has_exif = metadata_res.metadata.has_exif
    ela = forensics_res.ela
    freq = forensics_res.frequency
    
    # 1. Compile Evidence Signals
    signals: List[SignalEvidence] = []
    
    # Signal: Metadata
    if has_exif:
        signals.append(SignalEvidence(
            signal_name="EXIF Metadata Integrity",
            status="CONSISTENT",
            weight="MEDIUM",
            observation=f"Camera provenance tags present ({', '.join(list(metadata_res.metadata.exif_data.keys())[:3])})."
        ))
    else:
        signals.append(SignalEvidence(
            signal_name="EXIF Metadata Integrity",
            status="INCONCLUSIVE",
            weight="LOW",
            observation="No EXIF metadata found. Typical of social media platforms or web optimization."
        ))
        
    # Signal: ELA
    if ela.std_difference >= 25.0 or ela.max_difference > 120.0:
        signals.append(SignalEvidence(
            signal_name="Error Level Compression (ELA)",
            status="ANOMALY_DETECTED",
            weight="HIGH",
            observation=f"Elevated compression disparity observed (max: {ela.max_difference}, std: {ela.std_difference})."
        ))
    else:
        signals.append(SignalEvidence(
            signal_name="Error Level Compression (ELA)",
            status="UNIFORM_PATTERN",
            weight="MEDIUM",
            observation=f"Uniform error level response across image (std: {ela.std_difference})."
        ))
        
    # Signal: Frequency FFT
    if freq.high_frequency_ratio > 0.85 or freq.high_frequency_ratio < 0.05:
        signals.append(SignalEvidence(
            signal_name="Fourier Frequency Spectrum (FFT)",
            status="ANOMALY_DETECTED",
            weight="MEDIUM",
            observation=f"Unusual high-frequency energy distribution ratio ({freq.high_frequency_ratio})."
        ))
    else:
        signals.append(SignalEvidence(
            signal_name="Fourier Frequency Spectrum (FFT)",
            status="CONSISTENT",
            weight="MEDIUM",
            observation=f"Balanced frequency decay ratio ({freq.high_frequency_ratio})."
        ))
        
    # Signal: AI Synthesis Probe
    if p >= 0.70:
        signals.append(SignalEvidence(
            signal_name="Neural Generative Feature Probe",
            status="PROMINENT_SYNTHETIC_SIGNALS",
            weight="HIGH",
            observation=f"High synthetic generation probability ({p * 100:.1f}%)."
        ))
    elif p >= 0.30:
        signals.append(SignalEvidence(
            signal_name="Neural Generative Feature Probe",
            status="AMBIGUOUS_PATTERNS",
            weight="MEDIUM",
            observation=f"Intermediate synthetic probability ({p * 100:.1f}%)."
        ))
    else:
        signals.append(SignalEvidence(
            signal_name="Neural Generative Feature Probe",
            status="LOW_SYNTHETIC_SIGNALS",
            weight="HIGH",
            observation=f"Low synthetic generation score ({p * 100:.1f}%)."
        ))
        
    # 2. Synthesize Signals & Determine Verdict
    # Condition A: Likely AI Generated
    if p >= 0.75 and ela.std_difference < 25.0:
        overall_verdict = "High Likelihood of Synthetic / AI Generation"
        confidence_band = "HIGH" if p >= 0.85 else "MEDIUM"
        summary = (
            "Strong synthetic generation signals detected across neural feature probes, "
            "consistent with modern diffusion or GAN model artifacts."
        )
    # Condition B: Potential Splicing / Manipulation
    elif ela.std_difference >= 25.0 or ela.max_difference > 120.0 or freq.high_frequency_ratio > 0.85:
        overall_verdict = "Potential Localized Editing or Splicing Detected"
        confidence_band = "MEDIUM"
        summary = (
            "Discrepancies in error-level compression rates or frequency distributions indicate "
            "potential multi-source splicing, localized retouches, or composite generation."
        )
    # Condition C: Low Suspicion
    elif p < 0.30 and ela.std_difference < 25.0 and has_exif:
        overall_verdict = "Consistent Natural Image Characteristics (Low Suspicion)"
        confidence_band = "HIGH" if p < 0.15 else "MEDIUM"
        summary = (
            "Forensic compression levels, frequency spectra, and camera metadata align "
            "with genuine natural capture pipelines."
        )
    # Condition D: Inconclusive / Social Media Stripped
    else:
        overall_verdict = "Inconclusive / Potential Compression Flattening"
        confidence_band = "LOW"
        summary = (
            "Image exhibits stripped metadata and inconclusive visual patterns commonly "
            "introduced by social media re-compression, web export, or format conversion."
        )
        
    explanation = FusionExplanation(
        summary=summary,
        evidence_signals=signals,
        uncertainty_notice=UNCERTAINTY_NOTICE,
        recommended_verifications=DEFAULT_VERIFICATIONS
    )
    
    return FullAnalysisReport(
        filename=metadata_res.filename,
        file_size=metadata_res.file_size,
        properties=metadata_res.properties,
        metadata=metadata_res.metadata,
        forensics=forensics_res,
        ai_detection=ai_res,
        overall_verdict=overall_verdict,
        confidence_band=confidence_band,
        explanation=explanation
    )

def analyze_full_pipeline(file_buffer: bytes, filename: str) -> FullAnalysisReport:
    metadata_res = extract_metadata(file_buffer, filename)
    forensics_res = analyze_forensics(file_buffer, filename)
    ai_res = detect_ai_generated_image(file_buffer, filename)
    
    return fuse_analysis(metadata_res, forensics_res, ai_res)
