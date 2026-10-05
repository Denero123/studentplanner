-- StudyFlow AI Database Schema

-- Enable RLS
-- Run this in your Supabase SQL Editor

-- 1. STUDY PLANS
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  deadline DATE NOT NULL,
  daily_hours DECIMAL NOT NULL,
  difficulty TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for study_plans
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own plans"
  ON study_plans
  FOR ALL
  USING (auth.uid() = user_id);

-- 2. TOPICS
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for topics (via join)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage topics of their own plans"
  ON topics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = topics.plan_id
      AND study_plans.user_id = auth.uid()
    )
  );

-- 3. STUDY TASKS
CREATE TABLE study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  task TEXT NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  task_type TEXT NOT NULL, -- learning | revision | practice
  priority TEXT NOT NULL, -- high | medium | low
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for study_tasks
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks of their own plans"
  ON study_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_tasks.plan_id
      AND study_plans.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX idx_study_tasks_plan_id ON study_tasks(plan_id);
CREATE INDEX idx_study_tasks_date ON study_tasks(date);
