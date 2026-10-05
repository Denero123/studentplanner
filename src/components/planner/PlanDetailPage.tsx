import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StudyPlan, StudyTask } from '../../types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Printer, 
  Filter, 
  Check, 
  AlertCircle, 
  RefreshCw,
  BookOpen,
  Share2,
  Sparkles,
  Layers,
  ChevronDown,
  Download,
  FileText,
  WifiOff
} from 'lucide-react';

interface PlanDetailPageProps {
  planId: string;
  navigate: (path: string) => void;
}

export const PlanDetailPage: React.FC<PlanDetailPageProps> = ({ planId, navigate }) => {
  const { success, error: toastError } = useToast();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'today'>('all');

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPlanById(planId);
      if (res.data) {
        setPlan(res.data);
        setTasks(res.data.tasks || []);
      }
    } catch (err: any) {
      console.error('Failed to load plan:', err);
      toastError(err.message || 'Could not find study plan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [planId]);

  // Toggle task completion
  const handleToggleTask = async (task: StudyTask) => {
    const prevStatus = task.completed;
    const nextStatus = !prevStatus;

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? { ...t, completed: nextStatus, completed_at: nextStatus ? new Date().toISOString() : null }
          : t
      )
    );

    // Update parent plan stats dynamically
    setPlan(prev => {
      if (!prev) return null;
      const comp = (prev.completed_tasks || 0) + (nextStatus ? 1 : -1);
      const total = prev.total_tasks || 1;
      return {
        ...prev,
        completed_tasks: Math.max(0, comp),
        progress_percentage: Math.round((Math.max(0, comp) / total) * 100),
      };
    });

    try {
      await api.toggleTask(task.id, nextStatus);
      if (nextStatus) {
        success('Task completed! Keep the momentum.');
      }
    } catch (err: any) {
      // Revert on error
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, completed: prevStatus } : t))
      );
      toastError('Failed to update task.');
    }
  };

  // Delete plan
  const handleDeletePlan = async () => {
    setIsDeleting(true);
    try {
      await api.deletePlan(planId);
      success('Study plan deleted.');
      navigate('/dashboard');
    } catch (err: any) {
      toastError('Failed to delete plan.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Export PDF / Offline Copy
  const handleDownloadPdf = () => {
    success('📄 Preparing formatted PDF document for printing and offline access...');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  // .ics calendar file export for individual session or all sessions
  const handleDownloadSingleIcs = (task: StudyTask) => {
    const startDate = task.date ? task.date.replace(/-/g, '') + 'T090000Z' : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = task.date ? task.date.replace(/-/g, '') + 'T100000Z' : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Study Session Calendar//EN',
      'BEGIN:VEVENT',
      `UID:study-session-${task.id || Math.random()}@studyflow.ai`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${task.topic}: ${task.task}`,
      `DESCRIPTION:Study Session for ${plan?.subject || 'Study Plan'}\\nDuration: ${task.duration_minutes} minutes\\nType: ${task.task_type}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `study-session-${task.date || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Calendar event (.ics) downloaded! Ready for Apple Calendar, Outlook, or Google Calendar.');
  };

  const handleDownloadAllIcs = () => {
    const events = tasks.map((task, idx) => {
      const startDate = task.date ? task.date.replace(/-/g, '') + 'T090000Z' : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = task.date ? task.date.replace(/-/g, '') + 'T100000Z' : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return [
        'BEGIN:VEVENT',
        `UID:study-session-${task.id || idx}@studyflow.ai`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${task.topic}: ${task.task}`,
        `DESCRIPTION:Study Session for ${plan?.subject || 'Study Plan'}\\nDuration: ${task.duration_minutes} minutes`,
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Complete Study Plan Calendar//EN',
      events,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(plan?.title || 'study-plan').toLowerCase().replace(/\s+/g, '-')}-schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Complete schedule (.ics) downloaded for Apple Calendar, Outlook & Google Calendar!');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your study plan...</p>
      </div>
    );
  }

  // Friendly not found state if plan does not exist
  if (!plan) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Study Plan Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This plan may have been deleted, or you might not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    if (taskFilter === 'today') return t.date === todayStr;
    return true;
  });

  // Group tasks by date
  const groupedTasks: Record<string, StudyTask[]> = {};
  filteredTasks.forEach(task => {
    if (!groupedTasks[task.date]) {
      groupedTasks[task.date] = [];
    }
    groupedTasks[task.date].push(task);
  });

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => a.localeCompare(b));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Nav & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/60 flex items-center gap-1.5 shadow-sm"
            title="Download formatted PDF or print for offline access"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={handleDownloadAllIcs}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 shadow-sm"
            title="Download complete schedule as .ics file for calendar sync"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export All (.ics)</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
            title="Print schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Schedule</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1.5"
            title="Delete this study plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Plan</span>
          </button>
        </div>
      </div>

      {/* ──────────────── Main Header Card ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md">
                {plan.subject}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Created {new Date(plan.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {plan.title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {plan.summary || 'Structured daily task schedule designed for mastery.'}
            </p>

            {/* Topics chips */}
            {plan.topics && plan.topics.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {plan.topics.map(topic => (
                  <span
                    key={topic.id}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Radial progress ring display */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 dark:text-indigo-400 transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-xs font-bold text-slate-900 dark:text-white absolute">
                {progressPct}%
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                Progress
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {completedTasks} / {totalTasks} Tasks
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {totalTasks - completedTasks} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Pacing Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Target Deadline</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {plan.deadline}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Daily Study Target</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              {plan.daily_hours} hrs / day
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Difficulty Level</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize mt-0.5 block">
              {plan.difficulty}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Total Study Days</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              {sortedDates.length} Days Planned
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────── Tasks Section with Filters ──────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Structured Tasks Schedule</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'today', label: 'Due Today' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTaskFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  taskFilter === f.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              No tasks found for this filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(dateStr => {
              const dayTasks = groupedTasks[dateStr];
              const dateObj = new Date(dateStr + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Date banner */}
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formattedDate}
                      </span>
                      {isToday && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {dayTasks.filter(t => t.completed).length} of {dayTasks.length} done
                    </span>
                  </div>

                  {/* Task list for this day */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task)}
                        className={`p-4 sm:px-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer transition-all group ${
                          task.completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          {/* Checkbox */}
                          <div
                            className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              task.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-500'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium transition-all ${
                                task.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {task.task}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {task.topic}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.duration_minutes} minutes
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badges & Calendar Sync */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSingleIcs(task);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
                            title="Add to Calendar (.ics)"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              task.task_type === 'learning'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : task.task_type === 'practice'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {task.task_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────── Delete Confirmation Dialog ──────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete this study plan?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This action cannot be undone. All tasks, topics, and completed progress will be permanently erased.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeletePlan}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
