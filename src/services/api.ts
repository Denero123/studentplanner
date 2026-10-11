import { GoogleGenAI } from '@google/genai';
import { 
  AuthResponse, 
  PlanGenerationRequest, 
  PlanGenerationResponse, 
  StudyPlan, 
  StudyTask, 
  User 
} from '../types';

const TOKEN_KEY = 'studyforge_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response (${response.status}): ${text.slice(0, 100)}...`);
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  async signup(payload: { name: string; email: string; password: string; confirmPassword: string }) {
    return request<{ success: boolean; message: string; data: AuthResponse }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async login(payload: { email: string; password: string }) {
    return request<{ success: boolean; message: string; data: AuthResponse }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async forgotPassword(email: string) {
    return request<{ success: boolean; message: string; data?: { email: string } }>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) {
    return request<{ success: boolean; message: string }>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async getCurrentUser() {
    return request<{ success: boolean; data: { user: User } }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.removeToken();
    }
  },

  // Study Plans
  async getPlans() {
    return request<{ success: boolean; data: StudyPlan[] }>('/api/plans');
  },

  async getPlanById(id: string) {
    return request<{ success: boolean; data: StudyPlan }>('/api/plans/' + encodeURIComponent(id));
  },

  async createPlan(plan: {
    title: string;
    subject: string;
    deadline: string;
    daily_hours: number;
    difficulty: string;
    summary: string;
    topics: string[];
    tasks: any[];
  }) {
    return request<{ success: boolean; message: string; data: StudyPlan }>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },

  async deletePlan(id: string) {
    return request<{ success: boolean; message: string }>('/api/plans/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  },

  // Tasks
  async toggleTask(taskId: string, completed?: boolean) {
    return request<{ success: boolean; data: { task: StudyTask; plan_stats: { total_tasks: number; completed_tasks: number; progress_percentage: number } } }>(
      '/api/tasks/' + encodeURIComponent(taskId),
      {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }
    );
  },

  async getTodayTasks() {
    return request<{ success: boolean; data: (StudyTask & { plan_title: string; subject: string })[] }>('/api/tasks/today');
  },

  // AI Plan Generation (Client-Side Direct Call for Vercel SPA compatibility)
  async generateAiPlan(payload: PlanGenerationRequest) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is missing in production environment variables.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const todayIso = new Date().toISOString().split('T')[0];
      const { subject, topics, deadline, daily_hours, available_days, knowledge_level, preferences, additional_notes } = payload;
      
      const prompt = `You are an expert AI academic tutor, curriculum architect, and study strategist.
Create a rigorous, personalized, and beautifully paced study schedule for a student studying "${subject}".

TOPICS TO COVER:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

STUDY PARAMETERS:
- Start Date: ${todayIso}
- Target Deadline: ${deadline}
- Daily Study Hours: ${daily_hours} hours/day
- Available Study Days of the Week: ${available_days.join(', ')}
- Current Knowledge Level: ${knowledge_level}
- Study Strategy Preference: ${preferences}
- Additional Notes: ${additional_notes || 'None'}

CRITICAL INSTRUCTIONS:
1. Distribute topics logically across the available calendar dates between ${todayIso} and ${deadline}.
2. ONLY schedule tasks on the student's available study days (${available_days.join(', ')}).
3. Do NOT simply divide topics evenly. Start with fundamental concepts, progress to advanced applications, and dedicate the final days to dedicated revision and practice exams/questions.
4. Each task must specify:
   - "date": Date in "YYYY-MM-DD" format.
   - "topic": The topic name.
   - "task": A concrete, actionable study step.
   - "duration_minutes": Number of minutes for this task.
   - "task_type": Must be one of "learning", "revision", or "practice".
   - "priority": Must be one of "high", "medium", or "low".
5. Return structured JSON ONLY matching this exact JSON schema:
{
  "plan_title": "string",
  "subject": "string",
  "summary": "string explaining how this plan paces study and revision realistically before the deadline",
  "deadline": "YYYY-MM-DD",
  "tasks": [
    {
      "date": "YYYY-MM-DD",
      "topic": "string",
      "task": "string",
      "duration_minutes": 60,
      "task_type": "learning",
      "priority": "high"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsedPlan = JSON.parse(text);
      return { success: true, data: parsedPlan };
    } catch (err: any) {
      console.error('Failed to parse Gemini output:', err);
      throw new Error(err.message || 'Unable to parse the generated routine. Please try again.');
    }
  },

  // Demo Seed
  async seedDemoData() {
    return request<{ success: boolean; message: string; data: { id: string } }>('/api/seed-demo', {
      method: 'POST',
    });
  },
};
