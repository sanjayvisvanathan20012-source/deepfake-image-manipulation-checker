import React from 'react';
import { Upload, Cpu, Eye, CheckCircle } from 'lucide-react';

const steps = [
  { id: 'upload', name: 'Upload', icon: Upload, idx: 0 },
  { id: 'processing', name: 'Processing', icon: Cpu, idx: 1 },
  { id: 'workbench', name: 'Forensic Workbench', icon: Eye, idx: 2 },
  { id: 'audit', name: 'Audit & Report', icon: CheckCircle, idx: 3 },
];

export default function StepProgress({ currentStep, onStepClick, isProcessing = false, hasReport = false }) {
  const currentStepIdx = steps.find(s => s.id === currentStep)?.idx || 0;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-0 hidden sm:block">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStepIdx > step.idx;
          const Icon = step.icon;

          // Step 'upload' is always accessible when not processing.
          // Step 'workbench' and 'audit' are accessible once analysis report is ready.
          // Step 'processing' is purely a transition state while actively processing.
          const isClickable = !isProcessing && (
            step.id === 'upload' || 
            (hasReport && (step.id === 'workbench' || step.id === 'audit'))
          );

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.id);
                }
              }}
              className={`flex flex-col items-center group focus:outline-none z-10 transition-transform ${
                isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-blue-500 bg-white text-blue-600 shadow-md ring-4 ring-blue-50'
                    : isCompleted
                    ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                } ${isClickable && !isActive ? 'group-hover:border-blue-400 group-hover:text-blue-600 group-hover:bg-blue-50/50' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-700 font-semibold' 
                    : isCompleted 
                    ? 'text-slate-600 group-hover:text-blue-600' 
                    : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
