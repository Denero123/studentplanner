-- StudyFlow AI Row Level Security (RLS) Policies
-- Ensures users can ONLY view, insert, update, and delete their own study plans, topics, and tasks.

-- 1. Enable RLS on all tables
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- 2. Study Plans Policies
CREATE POLICY "Users can view their own study plans"
ON public.study_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans"
ON public.study_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
ON public.study_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans"
ON public.study_plans FOR DELETE
USING (auth.uid() = user_id);

-- 3. Topics Policies (joined through plan_id)
CREATE POLICY "Users can view topics of their own plans"
ON public.topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.topics.plan_id
    AND public.study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert topics to their own plans"
ON public.topics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.topics.plan_id
    AND public.study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete topics of their own plans"
ON public.topics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.topics.plan_id
    AND public.study_plans.user_id = auth.uid()
  )
);

-- 4. Study Tasks Policies (joined through plan_id)
CREATE POLICY "Users can view tasks of their own plans"
ON public.study_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.study_tasks.plan_id
    AND public.study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert tasks to their own plans"
ON public.study_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.study_tasks.plan_id
    AND public.study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tasks of their own plans"
ON public.study_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.study_tasks.plan_id
    AND public.study_plans.user_id = auth.uid()
  );

CREATE POLICY "Users can delete tasks of their own plans"
ON public.study_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.study_plans
    WHERE public.study_plans.id = public.study_tasks.plan_id
    AND public.study_plans.user_id = auth.uid()
  );
