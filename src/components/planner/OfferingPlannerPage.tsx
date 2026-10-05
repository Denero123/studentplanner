import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, Calendar, Clock, ArrowLeft, CheckCircle2, Circle, 
  Share2, Download, ExternalLink, RefreshCw, Briefcase, Users, Target, Check, Layers
} from 'lucide-react';

interface OfferingPlannerPageProps {
  navigate: (path: string) => void;
}

interface OfferingTask {
  date: string;
  phase: string;
  action: string;
  duration_minutes: number;
  priority: 'high' | 'medium' | 'low';
}

interface OfferingPlanResult {
  offering_title: string;
  category: string;
  target_audience: string;
  strategy_summary: string;
  milestones: string[];
  tasks: OfferingTask[];
}

export const OfferingPlannerPage: React.FC<OfferingPlannerPageProps> = ({ navigate }) => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [offeringDescription, setOfferingDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('University Students & Professionals');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [pricingModel, setPricingModel] = useState('Hourly / Session Based');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<OfferingPlanResult | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeringDescription.trim()) {
      toastError('Please describe what you are offering.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-offering-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          offeringDescription,
          targetAudience,
          durationWeeks,
          hoursPerWeek,
          pricingModel
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPlanResult(data.data);
        setCompletedTasks({});
        success('AI Offering & Scheduling Strategy generated successfully!');
      } else {
        toastError(data.error || 'Failed to generate offering plan.');
      }
    } catch (err: any) {
      toastError(err.message || 'Network error while generating offering plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalCount = planResult?.tasks?.length || 1;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const getGoogleCalendarUrl = (task: OfferingTask) => {
    const title = encodeURIComponent(`[Offering Delivery] ${task.phase}: ${task.action}`);
    const details = encodeURIComponent(`Offering: ${planResult?.offering_title}\nPhase: ${task.phase}\nAction: ${task.action}`);
    const dateStr = task.date.split('-').join('');
    const dates = `${dateStr}T100000Z/${dateStr}T110000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  const downloadIcs = (task: OfferingTask, index: number) => {
    const dateStr = task.date.replace(/-/g, '') + 'T100000Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Offering Scheduler//EN',
      'BEGIN:VEVENT',
      `UID:offering-${index}@studyflow.ai`,
      `DTSTAMP:${dateStr}`,
      `DTSTART:${dateStr}`,
      `SUMMARY:${task.phase}: ${task.action}`,
      `DESCRIPTION:Offering Plan - ${planResult?.offering_title}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `offering-task-${index + 1}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Calendar event downloaded (.ics)!');
  };

  const shareWhatsApp = () => {
    if (!planResult) return;
    const text = `*Offering Strategy: ${planResult.offering_title}*\nTarget: ${planResult.target_audience}\n\nMilestones:\n` +
      planResult.milestones.map((m, i) => `${i + 1}. ${m}`).join('\n') +
      `\n\nGenerated with StudyFlow AI Planning Assistant`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-indigo-400" />
            <span>AI Offering & Planning Assistant</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tell us what you are offering (services, courses, consultations, inspections), and Gemini will generate a custom delivery plan, milestones, and scheduling calendar.
          </p>
        </div>
      </div>

      {!planResult ? (
        <div className="bg-[#111827]/80 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                What are you offering? (Describe your service, course, consultation, or product)
              </label>
              <textarea
                rows={4}
                value={offeringDescription}
                onChange={(e) => setOfferingDescription(e.target.value)}
                placeholder="e.g., 1-on-1 Advanced Mathematics tutoring for high school seniors preparing for finals, or residential property inspection services for first-time home buyers..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Audience / Clients
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., University Students, Home Buyers, Startup Founders"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pricing / Delivery Model
                </label>
                <select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Hourly / Session Based">Hourly / Session Based</option>
                  <option value="Fixed-Scope Package">Fixed-Scope Package</option>
                  <option value="Subscription / Monthly Retainer">Subscription / Monthly Retainer</option>
                  <option value="Free Consultation / Lead Magnet">Free Consultation / Lead Magnet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Program / Delivery Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dedicated Hours per Week
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" /> Generating AI Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950" /> Generate Offering Plan & Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Summary Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111827]/90 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> {planResult.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{planResult.offering_title}</h2>
                <p className="text-xs text-slate-400">Target Audience: <span className="text-white font-semibold">{planResult.target_audience}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-4 h-4" /> Share on WhatsApp
                </button>
                <button
                  onClick={() => setPlanResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  New Offering
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {planResult.strategy_summary}
            </p>

            {/* Milestones */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Delivery Milestones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {planResult.milestones.map((milestone, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{idx + 1}</span>
                    <span>{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Tasks Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Actionable Delivery & Scheduling Checklist</h3>
              <span className="text-xs font-semibold text-slate-400">{completedCount} / {totalCount} Completed ({progressPercentage}%)</span>
            </div>

            <div className="space-y-3">
              {planResult.tasks.map((task, idx) => {
                const isDone = completedTasks[idx];
                return (
                  <div 
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone 
                        ? 'bg-slate-900/40 border-slate-800 opacity-75' 
                        : 'bg-[#111827]/80 border-slate-800 hover:border-indigo-500/40 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTask(idx)}
                        className="mt-1 text-indigo-400 hover:scale-110 transition-transform"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            {task.phase}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                            {task.date}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {task.duration_minutes} mins
                          </span>
                        </div>
                        <p className={`text-sm font-semibold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.action}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={getGoogleCalendarUrl(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-400" /> G-Cal <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                      <button
                        onClick={() => downloadIcs(task, idx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" /> .ics
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
