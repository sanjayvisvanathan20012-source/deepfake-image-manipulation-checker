import React from 'react';
import { ArrowRight, ShieldCheck, Search, Image as ImageIcon, Cpu, Layers, Eye, Lock, AlertTriangle, FileSearch, Sparkles } from 'lucide-react';
import Footer from './Footer';
import ReviewScroll from './ReviewScroll';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-blue-50/40 p-4 sm:p-6 md:p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-16 pb-16 animate-in fade-in zoom-in-95 duration-700 mt-8">
        
        {/* Core Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-white/60 rounded-2xl shadow-sm border border-white/80 mb-2">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <div className="flex flex-col items-center justify-center space-y-3">
            <span className="text-xs uppercase font-mono px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
              v1.0 Baseline
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
              TrueLens Image Manipulation & Deepfake Forensics
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            TrueLens is an AI image manipulation detector and forensic-assistance suite designed to uncover synthetic generation, deepfake face swaps, and digital splicing through multi-signal verification.
          </p>
        </div>

        {/* Action Prompt Card */}
        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl border border-white/60 shadow-lg text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Do you want to check whether your image is an AI generated or an real image?
          </h2>
          <button
            onClick={onStart}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Start verification</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Manipulation Vector Taxonomy */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Manipulation Vector Taxonomy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-3">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              <h3 className="font-bold text-slate-900">Diffusion & Flow Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generative models like Midjourney, Stable Diffusion, and Flux often leave behind microscopic texture smearing and unnatural sub-pixel correlations that our engine can detect.
              </p>
            </div>
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-3">
              <Eye className="w-6 h-6 text-pink-500" />
              <h3 className="font-bold text-slate-900">Face Swapping & GANs</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tools like StyleGAN and DeepFaceLab introduce subtle boundary blending artifacts and warping inconsistencies around facial landmarks.
              </p>
            </div>
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-3">
              <Layers className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-slate-900">Digital Splicing & Inpainting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manual composite imagery, cloning, and object removal often result in mismatched lighting and abrupt transitions in error levels across the image plane.
              </p>
            </div>
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-3">
              <FileSearch className="w-6 h-6 text-teal-500" />
              <h3 className="font-bold text-slate-900">Metadata & Provenance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Social platforms and bad actors routinely strip EXIF data, rewrite timestamps, and eliminate camera serials to hide an image's true origin.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How Our 4-Layer Forensic Engine Works */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center">How Our 4-Layer Forensic Engine Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <span>Defensive File Ingestion</span>
                </h3>
                <p className="text-sm text-slate-600">
                  Strict MIME validation, magic-byte inspection, and dimensional limits to mitigate decompression bombs and malformed payloads.
                </p>
              </div>
            </div>
            
            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-4">
              <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md shrink-0">
                2
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  <span>EXIF & Quantization Profiling</span>
                </h3>
                <p className="text-sm text-slate-600">
                  Extraction of camera hardware tags and deep inspection of JPEG quantization matrix discrepancies to find software editing trails.
                </p>
              </div>
            </div>

            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-4">
              <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md shrink-0">
                3
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-teal-500" />
                  <span>Spatial & Frequency Forensics</span>
                </h3>
                <p className="text-sm text-slate-600">
                  Error Level Analysis (ELA) isolates compression error deltas, while 2D FFT evaluates periodic upsampler grids characteristic of AI generators.
                </p>
              </div>
            </div>

            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col space-y-4">
              <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md shrink-0">
                4
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-red-500" />
                  <span>Neural Signal Fusion</span>
                </h3>
                <p className="text-sm text-slate-600">
                  CLIP-ViT feature representations are combined with our multi-signal pipeline to provide a unified verdict with transparent uncertainty bounds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 3: Forensic Realism & Social Media Pitfalls */}
          <div className="bg-amber-50/70 backdrop-blur-md p-8 rounded-2xl border border-amber-200/50 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Forensic Realism & Social Media</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed space-y-3">
              <span className="block"><strong>Missing metadata is NOT proof of fraud.</strong> Most social media platforms (like Instagram, WhatsApp, and X) automatically strip EXIF data to protect user privacy and reduce file sizes.</span>
              <span className="block mt-2">Aggressive platform compression also flattens forensic noise, making classical detection methods like ELA less reliable. This is why our system fuses multiple signals and provides calibrated guidance with uncertainty bounds, rather than a reckless, binary "100% Fake" accusation.</span>
            </p>
          </div>

          {/* Section 4: Privacy & Security Guarantee */}
          <div className="bg-green-50/70 backdrop-blur-md p-8 rounded-2xl border border-green-200/50 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-green-700">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-bold">Privacy & Zero-Storage Guarantee</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Confidentiality is paramount in forensic investigations. Our pipeline is engineered with a strict <strong>zero-storage policy</strong>.
              <br /><br />
              All uploaded evidence is evaluated strictly in-memory using <code className="bg-white/60 px-1.5 py-0.5 rounded border border-green-200 text-xs">io.BytesIO</code> buffers. Raw images, analysis maps, and generated metadata are <strong>purged immediately</strong> upon generating the final response. We never write your files to disk or train models on your data.
            </p>
          </div>
        </div>

      </div>
      <ReviewScroll />
      <Footer />
    </div>
  );
}
