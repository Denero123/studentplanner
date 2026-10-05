-- StudyFlow AI Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor if connecting directly to Supabase

-- 1. Study Plans Table
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  deadline DATE NOT NULL,
  daily_hours NUMERIC(4,2) NOT NULL DEFAULT 1.5,
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Study Tasks Table
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  task TEXT NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  task_type TEXT NOT NULL DEFAULT 'learning', -- 'learning' | 'revision' | 'practice'
  priority TEXT NOT NULL DEFAULT 'medium',   -- 'high' | 'medium' | 'low'
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_plan_id ON public.topics(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_plan_id ON public.study_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_date ON public.study_tasks(date);
