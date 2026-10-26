import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateAcademicRoadmap } from '../../services/aiService';
import { 
  Sparkles, 
  Compass, 
  Briefcase, 
  Code, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Target, 
  RefreshCcw,
  CheckSquare,
  FileText
} from 'lucide-react';

interface RoadmapTask {
  id: string;
  title: string;
  duration: string;
  badge: 'Action Item' | 'Review Check' | 'Submit' | 'Learning';
  resourceText?: string;
  completed: boolean;
}

interface RoadmapPhase {
  phase_number: number;
  title: string;
  timeline: string;
  description: string;
  tasks: RoadmapTask[];
}

interface RoadmapResponse {
  goal_title: string;
  goal_type: 'Submit Work' | 'Build Project' | 'Learn a Skill';
  total_timeline: string;
  summary: string;
  phases: RoadmapPhase[];
}

interface RoadmapPlannerPageProps {
  navigate: (path: string) => void;
}

export const RoadmapPlannerPage: React.FC<RoadmapPlannerPageProps> = ({ navigate }) => {
  const { success, error: toastError } = useToast();

  const [goalType, setGoalType] = useState<'Submit Work' | 'Build Project' | 'Learn a Skill'>('Build Project');
  const [goalText, setGoalText] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Intermediate / Student');
  const [timeAvailable, setTimeAvailable] = useState('1 Week (Sprint)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  // Default initial roadmap preview
  const [roadmap, setRoadmap] = useState<RoadmapResponse>({
    goal_title: 'Full-Stack React Portfolio Website & IoT Dashboard',
    goal_type: 'Build Project',
    total_timeline: '1 Week (Sprint)',
    summary: 'A structured execution roadmap tailored to deliver a production-ready web application with modular components and responsive Tailwind UI.',
    phases: [
      {
        phase_number: 1,
        title: 'Days 1-2: Architecture & Foundation',
        timeline: 'Days 1-2',
        description: 'Establish repository, configure Tailwind CSS styling, and set up project scaffolding.',
        tasks: [
          { id: 't1', title: 'Initialize Vite + React + TypeScript repository', duration: '4 hrs', badge: 'Action Item', resourceText: 'Vite Docs', completed: true },
          { id: 't2', title: 'Design color hierarchy & glassmorphic component tokens', duration: '6 hrs', badge: 'Review Check', resourceText: 'Tailwind Config', completed: false }
        ]
      },
      {
        phase_number: 2,
        title: 'Days 3-5: Core Execution & Features',
        timeline: 'Days 3-5',
        description: 'Implement core views, interactive components, and state management.',
        tasks: [
          { id: 't3', title: 'Build main dashboard and navigation components', duration: '8 hrs', badge: 'Action Item', resourceText: 'React Docs', completed: false },
          { id: 't4', title: 'Integrate AI roadmap generator form and response parser', duration: '7 hrs', badge: 'Action Item', resourceText: 'Gemini SDK', completed: false }
        ]
      },
      {
        phase_number: 3,
        title: 'Days 6-7: Testing & Final Polish',
        timeline: 'Days 6-7',
        description: 'Perform end-to-end testing, debug issues, and prepare final submission.',
        tasks: [
          { id: 't5', title: 'Run TypeScript compiler checks and fix any warnings', duration: '3 hrs', badge: 'Review Check', completed: false },
          { id: 't6', title: 'Final deployment check and submission handoff', duration: '2 hrs', badge: 'Submit', completed: false }
        ]
      }
    ]
  });

  const getPlaceholder = () => {
    switch (goalType) {
      case 'Submit Work':
        return "e.g., Grade 12 History Paper submission, Biology lab report";
      case 'Build Project':
        return "e.g., React portfolio website, Mobile IoT prototype, Capstone web app";
      case 'Learn a Skill':
        return "e.g., UI/UX design, Figma basics, Data Analytics with Python";
    }
  };

  const handleToggleTask = (phaseIdx: number, taskId: string) => {
    setRoadmap(prev => {
      const updatedPhases = [...prev.phases];
      updatedPhases[phaseIdx] = {
        ...updatedPhases[phaseIdx],
        tasks: updatedPhases[phaseIdx].tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      };
      return { ...prev, phases: updatedPhases };
    });
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) {
      toastError('Please enter your target goal.');
      return;
    }

    setIsGenerating(true);

    try {
      const generated = await generateAcademicRoadmap(goalText, goalType, currentLevel, timeAvailable);
      if (generated && generated.phases) {
        setRoadmap(generated);
        success('🗺️ AI Roadmap generated successfully!');
      }
    } catch (err) {
      console.error('Roadmap generation error:', err);
      toastError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalTasks = roadmap.phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0);
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Execution Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>🗺️ AI Roadmap & Project Planner</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Need a game plan? Tell AI your goal (e.g., 'Learn Python', 'Finish Capstone Project', 'Learn UI/UX') and timeline.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0F1626] border border-white/[0.08] px-4 py-3 rounded-2xl">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Roadmap Progress</span>
              <span className="text-lg font-bold text-teal-400">{progressPct}% Complete</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
              {completedTasks}/{totalTasks}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Input Card (The Configuration Engine) */}
          <div className="lg:col-span-5 bg-[#0F1626]/80 backdrop-blur-md rounded-3xl border border-white/[0.08] p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-teal-500/20">
                <Target className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Configuration Engine</h2>
                <p className="text-xs text-slate-400">Configure parameters for AI calculation</p>
              </div>
            </div>

            <form onSubmit={handleGenerateRoadmap} className="space-y-6">
              
              {/* 1. Goal Type Selection Toggles */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Goal Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType('Submit Work')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                      goalType === 'Submit Work'
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/20'
                        : 'bg-[#131C31] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span>Submit Work</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalType('Build Project')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                      goalType === 'Build Project'
                        ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-500/20'
                        : 'bg-[#131C31] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <Code className="w-4 h-4 text-teal-400" />
                    <span>Build Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalType('Learn a Skill')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                      goalType === 'Learn a Skill'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : 'bg-[#131C31] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Learn a Skill</span>
                  </button>
                </div>
              </div>

              {/* 2. Core Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    What is your target goal? *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={goalText}
                    onChange={e => setGoalText(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full p-3.5 rounded-xl border border-white/10 bg-[#131C31] text-white text-sm focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Current Level / Starting Point
                  </label>
                  <input
                    type="text"
                    value={currentLevel}
                    onChange={e => setCurrentLevel(e.target.value)}
                    placeholder="e.g., Absolute beginner, have draft, intermediate"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#131C31] text-white text-sm focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Time Available / Deadline
                  </label>
                  <select
                    value={timeAvailable}
                    onChange={e => setTimeAvailable(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#131C31] text-white text-sm focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
                  >
                    <option value="3 Days (Crash course / Rush deadline)">3 Days (Crash course / Rush deadline)</option>
                    <option value="1 Week (Sprint)">1 Week (Sprint)</option>
                    <option value="3 Weeks (Standard Study / Build)">3 Weeks (Standard Study / Build)</option>
                    <option value="3 Months (Comprehensive Master)">3 Months (Comprehensive Master)</option>
                  </select>
                </div>
              </div>

              {/* 3. Action Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 hover:opacity-95 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Generating AI Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Roadmap / Sprint Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Milestones Card (Interactive Results Grid) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Roadmap Header Summary Card */}
            <div className="bg-[#0F1626]/80 backdrop-blur-md rounded-3xl border border-white/[0.08] p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    {roadmap.goal_type} Plan
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    {roadmap.goal_title || 'Untitled Goal'}
                  </h2>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{roadmap.total_timeline}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-[#131C31] p-4 rounded-2xl border border-white/5">
                {roadmap.summary}
              </p>
            </div>

            {/* Phases / Milestone Accordions */}
            <div className="space-y-4">
              {roadmap.phases.map((phase, pIdx) => {
                const isExpanded = expandedPhase === pIdx;
                const phaseCompleted = phase.tasks.filter(t => t.completed).length;
                const phaseTotal = phase.tasks.length;

                return (
                  <div
                    key={pIdx}
                    className="bg-[#0F1626]/80 backdrop-blur-md rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl transition-all"
                  >
                    {/* Phase Header */}
                    <button
                      onClick={() => setExpandedPhase(isExpanded ? -1 : pIdx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                          0{phase.phase_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{phase.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-[#131C31] border border-white/10 text-slate-300 font-mono">
                              {phase.timeline}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{phase.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-slate-400">
                          {phaseCompleted}/{phaseTotal}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Phase Tasks Checklist */}
                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-white/[0.08] space-y-3 bg-[#0B0F17]/50">
                        {phase.tasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(pIdx, task.id)}
                            className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                              task.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400'
                                : 'bg-[#131C31] border-white/[0.08] hover:border-teal-500/40 hover:bg-[#162035]'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                  task.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                                    : 'border-slate-700 group-hover:border-teal-400'
                                }`}
                              >
                                {task.completed && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-medium transition-all ${
                                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.duration}
                                  </span>
                                  {task.resourceText && (
                                    <span className="flex items-center gap-1 text-teal-400 font-medium">
                                      <ExternalLink className="w-3 h-3" />
                                      {task.resourceText}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                                task.badge === 'Submit'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : task.badge === 'Review Check'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                              }`}
                            >
                              {task.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
