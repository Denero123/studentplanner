import React, { useState } from 'react';
import { SITE_CONFIG } from '../../config/site';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  Database, 
  Layers, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Brain,
  Star,
  Flame,
  Award
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Mock interactive state for hero dashboard preview
  const [heroTaskState, setHeroTaskState] = useState([
    { id: 1, text: 'Review Dynamic Programming memoization patterns', duration: '60 min', tag: 'Learning', completed: true },
    { id: 2, text: 'Solve 3 graph traversal practice questions (DFS/BFS)', duration: '45 min', tag: 'Practice', completed: true },
    { id: 3, text: 'Spaced repetition flashcards: time complexity formulas', duration: '30 min', tag: 'Revision', completed: false },
    { id: 4, text: 'Summary mind-map for Heap & Binary Search Trees', duration: '45 min', tag: 'Revision', completed: false },
  ]);

  const completedHeroTasks = heroTaskState.filter(t => t.completed).length;
  const heroProgress = Math.round((completedHeroTasks / heroTaskState.length) * 100);

  const toggleHeroTask = (id: number) => {
    setHeroTaskState(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const faqs = [
    {
      q: 'How does StudyFlow AI calculate a realistic study schedule?',
      a: 'Unlike naive tools that simply divide topics evenly, StudyFlow AI assesses the number of topics, your current proficiency, available study days, and daily hour limits. It paces foundational concepts first, allocates dedicated revision blocks, and inserts practice sessions ahead of your target deadline.',
    },
    {
      q: 'What happens if my deadline is too tight?',
      a: 'StudyFlow AI will honestly prioritize the highest-impact topics and flag the heavy daily workload, rather than generating an unrealistic schedule that leads to student burnout.',
    },
    {
      q: 'Is my study plan and progress saved securely in the cloud?',
      a: 'Yes. All study plans, topics, and completion states are stored with PostgreSQL schemas and protected by strict Row-Level Security (RLS) policies. Only you can view or modify your data.',
    },
    {
      q: 'Can I check off tasks daily and watch my progress update?',
      a: 'Absolutely! StudyFlow AI is designed as a daily companion. As you check off completed learning and revision tasks, your completion percentage and progress rings animate dynamically in real time.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-36 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://i.ibb.co/8ndjryhv/Screenshot-2026-09-28-070103.png')` }}>
        {/* Dark backdrop overlay for text contrast */}
        <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Academic Pacing Engine</span>
              <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
              <span className="text-slate-300 font-normal">Real-Time Progress Tracking</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              {SITE_CONFIG.heroHeadline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {SITE_CONFIG.heroSubheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => navigate('/study-plans/new')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group focus:outline-none"
              >
                <span>Create My Study Plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 font-semibold text-base border border-slate-700 shadow-sm transition-all focus:outline-none"
              >
                See How It Works
              </button>
            </div>

            {/* Social proof chips */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero guesswork scheduling
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Personalized topic pacing
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Dynamic progress feedback
              </span>
            </div>
          </div>

          {/* ──────────────── Visually Convincing Live Product Preview ──────────────── */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-[#111827]/80 p-2 sm:p-3 shadow-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-300">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#0B0F19] rounded-t-xl mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="px-4 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                  <span>app.studyflow.ai/dashboard</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Demo
                </div>
              </div>

              {/* Product UI Simulation */}
              <div className="bg-[#111827] rounded-xl p-5 sm:p-7 border border-slate-800 shadow-inner">
                {/* Header inside preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Computer Science · Exam Prep
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                        Active Plan
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Target: Oct 15 (19 days remaining)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        2.0 hrs / day
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Overall Pacing</span>
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {heroProgress}% Done
                      </span>
                    </div>
                    {/* Radial progress ring mini */}
                    <div className="w-12 h-12 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100 dark:text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-indigo-600 dark:text-indigo-400 transition-all duration-500 ease-out"
                          strokeDasharray={`${heroProgress}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <CheckCircle2 className="w-4 h-4 absolute text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Interactive checklist block */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Today's Scheduled Tasks (Click to test completion!)
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {completedHeroTasks} of {heroTaskState.length} finished
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {heroTaskState.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleHeroTask(task.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                          task.completed
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-500'
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-medium transition-all ${
                                task.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {task.text}
                            </p>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {task.duration}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            task.tag === 'Learning'
                              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : task.tag === 'Practice'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {task.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── How It Works (3 Steps) ──────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Methodology
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From academic overwhelm to structured execution in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20 font-mono mb-4">
                01
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Tell Us Your Goals
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your subject, key topics, exam deadline, and available daily hours. Select which days you can study and your current proficiency level.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20 font-mono mb-4">
                02
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                AI Builds Your Plan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI considers topic difficulty, spacing intervals, and pre-deadline mock exams. It outputs an honest, balanced schedule with specific study tasks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/20 font-mono mb-4">
                03
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Track Your Progress
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Check off tasks as you finish them each day. Watch your completion percentage climb and stay on track until you ace your exams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Features Section ──────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for academic success, not just task checklists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                AI Study Planning
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates realistic schedules based on topic complexity, cognitive fatigue limits, and student study styles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Smart Scheduling
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Only schedules study sessions on days you have earmarked. Balances learning new concepts with mandatory revision windows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Goal Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep sight of upcoming exam deadlines with countdown badges, daily task quotas, and overdue indicators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Task Completion
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                One-tap task toggles with immediate database synchronization and optimistic UI responsiveness.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamically computed completion ratios and animated progress bars provide positive reinforcement as you work.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Cloud-Saved Study Plans
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Safely persisted in PostgreSQL with strict Row Level Security. Accessible anytime from your phone, tablet, or desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FAQ Section ──────────────── */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Questions & Answers
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-base focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── Final CTA ──────────────── */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to turn your academic goals into structured progress?
          </h2>
          <p className="text-base sm:text-lg text-indigo-200 max-w-xl mx-auto">
            Build your personalized, AI-calculated study plan in under 60 seconds and start tracking today.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/study-plans/new')}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-base shadow-xl shadow-indigo-950/50 hover:scale-105 active:scale-100 transition-all inline-flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 text-indigo-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
