import React, { useState } from 'react';
import { Database, Image as ImageIcon, Camera, AlertCircle, ChevronDown, ChevronRight, Grid } from 'lucide-react';

const renderFormattedValue = (val) => {
  if (val === null || val === undefined) {
    return <span className="text-slate-400 italic">null</span>;
  }
  
  if (typeof val === 'boolean') {
    return (
      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${val ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
        {val ? 'TRUE' : 'FALSE'}
      </span>
    );
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-slate-400 italic">[]</span>;
    
    // If array contains primitives
    const allPrimitives = val.every((item) => typeof item !== 'object' || item === null);
    if (allPrimitives) {
      return (
        <span className="text-slate-800 font-mono">
          {val.map((item) => (item === null ? 'null' : String(item))).join(', ')}
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1 py-1">
        {val.map((item, i) => (
          <div key={i} className="text-xs bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
            {renderFormattedValue(item)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val);
    if (entries.length === 0) return <span className="text-slate-400 italic">&#123;&#125;</span>;

    return (
      <div className="flex flex-wrap gap-1.5 py-0.5">
        {entries.map(([subKey, subVal], i) => (
          <span
            key={i}
            className="inline-flex items-center text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 shadow-2xs"
          >
            <strong className="text-slate-500 mr-1 font-semibold">{subKey}:</strong>
            <span className="font-mono">{typeof subVal === 'object' && subVal !== null ? JSON.stringify(subVal) : String(subVal)}</span>
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-slate-800 font-mono break-all">{String(val)}</span>;
};

export default function MetadataInspector({ metadata, properties }) {
  const [showDQT, setShowDQT] = useState(false);

  if (!metadata && !properties) return null;

  const hasExifTags = metadata?.exif_data && Object.keys(metadata.exif_data).length > 0;
  const hasDQT = metadata?.quantization_tables && Object.keys(metadata.quantization_tables).length > 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center space-x-2 mb-3 pb-2.5 border-b border-slate-100">
        <Database className="w-4 h-4 text-blue-500" />
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Metadata & Properties</h3>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[240px] pr-1.5 custom-scrollbar">
        {/* Basic Properties */}
        {properties && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Core Profile
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-400 text-xs block mb-0.5">Format</span>
                <span className="font-medium text-slate-700">{properties.format || 'Unknown'}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-400 text-xs block mb-0.5">Dimensions</span>
                <span className="font-medium text-slate-700">
                  {properties.width != null && properties.height != null 
                    ? `${properties.width} × ${properties.height} px` 
                    : 'Unknown'}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-400 text-xs block mb-0.5">Color Mode</span>
                <span className="font-medium text-slate-700">{properties.mode || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}

        {/* EXIF Metadata */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> EXIF Data
          </h4>
          
          {hasExifTags ? (
            <div className="bg-slate-50 rounded border border-slate-100 overflow-hidden text-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(metadata.exif_data).map(([key, value], idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 text-xs font-medium text-slate-500 w-1/3 break-words align-top">
                        {key}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-800 align-top">
                        {renderFormattedValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start space-x-2 text-slate-600 text-sm shadow-sm">
              <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">No EXIF tags present (Common on web & social media)</span>
            </div>
          )}
        </div>

        {/* Quantization Tables */}
        {hasDQT && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" /> Quantization Tables
            </h4>
            <div className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowDQT(!showDQT)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>Tables detected: {Object.keys(metadata.quantization_tables).length} table(s) present</span>
                {showDQT ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {showDQT && (
                <div className="p-3 border-t border-slate-100 bg-white">
                  {Object.entries(metadata.quantization_tables).map(([key, table]) => (
                    <div key={key} className="mb-4 last:mb-0">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Table {key}</div>
                      <div className="overflow-x-auto">
                        <table className="text-xs font-mono text-slate-600 border-collapse">
                          <tbody>
                            {Array.isArray(table) && table.map((row, i) => (
                              <tr key={i}>
                                {Array.isArray(row) ? row.map((val, j) => (
                                  <td key={j} className="border border-slate-200 p-1 w-6 text-center">{val}</td>
                                )) : <td className="border border-slate-200 p-1">{String(row)}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
