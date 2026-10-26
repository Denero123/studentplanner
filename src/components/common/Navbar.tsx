import React, { useState } from 'react';
import { SITE_CONFIG } from '../../config/site';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Settings as SettingsIcon,
  ChevronDown,
  Compass,
  ShoppingBag
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Glassmorphic Navigation Bar */}
      <nav className="w-full bg-[#0D1322]/90 backdrop-blur-md border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('/')}
                className="flex items-center gap-3 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-purple-400 transition-colors leading-tight">
                    {SITE_CONFIG.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                    {SITE_CONFIG.credit}
                  </span>
                </div>
              </button>
            </div>

            {/* Center Nav Links (Pill Style Track) */}
            <div className="hidden lg:flex items-center">
              <div className="bg-[#111A2E] p-1 rounded-xl flex items-center space-x-1 border border-white/5">
                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentPath === '/dashboard'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/study-plans/new')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentPath === '/study-plans/new'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Study Plans
                </button>
                <button
                  onClick={() => handleNav('/roadmap')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentPath === '/roadmap'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Roadmaps
                </button>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Bag / Profile Button */}
              <button
                onClick={() => handleNav(user ? '/dashboard' : '/auth')}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-[#111A2E] border border-white/5 transition-colors focus:outline-none relative"
                aria-label="Student bag"
              >
                <ShoppingBag className="w-4 h-4 text-purple-400" />
              </button>

              {/* Login / User Dropdown */}
              {!user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNav('/auth')}
                    className="px-4 py-2 text-sm rounded-xl text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-500 bg-[#111A2E] transition-all font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNav('/study-plans/new')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#111A2E] border border-white/10 hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                      {userInitial}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {userName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0F1626] border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2.5 border-b border-white/10">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => handleNav('/dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-teal-400" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => handleNav('/study-plans/new')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-purple-400" />
                        New Study Plan
                      </button>

                      <button
                        onClick={() => handleNav('/roadmap')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <Compass className="w-4 h-4 text-cyan-400" />
                        Roadmaps
                      </button>

                      <button
                        onClick={() => handleNav('/settings')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        Settings
                      </button>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#111A2E] border border-white/5"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0D1322]/95 backdrop-blur-md px-4 pt-4 pb-6 space-y-3">
            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/study-plans/new')}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Study Plans
                </button>
                <button
                  onClick={() => handleNav('/roadmap')}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Roadmaps
                </button>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleNav('/auth')}
                    className="w-full py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNav('/study-plans/new')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold shadow-md"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-[#111A2E] border border-white/5 rounded-xl mb-3">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-800 text-sm font-medium flex items-center gap-2 text-slate-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/study-plans/new')}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-800 text-sm font-medium flex items-center gap-2 text-slate-200"
                >
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  New Study Plan
                </button>
                <button
                  onClick={() => handleNav('/roadmap')}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-800 text-sm font-medium flex items-center gap-2 text-slate-200"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Roadmaps
                </button>
                <button
                  onClick={() => handleNav('/settings')}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-800 text-sm font-medium flex items-center gap-2 text-slate-200"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-rose-400 hover:bg-rose-950/30 text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
