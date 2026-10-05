import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Sparkles, Upload, FileText, CheckCircle2, Circle, 
  Share2, Download, ExternalLink, RefreshCw, AlertCircle, Sunset, Sun, Moon, Zap, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface RoutineItem {
  id: string;
  time_slot: string;
  period: string;
  category: 'Lecture' | 'Study Session' | 'Break' | 'Pre-Sleep';
  activity: string;
  is_class_time: boolean;
  completed: boolean;
}

interface RoutineData {
  id: string;
  title: string;
  date: string;
  wake_up_time: string;
  bedtime: string;
  study_style: string;
  items: RoutineItem[];
}

interface RoutinePageProps {
  navigate: (path: string) => void;
}

export const RoutinePage: React.FC<RoutinePageProps> = ({ navigate }) => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [routine, setRoutine] = useState<RoutineData | null>(null);

  // Form states
  const [wakeUpTime, setWakeUpTime] = useState<string>('06:30 AM');
  const [bedtime, setBedtime] = useState<string>('10:30 PM');
  const [priorityTopics, setPriorityTopics] = useState<string>('Advanced Mathematics, Algorithms, Data Structures');
  const [studyStyle, setStudyStyle] = useState<string>('morning');
  const [timetableText, setTimetableText] = useState<string>('');
  const [timetableImage, setTimetableImage] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'generator'>('schedule');

  // Fetch latest routine on mount
  useEffect(() => {
    fetchLatestRoutine();
  }, [token]);

  const fetchLatestRoutine = async () => {
    if (!token) {
      setFetching(false);
      return;
    }
    try {
      const res = await fetch('/api/routine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRoutine(data.data);
        setActiveTab('schedule');
      } else {
        setActiveTab('generator');
      }
    } catch (err) {
      console.error('Failed to fetch routine:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setTimetableImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toastError('Please sign in to generate and save your routine.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          wakeUpTime,
          bedtime,
          priorityTopics,
          studyStyle,
          timetableText,
          timetableImage
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setRoutine(data.data);
        setActiveTab('schedule');
        success('Autonomous daily routine generated successfully!');
      } else {
        toastError(data.error || 'Failed to generate routine');
      }
    } catch (err: any) {
      toastError(err.message || 'Network error while generating routine');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCompletion = async (itemId: string, currentStatus: boolean) => {
    if (!routine || !token) return;

    // Optimistic UI update
    const updatedItems = routine.items.map(item => 
      item.id === itemId ? { ...item, completed: !currentStatus } : item
    );
    setRoutine({ ...routine, items: updatedItems });

    try {
      await fetch('/api/routine/item', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, completed: !currentStatus })
      });
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  // Calculate completion percentage
  const completedCount = routine?.items?.filter(i => i.completed).length || 0;
  const totalCount = routine?.items?.length || 1;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  // Calendar URL builder for Google Calendar
  const getGoogleCalendarUrl = (item: RoutineItem) => {
    const title = encodeURIComponent(`[StudyFlow] ${item.category}: ${item.activity}`);
    const details = encodeURIComponent(`Daily Routine Period: ${item.period}\nCategory: ${item.category}\nActivity: ${item.activity}`);
    const todayStr = new Date().toISOString().split('-').join('');
    const dates = `${todayStr}T090000Z/${todayStr}T100000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  // ICS file generator for Apple / Outlook Calendar
  const downloadIcsFile = (item: RoutineItem) => {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Daily Routine Scheduler//EN',
      'BEGIN:VEVENT',
      `UID:${item.id}@studyflow.ai`,
      `DTSTAMP:${dateStr}`,
      `DTSTART:${dateStr}`,
      `SUMMARY:${item.category}: ${item.activity}`,
      `DESCRIPTION:StudyFlow Autonomous Routine - ${item.period}\\nActivity: ${item.activity}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `studyflow-routine-${item.category.toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('iCalendar (.ics) event downloaded!');
  };

  const shareToWhatsApp = () => {
    if (!routine) return;
    const summaryText = `*${routine.title}*\nWake up: ${routine.wake_up_time} | Bedtime: ${routine.bedtime}\nCompleted: ${completedCount}/${totalCount} (${progressPercentage}%)\n\nToday's Schedule:\n` +
      routine.items.map(i => `- [${i.completed ? 'X' : ' '}] *${i.time_slot}* (${i.category}): ${i.activity}`).join('\n');
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading your daily routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Smart Timetable & Daily Routine Scheduler
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-powered gap filler, lecture integration, and pre-sleep wind-down planner.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Today's Agenda
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Upload / Generate
            </button>
          </div>
        </div>

        {/* Tab 1: Schedule / Agenda View */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {routine ? (
              <>
                {/* Summary Banner & Progress */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                        <Zap className="w-3.5 h-3.5" /> Autonomous Routine Active
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black">{routine.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200 pt-1">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> Wake: {routine.wake_up_time}</span>
                        <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-400" /> Bedtime: {routine.bedtime}</span>
                        <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> Style: {routine.study_style.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-2 min-w-[220px]">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Daily Completion</span>
                        <span className="font-bold text-indigo-300">{completedCount} / {totalCount} ({progressPercentage}%)</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={shareToWhatsApp}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all shadow-md"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share to WhatsApp
                        </button>
                        <button
                          onClick={() => setActiveTab('generator')}
                          className="text-[11px] text-indigo-300 hover:underline font-semibold"
                        >
                          Regenerate Routine
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chronological Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Today's Chronological Agenda</h3>
                  
                  <div className="space-y-3">
                    {routine.items.map((item, index) => {
                      let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                      let icon = <Clock className="w-4 h-4" />;
                      if (item.category === 'Lecture') {
                        badgeColor = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                        icon = <FileText className="w-4 h-4 text-blue-500" />;
                      } else if (item.category === 'Study Session') {
                        badgeColor = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                        icon = <Sparkles className="w-4 h-4 text-indigo-500" />;
                      } else if (item.category === 'Pre-Sleep') {
                        badgeColor = 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                        icon = <Moon className="w-4 h-4 text-purple-500" />;
                      } else if (item.category === 'Break') {
                        badgeColor = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                        icon = <Sun className="w-4 h-4 text-emerald-500" />;
                      }

                      return (
                        <div 
                          key={item.id || index}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            item.completed 
                              ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleItemCompletion(item.id, item.completed)}
                              className="mt-1 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badgeColor}`}>
                                  {icon} {item.category}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {item.time_slot}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">({item.period})</span>
                              </div>
                              <p className={`text-sm sm:text-base font-semibold ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                {item.activity}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 w-full md:w-auto justify-end">
                            <a
                              href={getGoogleCalendarUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                              title="Add to Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-600" /> G-Cal <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                            <button
                              onClick={() => downloadIcsFile(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                              title="Download .ics event file"
                            >
                              <Download className="w-3.5 h-3.5 text-indigo-600" /> .ics
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Daily Routine Generated Yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Upload your class timetable or paste your syllabus to let our AI build an autonomous daily schedule filled with study blocks and pre-sleep wind-down.
                </p>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Create Routine Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Timetable Upload & Generator Form */}
        {activeTab === 'generator' && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure Your Autonomous Routine</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your timetable image/PDF or paste your schedule details below.
              </p>
            </div>

            <form onSubmit={handleGenerateRoutine} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Class Timetable (Image or PDF)
                  </label>
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-950/50 transition-all">
                    <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {imageFileName || 'Click to upload timetable'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, PDF up to 10MB</span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Or Paste Timetable / Syllabus Text
                  </label>
                  <textarea
                    rows={4}
                    value={timetableText}
                    onChange={(e) => setTimetableText(e.target.value)}
                    placeholder="e.g. Monday: Math 9am-11am, Physics 2pm-4pm. Tuesday: CS Lab 10am-1pm..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Wake-up Time</label>
                  <input
                    type="text"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    placeholder="06:30 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Bedtime</label>
                  <input
                    type="text"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    placeholder="10:30 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Upcoming Priority Exams / Topics</label>
                  <input
                    type="text"
                    value={priorityTopics}
                    onChange={(e) => setPriorityTopics(e.target.value)}
                    placeholder="e.g. Calculus Midterm, Database Final"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Study Style Preference</label>
                  <select
                    value={studyStyle}
                    onChange={(e) => setStudyStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="morning">Morning Lark (High focus early)</option>
                    <option value="afternoon">Afternoon Power (Peak midday)</option>
                    <option value="night_owl">Night Owl (Late evening focus)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {routine && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating AI Schedule...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Autonomous Routine
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
