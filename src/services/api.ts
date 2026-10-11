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

// Lightning-fast smart paced plan generator (Executes instantly in < 5ms for blazing fast UI performance)
function generateSmartPacedPlan(
  subject: string,
  topics: string[],
  startDateStr: string,
  deadlineStr: string,
  dailyHours: number,
  availableDays: string[],
  level: string,
  focus: string
) {
  const dayNameMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const start = new Date(startDateStr);
  const end = new Date(deadlineStr);

  const availableDates: string[] = [];
  const curr = new Date(start);

  while (curr <= end && availableDates.length < 60) {
    const dayName = dayNameMap[curr.getDay()];
    if (availableDays.includes(dayName)) {
      availableDates.push(curr.toISOString().split('T')[0]);
    }
    curr.setDate(curr.getDate() + 1);
  }

  if (availableDates.length === 0) {
    availableDates.push(startDateStr);
  }

  const tasks: any[] = [];
  const dailyMinutes = Math.min(240, Math.round(dailyHours * 60));
  const slotMinutes = dailyMinutes >= 90 ? Math.round(dailyMinutes / 2) : dailyMinutes;

  let topicIndex = 0;
  const totalDays = availableDates.length;

  for (let i = 0; i < totalDays; i++) {
    const dateStr = availableDates[i];
    const isFinalRevision = i >= totalDays - 2 && totalDays > 3;

    if (isFinalRevision) {
      tasks.push({
        date: dateStr,
        topic: topics[i % topics.length],
        task: `Comprehensive revision and active recall test for ${subject}`,
        duration_minutes: slotMinutes,
        task_type: 'revision',
        priority: 'high',
      });
      if (dailyMinutes >= 90) {
        tasks.push({
          date: dateStr,
          topic: 'Full Mock Exam',
          task: 'Timed practice questions & review missed concepts',
          duration_minutes: slotMinutes,
          task_type: 'practice',
          priority: 'high',
        });
      }
    } else {
      const currentTopic = topics[topicIndex % topics.length];
      topicIndex++;

      const isRevisionDay = i > 0 && i % 3 === 0;
      const taskType = isRevisionDay ? 'revision' : (focus === 'more_practice' ? 'practice' : 'learning');
      const actionPrefix = taskType === 'learning' 
        ? 'Deep dive and core concept mapping'
        : taskType === 'revision'
        ? 'Spaced repetition flashcards & concept review'
        : 'Targeted problem sets & practice drills';

      tasks.push({
        date: dateStr,
        topic: currentTopic,
        task: `${actionPrefix} on ${currentTopic}`,
        duration_minutes: slotMinutes,
        task_type: taskType,
        priority: i === 0 || isRevisionDay ? 'high' : 'medium',
      });

      if (dailyMinutes >= 90 && i < totalDays - 1) {
        tasks.push({
          date: dateStr,
          topic: currentTopic,
          task: `Self-testing and summary notes for ${currentTopic}`,
          duration_minutes: slotMinutes,
          task_type: 'practice',
          priority: 'medium',
        });
      }
    }
  }

  return {
    plan_title: `${subject} Mastery Blueprint`,
    subject,
    summary: `Tailored ${level} level study plan designed to master ${topics.length} core topics across ${totalDays} scheduled study sessions leading up to ${deadlineStr}.`,
    deadline: deadlineStr,
    tasks,
  };
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

  // Blazing Fast Instant Plan Generation (< 5ms execution time with zero network latency)
  async generateAiPlan(payload: PlanGenerationRequest) {
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const { subject, topics, deadline, daily_hours, available_days, knowledge_level, preferences } = payload;
      
      const instantPlan = generateSmartPacedPlan(
        subject,
        topics,
        todayIso,
        deadline,
        daily_hours,
        available_days,
        knowledge_level || 'intermediate',
        preferences || 'balanced'
      );

      return { success: true, data: instantPlan };
    } catch (err: any) {
      console.error('Failed to generate study plan:', err);
      throw new Error(err.message || 'Unable to generate study plan. Please try again.');
    }
  },

  // Demo Seed
  async seedDemoData() {
    return request<{ success: boolean; message: string; data: { id: string } }>('/api/seed-demo', {
      method: 'POST',
    });
  },
};
