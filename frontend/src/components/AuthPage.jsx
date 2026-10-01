import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, LogIn } from 'lucide-react';

export default function AuthPage({ onBack, onLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email: email || 'user@example.com', name: username || 'Investigator' });
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email: 'investigator@gmail.com', name: 'Google User' });
    }, 800);
  };

  const handleGuest = () => {
    onLogin({ email: 'guest@example.com', name: 'Guest Investigator' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-blue-50/40 flex flex-col items-center justify-center p-6 text-slate-800 font-sans relative">
      
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 inline-flex items-center space-x-2 text-slate-500 hover:text-slate-800 bg-white/50 hover:bg-white/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200/60 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">&lt;- Back to Overview</span>
      </button>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/80 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl p-8 max-w-md w-full">
          <div className="text-center space-y-2 mb-8">
            <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sign In to Continue</h2>
            <p className="text-sm text-slate-500">Access the forensic workspace to analyze your image.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Gmail / Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200/80 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 outline-none transition-all"
                  placeholder="investigator@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200/80 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 outline-none transition-all"
                  placeholder="investigator"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200/80 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer"
                />
                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-xl text-sm px-5 py-3.5 text-center shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In / Register</span>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-xs font-medium text-slate-400 bg-transparent">OR</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 focus:ring-4 focus:outline-none focus:ring-slate-100 font-semibold rounded-xl text-sm px-5 py-3 text-center shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={handleGuest}
              className="w-full text-slate-500 hover:text-slate-700 bg-transparent text-sm font-medium transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
