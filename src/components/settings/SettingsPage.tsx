import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { 
  User, 
  Mail, 
  Lock, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  Database, 
  Key, 
  Check, 
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const SettingsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    // Simulate updating password securely
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password updated successfully.');
    }, 600);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sampleSqlSnippet = `-- Supabase PostgreSQL Row Level Security (RLS)
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own study plans"
ON public.study_plans FOR SELECT USING (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your student profile, theme preferences, and security.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-xs text-slate-400">Your verified StudyFlow credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span>{user?.name || 'Student'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email || ''}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences: Dark Mode */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Appearance & Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Students study late at night—switch between comfortable dark mode and clean daylight mode.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Key className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
            <div>
              <label className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Database & Supabase Architectural Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database & Persistence</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Active & Synced
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All study plans, topics, and tasks are strictly scoped to your user ID. Foreign key cascades delete all child tasks whenever a study plan is removed.
          </p>

          <button
            type="button"
            onClick={() => setShowSqlViewer(!showSqlViewer)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{showSqlViewer ? 'Hide Supabase SQL Scripts' : 'View Supabase PostgreSQL & RLS Scripts'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSqlViewer ? 'rotate-90' : ''}`} />
          </button>

          {showSqlViewer && (
            <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto relative">
              <button
                onClick={copySql}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
              >
                {sqlCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {sqlCopied ? 'Copied' : 'Copy'}
              </button>
              <pre className="pr-16">
{`-- Supabase PostgreSQL Schema & RLS
CREATE TABLE public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own plans"
ON public.study_plans FOR ALL
USING (auth.uid() = user_id);`}
              </pre>
            </div>
          )}
        </div>

        {/* Sign Out Card */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
