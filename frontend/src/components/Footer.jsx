import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white/70 backdrop-blur-lg border-t border-slate-200/70 pt-16 pb-12 px-6 mt-20 text-slate-600 font-sans w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 5-Column Responsive Layout */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Mission */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
                  <line x1="9.69" y1="8" x2="21.17" y2="8" />
                  <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
                  <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
                  <line x1="14.31" y1="16" x2="2.83" y2="16" />
                  <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
                  <circle cx="12" cy="12" r="3" strokeWidth="2" stroke="white" />
                  <line x1="12" y1="7" x2="12" y2="10" strokeWidth="2" />
                  <line x1="12" y1="14" x2="12" y2="17" strokeWidth="2" />
                  <line x1="7" y1="12" x2="10" y2="12" strokeWidth="2" />
                  <line x1="14" y1="12" x2="17" y2="12" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TrueLens</span>
            </div>
            <p className="text-sm font-medium leading-relaxed max-w-xs text-slate-600">
              Evidence-Based Image Manipulation & Deepfake Forensics
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-sm mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Engine v1.0 • Online</span>
            </div>
          </div>

          {/* Col 2: Detection Signals */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Detection Signals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Error Level Analysis</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">2D FFT Power Spectrum</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">CLIP-ViT Feature Probe</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">EXIF & DQT Extraction</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Signal Fusion Engine</a></li>
            </ul>
          </div>

          {/* Col 3: Forensic Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Forensic Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Interpreting ELA Heatmaps</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Frequency Grid Anomalies</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Social Compression Guide</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Verification Checklist</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Col 4: Security & Privacy */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Security & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Zero-Storage Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">In-Memory Buffer Processing</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Decompression Bomb Shield</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Client-Side Report Export</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Apple Silicon MPS Native</a></li>
            </ul>
          </div>

          {/* Col 5: Institutional */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Institutional</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Academic Research</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Report Vulnerability</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Student Capstone Project</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/70 pt-8 mt-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 TrueLens Forensics. Built for academic research and evidence-based media verification.
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed text-justify md:text-right max-w-3xl">
            <strong>DISCLAIMER:</strong> TrueLens is an assistive digital forensic analysis suite. All verdicts and confidence scores represent probabilistic evidence estimations and must not be used as standalone legal proof of fraud or authenticity.
          </p>
        </div>

      </div>
    </footer>
  );
}
