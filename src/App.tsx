import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CreatePlanPage } from './components/planner/CreatePlanPage';
import { PlanDetailPage } from './components/planner/PlanDetailPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { RoutinePage } from './components/routine/RoutinePage';
import { RoadmapPlannerPage } from './components/planner/RoadmapPlannerPage';
import { NotesHub } from './components/notes/NotesHub';
import { DailyPractice } from './components/practice/DailyPractice';
import { AnimatedBackground } from './components/AnimatedBackground';
import { AlertCircle, RefreshCw } from 'lucide-react';

function AppContent() {
  const { loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Initializing StudyForge AI...
          </p>
        </div>
      </div>
    );
  }

  // Route matching
  let pageContent = null;

  if (currentPath === '/') {
    pageContent = <LandingPage navigate={navigate} />;
  } else if (currentPath === '/auth' || currentPath === '/login' || currentPath === '/signup') {
    pageContent = <AuthPage navigate={navigate} />;
  } else if (currentPath === '/dashboard') {
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <DashboardPage navigate={navigate} />
      </ProtectedRoute>
    );
  } else if (currentPath === '/dashboard/routine') {
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <RoutinePage navigate={navigate} />
      </ProtectedRoute>
    );
  } else if (currentPath === '/roadmap') {
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <RoadmapPlannerPage navigate={navigate} />
      </ProtectedRoute>
    );
  } else if (currentPath === '/notes') {
    pageContent = <NotesHub navigate={navigate} />;
  } else if (currentPath === '/daily-practice') {
    pageContent = <DailyPractice navigate={navigate} />;
  } else if (currentPath === '/study-plans/new') {
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <CreatePlanPage navigate={navigate} />
      </ProtectedRoute>
    );
  } else if (currentPath.startsWith('/study-plans/')) {
    const planId = currentPath.replace('/study-plans/', '').split('?')[0].split('#')[0];
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <PlanDetailPage planId={planId} navigate={navigate} />
      </ProtectedRoute>
    );
  } else if (currentPath === '/settings') {
    pageContent = (
      <ProtectedRoute navigate={navigate}>
        <SettingsPage navigate={navigate} />
      </ProtectedRoute>
    );
  } else {
    // 404 Fallback
    pageContent = (
      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The page you requested does not exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white text-xs font-semibold shadow-md"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white relative">
      <AnimatedBackground />
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1 relative z-10">
        {pageContent}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
