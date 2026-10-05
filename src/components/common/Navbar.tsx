import React, { useState } from 'react';
import { SITE_CONFIG } from '../../config/site';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  PlusCircle, 
  Settings as SettingsIcon,
  ChevronDown,
  Calendar,
  Briefcase
} from 'lucide-react';
import { BookingModal } from './BookingModal';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Subtle Credit */}
          <div className="flex items-center gap-3">
            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center shrink-0" title="View screenshot on imgbb">
              <img src="https://i.ibb.co/8ndjryhv/Screenshot-2026-09-28-070103.png" alt="Screenshot 2026 09 28 070103" className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30 shadow-sm hover:scale-105 transition-transform" />
            </a>
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {SITE_CONFIG.name}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
                  {SITE_CONFIG.credit}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <button
                  onClick={() => handleNav('/#how-it-works')}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => handleNav('/#features')}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => handleNav('/#faq')}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                >
                  FAQ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    currentPath === '/dashboard'
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/dashboard/routine')}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    currentPath === '/dashboard/routine'
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Daily Routine
                </button>
                <button
                  onClick={() => handleNav('/dashboard/offering-planner')}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    currentPath === '/dashboard/offering-planner'
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Offering Planner
                </button>
                <button
                  onClick={() => handleNav('/study-plans/new')}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    currentPath === '/study-plans/new'
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Plan
                </button>
              </>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Schedule Booking Button */}
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              title="Schedule inspection or long-term appointment up to 12 months ahead"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Booking</span>
            </button>

            {/* Dark mode button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
              aria-label="Toggle color theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('/dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => handleNav('/dashboard/routine')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Daily Routine
                    </button>

                    <button
                      onClick={() => handleNav('/study-plans/new')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      New Study Plan
                    </button>

                    <button
                      onClick={() => handleNav('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      Settings
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          {!user ? (
            <div className="space-y-2">
              <button
                onClick={() => handleNav('/#how-it-works')}
                className="w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNav('/#features')}
                className="w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Features
              </button>
              <button
                onClick={() => handleNav('/#faq')}
                className="w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                FAQ
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                Dashboard
              </button>
              <button
                onClick={() => handleNav('/dashboard/routine')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                Daily Routine
              </button>
              <button
                onClick={() => handleNav('/study-plans/new')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-500" />
                Create New Plan
              </button>
              <button
                onClick={() => handleNav('/settings')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />
    </>
  );
};
