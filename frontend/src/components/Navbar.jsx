import React from 'react';
import { Shield, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ onSignInClick, isAuthenticated, user, onSignOut }) {
  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md border border-white/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Aperture blades */}
              <circle cx="12" cy="12" r="10" />
              <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
              <line x1="9.69" y1="8" x2="21.17" y2="8" />
              <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
              <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
              <line x1="14.31" y1="16" x2="2.83" y2="16" />
              <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
              {/* Central scanning reticle */}
              <circle cx="12" cy="12" r="3" strokeWidth="2" stroke="white" />
              <line x1="12" y1="7" x2="12" y2="10" strokeWidth="2" />
              <line x1="12" y1="14" x2="12" y2="17" strokeWidth="2" />
              <line x1="7" y1="12" x2="10" y2="12" strokeWidth="2" />
              <line x1="14" y1="12" x2="17" y2="12" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="flex items-center space-x-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">TrueLens</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                FORENSIC SUITE v1.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full pl-1 pr-3 py-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-700">{user?.name || 'Investigator'}</span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white/50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-md px-2.5 py-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 border border-slate-200 shadow-sm rounded-md px-3 py-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
