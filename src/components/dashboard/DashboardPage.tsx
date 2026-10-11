import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StudyPlan, StudyTask } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  Flame, 
  AlertCircle, 
  Database, 
  Check, 
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  WifiOff
} from 'lucide-react';
import { BookingModal } from '../common/BookingModal';
import { PomodoroTimer } from './PomodoroTimer';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [todayTasks, setTodayTasks] = useState<(StudyTask & { plan_title: string; subject: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [groupBySubject, setGroupBySubject] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, todayRes] = await Promise.all([
        api.getPlans(),
        api.getTodayTasks(),
      ]);
      setPlans(plansRes.data || []);
      setTodayTasks(todayRes.data || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      toastError('Failed to load study plans. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Toggle task completion
  const handleToggleTask = async (task: StudyTask & { plan_title: string; subject: string }) => {
    const previousState = task.completed;
    const nextState = !previousState;

    // Optimistic UI update for today's tasks
    setTodayTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, completed: nextState } : t))
    );

    // Optimistic update for plans
    setPlans(prevPlans =>
      prevPlans.map(p => {
        if (p.id === task.plan_id) {
          const comp = (p.completed_tasks || 0) + (nextState ? 1 : -1);
          const total = p.total_tasks || 1;
          return {
            ...p,
            completed_tasks: Math.max(0, comp),
            progress_percentage: Math.min(100, Math.max(0, Math.round((comp / total) * 100))),
          };
        }
        return p;
      })
    );

    try {
      await api.toggleTask(task.id, nextState);
      if (nextState) {
        success('Task completed! Keep up the momentum.');
      }
    } catch (err: any) {
      // Rollback on failure
      setTodayTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, completed: previousState } : t))
      );
      toastError('Could not update task. Please try again.');
    }
  };

  // Delete plan handler
  const handleDeletePlan = async (planId: string) => {
    setIsDeleting(true);
    try {
      await api.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      setTodayTasks(prev => prev.filter(t => t.plan_id !== planId));
      setDeleteConfirmId(null);
      success('Study plan and all associated tasks removed.');
    } catch (err: any) {
      toastError('Failed to delete study plan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Seed demo data handler
  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedDemoData();
      success('Demo study plan created!');
      await loadDashboardData();
      if (res.data?.id) {
        navigate(`/study-plans/${res.data.id}`);
      }
    } catch (err: any) {
      toastError('Failed to create demo plan.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Computed summary metrics
  const totalPlans = plans.length;
  const activePlansCount = plans.filter(p => (p.progress_percentage || 0) < 100).length;
  const totalTasksCount = plans.reduce((acc, p) => acc + (p.total_tasks || 0), 0);
  const completedTasksCount = plans.reduce((acc, p) => acc + (p.completed_tasks || 0), 0);
  const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const todayCount = todayTasks.length;

  const uniqueSubjects = Array.from(new Set(plans.map(p => p.subject || 'General'))).sort();

  const basePlans = plans.filter(p => {
    if (activeTab === 'active') return (p.progress_percentage || 0) < 100;
    if (activeTab === 'completed') return (p.progress_percentage || 0) >= 100;
    return true;
  });

  const filteredPlans = selectedSubject === 'All' 
    ? basePlans 
    : basePlans.filter(p => (p.subject || 'General') === selectedSubject);

  const groupedPlans = uniqueSubjects
    .map(subject => ({
      subject,
      plans: basePlans.filter(p => (p.subject || 'General') === subject)
    }))
    .filter(g => g.plans.length > 0);

  // Helper to render individual plan card
  const renderPlanCard = (plan: StudyPlan) => {
    const isOverdue = new Date(plan.deadline) < new Date() && (plan.progress_percentage || 0) < 100;
    return (
      <div
        key={plan.id}
        className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-indigo-500/20 p-6 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
      >
        <div>
          {/* Top tags */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
              {plan.subject}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {plan.deadline}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigate(`/study-plans/${plan.id}`)}
            className="text-base font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
          >
            {plan.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {plan.summary || 'Structured daily pacing plan.'}
          </p>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">
                {plan.completed_tasks || 0} of {plan.total_tasks || 0} tasks done
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {plan.progress_percentage || 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-cyan-400 transition-all duration-300"
                style={{ width: `${plan.progress_percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer action buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => navigate(`/study-plans/${plan.id}`)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Open Schedule</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setDeleteConfirmId(plan.id)}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
            title="Delete study plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white min-h-[calc(100vh-4rem)] transition-colors">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span>You are currently offline. Your downloaded study plans, tasks, and calendar events remain fully accessible from local storage!</span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
            Offline Mode Active
          </span>
        </div>
      )}

      {/* ──────────────── Dashboard Header ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}. 👋</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed mt-1">
            Ready to make progress today? Here is where your academic schedule stands.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeedDemo}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 focus:outline-none"
            title="Populate an instant sample study plan"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>{isSeeding ? 'Loading Demo...' : 'Load Demo Plan'}</span>
          </button>

          <button
            onClick={() => navigate('/study-plans/new')}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 focus:outline-none"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Create Study Plan</span>
          </button>
        </div>
      </div>

      {/* ──────────────── Summary Metrics Grid ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Plans */}
        <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Plans</span>
            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {activePlansCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              of {totalPlans} total
            </span>
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              finished
            </span>
          </div>
        </div>

        {/* Card 3: Today's Tasks */}
        <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Tasks</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {todayCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              scheduled
            </span>
          </div>
        </div>

        {/* Card 4: Overall Progress */}
        <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ──────────────── Pomodoro Focus Timer Section ──────────────── */}
      <div>
        <PomodoroTimer />
      </div>

      {/* ──────────────── Main Content Columns: Today's Tasks & Plans ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Study Plans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Study Plans
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {plans.length}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'active'
                    ? 'bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In Progress ({plans.filter(p => (p.progress_percentage || 0) < 100).length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'completed'
                    ? 'bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Completed ({plans.filter(p => (p.progress_percentage || 0) >= 100).length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({plans.length})
              </button>
            </div>
          </div>

          {/* ──────────────── Subject Filter & Grouping System ──────────────── */}
          {!isLoading && plans.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B0F19] p-3.5 rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5">
              {/* Subject Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedSubject('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubject === 'All'
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  All Subjects ({basePlans.length})
                </button>
                {uniqueSubjects.map(subj => {
                  const count = basePlans.filter(p => (p.subject || 'General') === subj).length;
                  return (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedSubject === subj
                          ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      }`}
                    >
                      {subj} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Group by Subject Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setGroupBySubject(!groupBySubject)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    groupBySubject
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Toggle grouping study plans by subject"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{groupBySubject ? 'Grouped by Subject' : 'Flat Grid'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
              <p className="text-sm font-medium">Loading your study schedules...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-dashed border-slate-300 dark:border-indigo-500/30 space-y-4 shadow-sm dark:shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No study plans found.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedSubject !== 'All' 
                    ? `No study plans found for "${selectedSubject}" under the selected tab.`
                    : 'Create your first AI-powered study plan and turn your academic goals into action.'}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/study-plans/new')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>Create Study Plan</span>
                </button>
                <button
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Load Sample Plan
                </button>
              </div>
            </div>
          ) : groupBySubject && selectedSubject === 'All' ? (
            /* Grouped by Subject Sections */
            <div className="space-y-8">
              {groupedPlans.map(group => (
                <div key={group.subject} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      {group.subject}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {group.plans.length} {group.plans.length === 1 ? 'Course' : 'Courses'}
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.plans.map(plan => renderPlanCard(plan))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat Filtered Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map(plan => renderPlanCard(plan))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Today's Tasks Interactive Checklist */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-indigo-500/20 p-5 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Today's Tasks
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                {todayTasks.filter(t => t.completed).length}/{todayTasks.length} Done
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 dark:text-emerald-400/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  No tasks due today.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You're all caught up, or your next session starts tomorrow!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-4">
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 group ${
                      task.completed
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-emerald-400 border-emerald-400 text-slate-950 font-bold'
                          : 'border-slate-300 dark:border-slate-700 group-hover:border-indigo-500 dark:group-hover:border-indigo-400'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 text-slate-950 font-extrabold" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium leading-snug transition-all ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="truncate max-w-[120px] font-medium text-indigo-600 dark:text-indigo-400">
                          {task.subject || task.topic}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {task.duration_minutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Productivity Tip Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-indigo-500/20 shadow-sm dark:shadow-xl dark:shadow-indigo-500/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Spaced Repetition Tip
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete your daily tasks in focused 30-45 minute blocks. Spaced practice improves long-term recall by up to 200% compared to last-minute cramming.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────── Delete Confirmation Dialog ──────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#0B0F19] max-w-sm w-full p-6 rounded-3xl border border-slate-200 dark:border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete this study plan?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This action cannot be undone. Associated tasks and history will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeletePlan(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />
    </div>
  );
};
