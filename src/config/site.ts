/**
 * Centralized site configuration and branding tokens.
 * Modifying this file rebrands the entire application without touching logic.
 */
export const SITE_CONFIG = {
  name: 'Studyforge',
  tagline: 'Your AI-powered study plan, built around your time and your goals.',
  description:
    'Studyforge is an AI-powered academic planning platform that converts a student\'s subjects, topics, deadline, and available study time into a realistic, structured, personalized study schedule—then tracks whether they actually follow it.',
  heroHeadline: 'Study Smarter. Plan Better. Achieve More.',
  heroSubheadline:
    'Create a personalized study plan with AI based on your subjects, deadlines, available time, and learning goals.',
  credit: 'Made by Cyber',
  routes: {
    home: '/',
    login: '/login',
    signup: '/signup',
    verify: '/verify',
    forgotPassword: '/forgot-password',
    dashboard: '/dashboard',
    newPlan: '/study-plans/new',
    planDetail: (id: string) => `/study-plans/${id}`,
    settings: '/settings',
  },
  taskTypes: {
    learning: { label: 'Learning', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    revision: { label: 'Revision', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    practice: { label: 'Practice', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  },
  priorityLevels: {
    high: { label: 'High Priority', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900' },
    medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
    low: { label: 'Low', color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  },
};
