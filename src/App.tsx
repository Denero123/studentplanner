import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CreatePlanPage } from './components/planner/CreatePlanPage';
import { PlanDetailPage } from './components/planner/PlanDetailPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { RoutinePage } from './components/routine/RoutinePage';
import { OfferingPlannerPage } from './components/planner/OfferingPlannerPage';
import { AlertCircle, RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
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
      // Handle hash anchor scroll
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

  // Protected route checker
  const isProtectedRoute = (path: string) => {
    return (
      path === '/dashboard' ||
      path === '/dashboard/routine' ||
      path === '/dashboard/offering-planner' ||
      path === '/study-plans/new' ||
      path.startsWith('/study-plans/') ||
      path === '/settings'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Initializing StudyFlow AI...
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated user trying to access protected routes
  if (!user && isProtectedRoute(currentPath)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Sign In Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please sign in to access your personal study schedules and tracking tools.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Home
              </button>
            </div>
          </div>
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Route matching
  let pageContent = null;

  if (currentPath === '/') {
    pageContent = <LandingPage navigate={navigate} />;
  } else if (currentPath === '/signup') {
    pageContent = <SignUpPage navigate={navigate} />;
  } else if (currentPath === '/login') {
    pageContent = <LoginPage navigate={navigate} />;
  } else if (currentPath === '/forgot-password') {
    pageContent = <ForgotPasswordPage navigate={navigate} />;
  } else if (currentPath === '/dashboard') {
    pageContent = <DashboardPage navigate={navigate} />;
  } else if (currentPath === '/dashboard/routine') {
    pageContent = <RoutinePage navigate={navigate} />;
  } else if (currentPath === '/dashboard/offering-planner') {
    pageContent = <OfferingPlannerPage navigate={navigate} />;
  } else if (currentPath === '/study-plans/new') {
    pageContent = <CreatePlanPage navigate={navigate} />;
  } else if (currentPath.startsWith('/study-plans/')) {
    const planId = currentPath.replace('/study-plans/', '').split('?')[0].split('#')[0];
    pageContent = <PlanDetailPage planId={planId} navigate={navigate} />;
  } else if (currentPath === '/settings') {
    pageContent = <SettingsPage navigate={navigate} />;
  } else {
    // 404 Fallback
    pageContent = (
      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The page you requested does not exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{pageContent}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
