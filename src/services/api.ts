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

  // AI Plan Generation
  async generateAiPlan(payload: PlanGenerationRequest) {
    return request<{ success: boolean; data: PlanGenerationResponse }>('/api/generate-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Demo Seed
  async seedDemoData() {
    return request<{ success: boolean; message: string; data: { id: string } }>('/api/seed-demo', {
      method: 'POST',
    });
  },
};
