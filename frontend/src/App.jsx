import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import StepProgress from './components/StepProgress';
import UploadZone from './components/UploadZone';
import VerdictBanner from './components/VerdictBanner';
import ForensicViewer from './components/ForensicViewer';
import MetadataInspector from './components/MetadataInspector';
import VerificationChecklist from './components/VerificationChecklist';
import { AlertCircle, Loader2, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const handleAnalyze = async (file, previewUrl) => {
    setLoading(true);
    setError(null);
    setOriginalPreview(previewUrl);
    setCheckedItems({});
    setCurrentView('processing'); // Processing

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analyze/full`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errDetail = 'Failed to analyze image';
        try {
          const errJson = await response.json();
          errDetail = errJson.detail || errDetail;
        } catch (_) {}
        throw new Error(`Server Error (${response.status}): ${errDetail}`);
      }

      const data = await response.json();
      setReport(data);
      setCurrentView('workbench'); // Forensic Workbench
    } catch (err) {
      console.error(err);
      setError(
        err.message || 'Unable to communicate with the forensic analysis service. Verify backend is running on port 8001.'
      );
      setCurrentView('upload'); // Reset
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (loading) return;
    if (stepId === 'processing') return;
    if (stepId === 'upload') {
      setCurrentView('upload');
    } else if ((stepId === 'workbench' || stepId === 'audit') && report) {
      setCurrentView(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleResetAnalysis = () => {
    setReport(null);
    setOriginalPreview(null);
    setCheckedItems({});
    setError(null);
    setCurrentView('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('upload');
    setIsLoginModalOpen(false);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setCurrentView('landing');
  };

  const handleStartVerification = () => {
    if (isAuthenticated) {
      setCurrentView('upload');
    } else {
      setCurrentView('auth');
    }
  };

  if (currentView === 'landing') {
    return (
      <>
        <Navbar onSignInClick={() => setCurrentView('auth')} isAuthenticated={isAuthenticated} user={user} onSignOut={handleSignOut} />
        <LandingPage onStart={handleStartVerification} />
      </>
    );
  }

  if (currentView === 'auth') {
    return (
      <>
        <Navbar onSignInClick={() => setCurrentView('auth')} isAuthenticated={isAuthenticated} user={user} onSignOut={handleSignOut} />
        <AuthPage onBack={() => setCurrentView('landing')} onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-100 to-blue-50/40 min-h-screen text-slate-800 font-sans">
      <Navbar onSignInClick={() => setIsLoginModalOpen(true)} isAuthenticated={isAuthenticated} user={user} onSignOut={handleSignOut} />
      
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Tracker Bar */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs">
          <StepProgress 
            currentStep={currentView} 
            onStepClick={handleStepClick}
            isProcessing={loading}
            hasReport={Boolean(report)}
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start space-x-3 text-sm text-red-800 shadow-sm animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Analysis Encountered an Issue</strong>
              <p className="text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1 & 2: Ingestion & Live Processing View */}
        {(currentView === 'upload' || currentView === 'processing') && (
          <section className="max-w-3xl mx-auto space-y-6 py-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                AI Deepfake & Image Manipulation Checker
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">
                Secure, in-memory multi-signal forensic evaluation across EXIF metadata, ELA compression disparities, 2D FFT frequencies, and neural generative features.
              </p>
              {report && currentView === 'upload' && (
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentView('workbench')}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 transition-all hover:shadow-2xs"
                  >
                    <span>Return to Active Forensic Workbench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {currentView === 'upload' ? (
              <UploadZone onAnalyze={handleAnalyze} disabled={loading} />
            ) : (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Executing Multi-Signal Forensic Pipeline...
                  </h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="animate-pulse text-blue-600">Screening magic bytes & parsing EXIF metadata...</p>
                    <p className="animate-pulse text-blue-600 delay-150">Computing Error Level Analysis compression map...</p>
                    <p className="animate-pulse text-blue-600 delay-300">Transforming 2D Fourier frequency spectrum...</p>
                    <p className="animate-pulse text-blue-600 delay-500">Running PyTorch MPS neural generative artifact probe...</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 3: Dedicated Forensic Workbench View */}
        {currentView === 'workbench' && report && (
          <section className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Top Workbench Utility Bar */}
            <div className="bg-white/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {report.filename || 'Uploaded Image'}
                </span>
                {report.properties && (
                  <>
                    <span className="text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 font-mono">
                      {report.properties.width} × {report.properties.height} px
                    </span>
                    <span className="text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 uppercase font-semibold">
                      {report.properties.format}
                    </span>
                  </>
                )}
                <span className="text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 font-mono">
                  {(report.file_size / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetAnalysis}
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('audit');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Proceed to Audit & Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Dual-Pane Forensic Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Pane (7/12): Visual Forensic Evidence Canvas */}
              <div className="lg:col-span-7">
                <ForensicViewer
                  originalImage={originalPreview}
                  ela={report.forensics?.ela}
                  frequency={report.forensics?.frequency}
                />
              </div>

              {/* Right Pane (5/12): Executive Assessment & Signal Inspector */}
              <div className="lg:col-span-5 space-y-4">
                <VerdictBanner
                  verdict={report.overall_verdict}
                  confidenceBand={report.confidence_band}
                  aiProbability={report.ai_detection?.synthetic_probability}
                  summary={report.explanation?.summary}
                />

                <MetadataInspector
                  metadata={report.metadata}
                  properties={report.properties}
                />
              </div>
            </div>

            {/* Bottom Stepper Callout */}
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Visual evidence inspection ready. Review the checklist and generate the audit payload in Step 4.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('audit');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors w-full sm:w-auto justify-center"
              >
                <span>Proceed to Audit & Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Dedicated Audit & Verification Report View */}
        {currentView === 'audit' && report && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Top Audit Utility Bar */}
            <div className="bg-white/70 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Forensic Audit & Final Verification Report
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete evidentiary synthesis, contextual uncertainty notes, and client-side report export.
                </p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('workbench');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Back to Workbench</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAnalysis}
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* Comprehensive Verdict Banner */}
            <VerdictBanner
              verdict={report.overall_verdict}
              confidenceBand={report.confidence_band}
              aiProbability={report.ai_detection?.synthetic_probability}
              summary={report.explanation?.summary}
            />

            {/* Full-Width Interactive Verification Checklist & Export */}
            <div className="w-full">
              <VerificationChecklist
                recommendations={report.explanation?.recommended_verifications}
                uncertaintyNotice={report.explanation?.uncertainty_notice}
                fullReport={report}
                checkedItems={checkedItems}
                onToggleCheck={handleToggleCheck}
                onBackToWorkbench={() => {
                  setCurrentView('workbench');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNewAnalysis={handleResetAnalysis}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
