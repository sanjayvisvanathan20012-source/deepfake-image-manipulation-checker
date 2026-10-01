import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, BrainCircuit, HelpCircle } from 'lucide-react';

export default function VerdictBanner({ verdict, confidenceBand, aiProbability, summary }) {
  let theme = {
    bg: 'bg-slate-50/80',
    border: 'border-slate-200/80',
    icon: HelpCircle,
    iconColor: 'text-slate-600',
    titleColor: 'text-slate-900',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: verdict || 'Inconclusive / Mixed Forensic Signals'
  };

  const vLower = (verdict || '').toLowerCase();

  if (vLower.includes('low suspicion') || vLower.includes('authentic') || vLower.includes('natural')) {
    theme = {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/80',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-950',
      badgeBg: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
      label: verdict || 'Low Suspicion / Consistent Natural Signals'
    };
  } else if (vLower.includes('splicing') || vLower.includes('manipulation') || vLower.includes('suspicious')) {
    theme = {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200/80',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-950',
      badgeBg: 'bg-amber-100/80 text-amber-800 border-amber-300',
      label: verdict || 'Potential Splicing / Digital Manipulation'
    };
  } else if (vLower.includes('ai-generated') || vLower.includes('synthetic') || vLower.includes('generator')) {
    theme = {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200/80',
      icon: XCircle,
      iconColor: 'text-rose-600',
      titleColor: 'text-rose-950',
      badgeBg: 'bg-rose-100/80 text-rose-800 border-rose-300',
      label: verdict || 'Likely AI-Generated / Synthetic'
    };
  } else {
    theme = {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200/80',
      icon: HelpCircle,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-950',
      badgeBg: 'bg-blue-100/80 text-blue-800 border-blue-300',
      label: verdict || 'Inconclusive / Mixed Forensic Signals'
    };
  }

  const Icon = theme.icon;
  const aiProbPercent = aiProbability !== undefined && aiProbability !== null ? (aiProbability * 100).toFixed(1) : 'N/A';
  const probNum = Number(aiProbability) || 0;

  return (
    <div className={`rounded-2xl border backdrop-blur-md shadow-sm p-5 flex flex-col gap-4 ${theme.bg} ${theme.border}`}>
      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-white shadow-xs border border-white/80 flex-shrink-0 mt-0.5">
            <Icon className={`w-6 h-6 ${theme.iconColor}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${theme.badgeBg}`}>
                Confidence: {confidenceBand || 'MEDIUM'}
              </span>
            </div>
            <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug ${theme.titleColor}`}>
              {theme.label}
            </h3>
          </div>
        </div>
      </div>

      {/* Summary Text */}
      {summary && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white/50 p-3 rounded-xl border border-slate-200/50">
          {summary}
        </p>
      )}

      {/* AI Synthetic Generation Gauge Card */}
      <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/70 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <BrainCircuit className="w-4 h-4 text-blue-500" />
            <span>AI Generative Probability Probe</span>
          </div>
          <div className="flex items-baseline space-x-0.5 font-mono">
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              {aiProbPercent}
            </span>
            <span className="text-xs font-semibold text-slate-500">%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
          <div 
            className={`h-full transition-all duration-500 ${
              probNum >= 0.7 ? 'bg-rose-500' : probNum >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, probNum * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>0% (Natural)</span>
          <span>50% (Ambiguous)</span>
          <span>100% (Synthetic)</span>
        </div>
      </div>
    </div>
  );
}
