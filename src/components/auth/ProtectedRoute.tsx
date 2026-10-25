import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  navigate: (path: string, options?: { replace?: boolean }) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, navigate }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F19]">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please sign in or continue as guest to access your personal study schedules, daily routines, and tracking tools.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigate('/auth', { replace: true })}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
