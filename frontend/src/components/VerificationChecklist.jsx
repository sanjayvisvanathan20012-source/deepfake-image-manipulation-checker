import React, { useState } from 'react';
import { ListChecks, AlertTriangle, CheckSquare, Square, Download, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerificationChecklist({
  recommendations = [],
  uncertaintyNotice,
  fullReport,
  checkedItems: controlledCheckedItems,
  onToggleCheck: controlledToggleCheck,
  onBackToWorkbench,
  onNewAnalysis,
}) {
  const [internalCheckedItems, setInternalCheckedItems] = useState({});
  const [downloaded, setDownloaded] = useState(false);

  // Use controlled state if provided, otherwise internal state
  const checkedItems = controlledCheckedItems !== undefined ? controlledCheckedItems : internalCheckedItems;

  const toggleCheck = (idx) => {
    if (controlledToggleCheck) {
      controlledToggleCheck(idx);
    } else {
      setInternalCheckedItems((prev) => ({
        ...prev,
        [idx]: !prev[idx],
      }));
    }
  };

  const totalItems = recommendations ? recommendations.length : 0;
  const completedItems = recommendations
    ? recommendations.filter((_, idx) => checkedItems[idx]).length
    : 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleExportJSON = () => {
    const now = new Date();
    const isoString = now.toISOString();
    const formattedTimestamp = isoString.replace(/[:.]/g, '-');

    const exportPayload = {
      export_metadata: {
        exported_at: isoString,
        generator: "Deepfake & Image Manipulation Checker",
        version: "1.0.0",
        total_checklist_items: totalItems,
        verified_items_count: completedItems,
      },
      verification_checklist: (recommendations || []).map((rec, idx) => ({
        index: idx + 1,
        recommendation: rec,
        is_verified: Boolean(checkedItems[idx]),
      })),
      uncertainty_notice: uncertaintyNotice || null,
      full_analysis_report: fullReport || null,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forensic_report_${formattedTimestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between gap-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Verification & Audit Checklist
            </h3>
          </div>
          {totalItems > 0 && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
              {completedItems}/{totalItems} Verified ({progressPercent}%)
            </span>
          )}
        </div>

        {/* Uncertainty Notice */}
        {uncertaintyNotice && (
          <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-amber-900 block mb-0.5 uppercase tracking-wide">
                Forensic Uncertainty & Context Note
              </strong>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {uncertaintyNotice}
              </p>
            </div>
          </div>
        )}

        {/* Checklist items */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase text-slate-400">
            Recommended Verification Actions
          </h4>

          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((rec, idx) => {
                const isChecked = Boolean(checkedItems[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`w-full text-left flex items-start space-x-3 p-3.5 rounded-xl border transition-all duration-200 ${
                      isChecked
                        ? 'bg-blue-50/60 border-blue-200/80 text-slate-900 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/60 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0 text-blue-600">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                        isChecked ? 'line-through text-slate-500 font-medium' : 'font-normal'
                      }`}
                    >
                      {rec}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 p-6 text-center border border-dashed border-slate-200 rounded-xl">
              No specific recommendations at this time.
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {onBackToWorkbench && (
            <button
              type="button"
              onClick={onBackToWorkbench}
              className="inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Workbench</span>
            </button>
          )}
          {onNewAnalysis && (
            <button
              type="button"
              onClick={onNewAnalysis}
              className="inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>New Analysis</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className={`w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm ${
            downloaded
              ? 'bg-emerald-600 text-white shadow-emerald-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Report Downloaded Successfully</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Forensic Report (JSON)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
