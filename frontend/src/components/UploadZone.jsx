import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, X } from 'lucide-react';

export default function UploadZone({ onAnalyze, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and WebP are supported.');
      return;
    }
    
    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSelectedFile(file);
    
    // Automatically trigger analysis
    onAnalyze(file, objectUrl);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 bg-white/60 backdrop-blur-md shadow-sm ${
          dragActive 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">
              Drag & Drop to upload
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or click to browse local files
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100/80 px-3 py-1.5 rounded-full">
            <FileImage className="w-4 h-4" />
            <span>JPEG, PNG, WebP up to 15MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
