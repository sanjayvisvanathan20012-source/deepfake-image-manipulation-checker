import React, { useState } from 'react';
import { Layers, Activity, ImageIcon, Info, AlertTriangle, Sliders } from 'lucide-react';

const resolveImageDataUrl = (raw) => {
  if (!raw) return null;
  if (
    typeof raw === 'string' &&
    (raw.startsWith('data:image') ||
      raw.startsWith('blob:') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://'))
  ) {
    return raw;
  }
  return `data:image/png;base64,${raw}`;
};

export default function ForensicViewer({ originalImage, ela, frequency }) {
  const [activeTab, setActiveTab] = useState('original');
  const [imageError, setImageError] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);

  const tabs = [
    { id: 'original', label: 'Original', icon: ImageIcon },
    { id: 'ela', label: 'Error Level Analysis (ELA)', icon: Layers },
    { id: 'fft', label: '2D FFT Spectrum', icon: Activity },
  ];

  let rawSource = null;
  let description = "Original baseline image. Used as ground truth for compression and frequency transformations.";

  if (activeTab === 'original') {
    rawSource = originalImage;
  } else if (activeTab === 'ela') {
    rawSource =
      ela?.ela_image_base64 ||
      ela?.visual_map ||
      ela?.difference_map ||
      ela?.difference_map_url ||
      ela?.image_url;
    description =
      "Highlights 95% JPEG compression delta. High localized contrast suggests spliced or differently-compressed regions.";
  } else if (activeTab === 'fft') {
    rawSource =
      frequency?.spectrum_image_base64 ||
      frequency?.fft_magnitude_base64 ||
      frequency?.spectrum_map ||
      frequency?.spectrum_map_url ||
      frequency?.visual_map;
    description =
      "2D Fourier magnitude spectrum. High-frequency spikes or periodic grids may indicate neural generator upsampling.";
  }

  const currentImage = resolveImageDataUrl(rawSource);
  const resolvedOriginal = resolveImageDataUrl(originalImage);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setImageError(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col p-5 gap-4">
      {/* Top Header & Segmented Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Visual Evidence Canvas</span>
        </h3>

        {/* Segmented Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-black/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ELA Overlay Opacity Slider Bar */}
      {activeTab === 'ela' && currentImage && !imageError && resolvedOriginal && (
        <div className="bg-slate-50/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>ELA Overlay Opacity:</span>
            <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold text-xs">
              {overlayOpacity}%
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-medium">Original</span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full sm:w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[11px] text-slate-700 font-semibold">ELA</span>

            <div className="flex space-x-1 pl-1.5 border-l border-slate-200">
              {[0, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setOverlayOpacity(preset)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                    overlayOpacity === preset
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Central Image Canvas */}
      <div
        className="flex-1 bg-slate-100/60 relative min-h-[340px] max-h-[380px] rounded-xl flex items-center justify-center p-3 border border-slate-200/50 overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {currentImage && !imageError ? (
          activeTab === 'ela' && resolvedOriginal ? (
            <div className="relative inline-block max-h-[360px] max-w-full rounded-lg overflow-hidden shadow-inner ring-1 ring-slate-900/10">
              {/* Base Original Image */}
              <img
                src={resolvedOriginal}
                alt="Original baseline"
                className="object-contain max-h-[360px] w-auto block rounded-lg"
              />
              {/* Overlay ELA Difference Map */}
              <img
                src={currentImage}
                alt="ELA difference map"
                onError={() => setImageError(true)}
                style={{ opacity: overlayOpacity / 100 }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-lg transition-opacity duration-75"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentImage}
                alt={`${activeTab} view`}
                onError={() => setImageError(true)}
                className="object-contain max-h-[360px] w-auto mx-auto rounded-lg shadow-inner ring-1 ring-slate-900/10 transition-opacity duration-300"
              />
            </div>
          )
        ) : (
          <div className="text-slate-400 flex flex-col items-center bg-white/70 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm text-center">
            {imageError ? (
              <>
                <AlertTriangle className="w-10 h-10 mb-2 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">
                  Failed to render {activeTab.toUpperCase()} map
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Corrupted or incompatible image data received
                </span>
              </>
            ) : (
              <>
                <Layers className="w-10 h-10 mb-2 text-slate-300" />
                <span className="text-sm font-medium text-slate-600">
                  Signal map not available for this analysis
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Explanatory Info Footer */}
      <div className="flex items-start space-x-2 text-blue-900 bg-blue-50/60 p-3 rounded-xl border border-blue-100/80">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
