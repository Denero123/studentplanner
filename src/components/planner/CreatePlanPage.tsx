import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { PlanGenerationResponse, KnowledgeLevel, StudyFocus } from '../../types';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen, 
  Plus, 
  X, 
  Check, 
  ArrowRight, 
  Brain, 
  Layers, 
  CheckCircle2, 
  Save, 
  RotateCcw,
  ArrowLeft,
  Info,
  Flame,
  AlertCircle,
  Mic
} from 'lucide-react';

interface CreatePlanPageProps {
  navigate: (path: string) => void;
}

const PRESET_TOPICS: Record<string, string[]> = {
  'Computer Science': ['Algorithms & Data Structures', 'Dynamic Programming', 'Graph Theory', 'System Design', 'Database Normalization'],
  'Mathematics': ['Linear Algebra', 'Multivariate Calculus', 'Differential Equations', 'Probability & Statistics'],
  'Biology': ['Cellular Respiration', 'Genetics & DNA Replication', 'Immunology', 'Neurobiology'],
  'Economics': ['Microeconomic Supply & Demand', 'Macroeconomic Fiscal Policy', 'Game Theory', 'Monetary Policy & Inflation'],
};

const DAYS_OF_WEEK = [
  { id: 'Mon', label: 'Mon' },
  { id: 'Tue', label: 'Tue' },
  { id: 'Wed', label: 'Wed' },
  { id: 'Thu', label: 'Thu' },
  { id: 'Fri', label: 'Fri' },
  { id: 'Sat', label: 'Sat' },
  { id: 'Sun', label: 'Sun' },
];

const TIME_PRESETS = [
  { value: 0.5, label: '30 min' },
  { value: 1.0, label: '1 hour' },
  { value: 1.5, label: '1.5 hrs' },
  { value: 2.0, label: '2 hours' },
  { value: 3.0, label: '3 hours' },
  { value: 4.0, label: '4+ hours' },
];

