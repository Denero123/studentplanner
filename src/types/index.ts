export type TaskType = 'learning' | 'revision' | 'practice';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';
export type StudyFocus = 'balanced' | 'more_practice' | 'more_revision' | 'difficult_topics';

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface StudyTask {
  id: string;
  plan_id: string;
  topic: string;
  task: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  task_type: TaskType;
  priority: PriorityLevel;
  completed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

export interface Topic {
  id: string;
  plan_id: string;
  name: string;
  created_at?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  deadline: string; // YYYY-MM-DD
  daily_hours: number;
  difficulty: KnowledgeLevel;
  summary: string;
  topics?: Topic[];
  tasks?: StudyTask[];
  total_tasks?: number;
  completed_tasks?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface PlanGenerationRequest {
  subject: string;
  topics: string[];
  deadline: string;
  daily_hours: number;
  available_days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  knowledge_level: KnowledgeLevel;
  preferences?: StudyFocus;
  additional_notes?: string;
}

export interface GeneratedTask {
  date: string;
  topic: string;
  task: string;
  duration_minutes: number;
  task_type: TaskType;
  priority: PriorityLevel;
}

export interface PlanGenerationResponse {
  plan_title: string;
  subject: string;
  summary: string;
  deadline: string;
  tasks: GeneratedTask[];
}

export interface AuthResponse {
  user: User;
  token: string;
  requiresOtp?: boolean;
  message?: string;
  debugOtp?: string; // provided for development & preview convenience
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
