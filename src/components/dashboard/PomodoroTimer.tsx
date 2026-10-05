import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Flame, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PomodoroTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
  const { success } = useToast();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>('Deep Study Session');
  const [totalFocusMinutesToday, setTotalFocusMinutesToday] = useState<number>(() => {
    const saved = localStorage.getItem('studyflow_focus_mins');
    return saved ? Number(saved) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerFinish();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleTimerFinish = () => {
    if (mode === 'focus') {
      const addedMins = Math.round(MODE_TIMES.focus / 60);
      const newTotal = totalFocusMinutesToday + addedMins;
      setTotalFocusMinutesToday(newTotal);
      localStorage.setItem('studyflow_focus_mins', String(newTotal));
      success(`🎉 Focus session completed! Added ${addedMins} mins to your daily focus tally.`);
      if (onSessionComplete) {
        onSessionComplete(addedMins);
      }
    } else {
      success('Break finished! Ready to jump back into deep focus?');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className="bg-[#111827]/90 rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Pomodoro Focus Timer</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Today's Focus: <span className="text-indigo-400 font-bold">{totalFocusMinutesToday} mins</span>
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          {[
            { id: 'focus', label: 'Focus (25m)' },
            { id: 'shortBreak', label: 'Short Break' },
            { id: 'longBreak', label: 'Long Break' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id as TimerMode)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === m.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Task Input */}
      <div className="relative z-10 space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Current Focus Task / Goal
        </label>
        <input
          type="text"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          placeholder="e.g., Chapter 4 Graph Algorithms Practice..."
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Timer Display & Circular Ring */}
      <div className="flex flex-col items-center justify-center py-6 relative z-10 space-y-6">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-900 rounded-full border-4 border-slate-800 shadow-inner">
          {/* Radial progress ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-indigo-500 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
            />
          </svg>

          <div className="text-center space-y-1 z-10">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
              {formattedTime}
            </span>
            <p className="text-[11px] uppercase tracking-widest text-indigo-300 font-bold">
              {mode === 'focus' ? 'Deep Work' : 'Rest & Recharge'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2.5 transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" /> Pause Session
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all shadow-md"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