export const CreatePlanPage: React.FC<CreatePlanPageProps> = ({ navigate }) => {
  const { success, error: toastError } = useToast();

  // Form State
  const [subject, setSubject] = useState('');
  const [currentTopicInput, setCurrentTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(1.5);
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>('intermediate');
  const [preferences, setPreferences] = useState<StudyFocus>('balanced');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Generation & Saving State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<PlanGenerationResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Voice-to-Text State & Handlers
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toastError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      success('🎙️ Listening... Speak your academic goals, subject, and topics.');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceTranscript(text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toastError('Voice recognition error or permission denied.');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceTranscript) {
        parseAndFillFromVoice(voiceTranscript);
      }
    };

    recognition.start();
  };

  const parseAndFillFromVoice = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.length > 2) {
      setSubject(text.slice(0, 40));
      setAdditionalNotes(`Voice input: "${text}"`);
      
      const possibleTopics = text.split(/,|\band\b/).map(s => s.trim()).filter(s => s.length > 2 && s.toLowerCase() !== 'subject' && s.toLowerCase() !== 'study');
      if (possibleTopics.length > 0) {
        setTopics(prev => Array.from(new Set([...prev, ...possibleTopics.slice(0, 5)])));
      }
      success('✨ Voice input successfully transcribed and pre-filled!');
    }
  };

  // Minimum allowed date is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Staged loading animation steps
  const generationSteps = [
    'Analyzing your topics & syllabus scope...',
    'Balancing your available study time & weekly days...',
    'Distributing cognitive load and revision milestones...',
    'Synthesizing actionable daily tasks with AI...',
    'Almost ready...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep(prev => (prev < generationSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Add topic tag
  const handleAddTopic = (topicName?: string) => {
    const toAdd = (topicName || currentTopicInput).trim();
    if (!toAdd) return;

    if (topics.some(t => t.toLowerCase() === toAdd.toLowerCase())) {
      toastError(`"${toAdd}" is already in your topic list.`);
      return;
    }

    setTopics(prev => [...prev, toAdd]);
    setCurrentTopicInput('');
    setFormErrors(prev => ({ ...prev, topics: '' }));
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setTopics(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleDay = (dayId: string) => {
    setAvailableDays(prev => {
      if (prev.includes(dayId)) {
        if (prev.length <= 1) {
          toastError('Please keep at least one available study day.');
          return prev;
        }
        return prev.filter(d => d !== dayId);
      }
      return [...prev, dayId];
    });
    setFormErrors(prev => ({ ...prev, availableDays: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!subject.trim()) {
      errors.subject = 'Subject name is required.';
    }

    if (topics.length === 0) {
      errors.topics = 'Please add at least one topic to study.';
    }

    if (!deadline) {
      errors.deadline = 'Please select a completion or exam deadline.';
    } else {
      const selected = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        errors.deadline = 'Deadline must be a future date.';
      }
    }

    if (dailyHours <= 0) {
      errors.dailyHours = 'Please specify valid daily study hours.';
    }

    if (availableDays.length === 0) {
      errors.availableDays = 'Select at least one study day per week.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate Plan Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedPlan(null);
    setSavedPlanId(null);

    try {
      const response = await api.generateAiPlan({
        subject: subject.trim(),
        topics,
        deadline,
        daily_hours: dailyHours,
        available_days: availableDays,
        knowledge_level: knowledgeLevel,
        preferences,
        additional_notes: additionalNotes.trim(),
      });

      if (response.data) {
        setGeneratedPlan(response.data);
        success('✨ Your personalized study plan has been generated!');
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong while generating your study plan. Please try again.';
      toastError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Plan to Database
  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    setIsSaving(true);
    try {
      const res = await api.createPlan({
        title: generatedPlan.plan_title,
        subject: generatedPlan.subject,
        deadline: generatedPlan.deadline,
        daily_hours: dailyHours,
        difficulty: knowledgeLevel,
        summary: generatedPlan.summary,
        topics,
        tasks: generatedPlan.tasks,
      });

      setSavedPlanId(res.data.id);
      success('Your study plan has been saved to your account!');
    } catch (err: any) {
      toastError(err.message || 'Failed to save study plan to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">New Study Plan</span>
      </div>

      {/* ──────────────── Form Section (if not generated yet) ──────────────── */}
      {!generatedPlan ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/60 to-cyan-50/40 dark:from-indigo-950/40 dark:to-cyan-950/20 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Create AI Study Plan
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Provide your subjects, deadlines, and study rhythm. Our AI calculates a realistic pacing blueprint.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="p-6 sm:p-8 space-y-7">
            {/* Voice-to-Text Quick Fill Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-purple-600 text-white shadow-md'}`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isListening ? 'Listening to your voice...' : 'Voice-to-Text Goal Dictation'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isListening ? 'Speak your subject, topics, and goals clearly now...' : 'Click to speak your study goals and have AI pre-fill this form.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isListening}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  isListening
                    ? 'bg-rose-600 text-white animate-bounce'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                }`}
              >
                <Mic className="w-4 h-4" />
                {isListening ? 'Listening...' : '🎙️ Speak Goal / Subject'}
              </button>
            </div>

            {/* 1. Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Subject or Course Name *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => {
                  setSubject(e.target.value);
                  setFormErrors(prev => ({ ...prev, subject: '' }));
                }}
                placeholder="e.g., Computer Science, Organic Chemistry, Macroeconomics, USMLE Step 1"
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all ${
                  formErrors.subject
                    ? 'border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900/50'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {formErrors.subject && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.subject}</p>
              )}
            </div>

            {/* 2. Topics Tag Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Topics or Syllabus Units * ({topics.length} added)
              </label>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(idx)}
                      className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                      aria-label="Remove topic"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add tag input row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTopicInput}
                  onChange={e => setCurrentTopicInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="Type a topic (e.g. Dynamic Programming) and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTopic()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {formErrors.topics && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.topics}</p>
              )}

              {/* Quick suggestions based on subject */}
              {PRESET_TOPICS[subject] && (
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 font-medium mr-2">Suggested topics:</span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {PRESET_TOPICS[subject].map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTopic(t)}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Deadline & Daily Hours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Target Deadline / Exam Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDateStr}
                    value={deadline}
                    onChange={e => {
                      setDeadline(e.target.value);
                      setFormErrors(prev => ({ ...prev, deadline: '' }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all ${
                      formErrors.deadline
                        ? 'border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900/50'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {formErrors.deadline && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.deadline}</p>
                )}
              </div>

              {/* Daily Hours Preset */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Available Daily Study Time *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDailyHours(preset.value)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        dailyHours === preset.value
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Available Study Days */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Available Study Days *
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = availableDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`w-12 h-11 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {formErrors.availableDays && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.availableDays}</p>
              )}
            </div>

            {/* 5. Current Knowledge Level */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Current Knowledge Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', title: 'Beginner', desc: 'Starting fresh, need fundamentals first' },
                  { id: 'intermediate', title: 'Intermediate', desc: 'Familiar with concepts, need practice' },
                  { id: 'advanced', title: 'Advanced', desc: 'Polishing high-difficulty nuances & mock tests' },
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setKnowledgeLevel(lvl.id as KnowledgeLevel)}
                    className={`p-3.5 text-left rounded-2xl border transition-all ${
                      knowledgeLevel === lvl.id
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 text-indigo-950 dark:text-indigo-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase">{lvl.title}</span>
                      {knowledgeLevel === lvl.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {lvl.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Strategic Preferences */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Study Strategy Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'more_practice', label: 'More Practice' },
                  { id: 'more_revision', label: 'More Revision' },
                  { id: 'difficult_topics', label: 'Focus Difficult' },
                ].map(pref => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setPreferences(pref.id as StudyFocus)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      preferences === pref.id
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-800 dark:text-cyan-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                <span>✨ Generate My Study Plan</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ──────────────── Generated Results View ──────────────── */
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                  {generatedPlan.subject}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {generatedPlan.plan_title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {generatedPlan.summary}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
                <span className="text-xs text-slate-400 font-medium">Target Deadline</span>
                <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {generatedPlan.deadline}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {generatedPlan.tasks.length} Structured Tasks
                </span>
              </div>
            </div>

            {/* Generated Tasks Timeline */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Paced Task Schedule ({generatedPlan.tasks.length} sessions)
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                {generatedPlan.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {task.date}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {task.topic}
                        </span>
                        <span>•</span>
                        <span>{task.duration_minutes} mins</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {task.task}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          task.task_type === 'learning'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : task.task_type === 'practice'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {task.task_type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          task.priority === 'high'
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950'
                            : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Save or Regenerate */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setGeneratedPlan(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Adjust Parameters</span>
              </button>

              {!savedPlanId ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSavePlan}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Study Plan to Database</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/study-plans/${savedPlanId}`)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>View Plan & Start Tasks</span>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Staged AI Loading Overlay ──────────────── */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Designing Your Schedule
              </h3>
              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold h-6 transition-all duration-300">
                {generationSteps[generationStep]}
              </p>
            </div>

            {/* Stepper dots */}
            <div className="flex justify-center gap-2 pt-2">
              {generationSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === generationStep
                      ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                      : idx < generationStep
                      ? 'w-3 bg-emerald-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Evaluating deadline pacing & cognitive retention
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
