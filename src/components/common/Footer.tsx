import React from 'react';
import { SITE_CONFIG } from '../../config/site';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {SITE_CONFIG.tagline} Built to turn ambitious academic goals into structured, realistic daily progress.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Row Level Security Enforced · Zero Data Leakage
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button onClick={() => navigate('/#how-it-works')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/#features')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Intelligent Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/study-plans/new')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AI Plan Generator
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links / Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Study Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/study-plans/new')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Create Plan
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/analytics')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Analytics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Cyber credit */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>

          <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
            <span>Designed & Engineered</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
              {SITE_CONFIG.credit}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
