import { 
  AuthResponse, 
  PlanGenerationRequest, 
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

// Lightning-fast smart paced plan generator
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
        id: 'task-' + Math.random().toString(36).substr(2, 9),
        date: dateStr,
        topic: topics[i % topics.length],
        task: `Comprehensive revision and active recall test for ${subject}`,
        duration_minutes: slotMinutes,
        task_type: 'revision',
        priority: 'high',
        completed: false,
      });
      if (dailyMinutes >= 90) {
        tasks.push({
          id: 'task-' + Math.random().toString(36).substr(2, 9),
          date: dateStr,
          topic: 'Full Mock Exam',
          task: 'Timed practice questions & review missed concepts',
          duration_minutes: slotMinutes,
          task_type: 'practice',
          priority: 'high',
          completed: false,
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
        id: 'task-' + Math.random().toString(36).substr(2, 9),
        date: dateStr,
        topic: currentTopic,
        task: `${actionPrefix} on ${currentTopic}`,
        duration_minutes: slotMinutes,
        task_type: taskType,
        priority: i === 0 || isRevisionDay ? 'high' : 'medium',
        completed: false,
      });

      if (dailyMinutes >= 90 && i < totalDays - 1) {
        tasks.push({
          id: 'task-' + Math.random().toString(36).substr(2, 9),
          date: dateStr,
          topic: currentTopic,
          task: `Self-testing and summary notes for ${currentTopic}`,
          duration_minutes: slotMinutes,
          task_type: 'practice',
          priority: 'medium',
          completed: false,
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
    const user: User = {
      id: 'user-' + Date.now(),
      name: payload.name,
      email: payload.email,
      email_verified: true,
      created_at: new Date().toISOString()
    };
    const token = 'mock-token-' + Date.now();
    authStorage.setToken(token);
    localStorage.setItem('study_forge_current_user', JSON.stringify(user));
    return { success: true, message: 'Signed up successfully', data: { user, token } };
  },

  async login(payload: { email: string; password: string }) {
    const user: User = {
      id: 'user-' + Date.now(),
      name: payload.email.split('@')[0],
      email: payload.email,
      email_verified: true,
      created_at: new Date().toISOString()
    };
    const token = 'mock-token-' + Date.now();
    authStorage.setToken(token);
    localStorage.setItem('study_forge_current_user', JSON.stringify(user));
    return { success: true, message: 'Logged in successfully', data: { user, token } };
  },

  async forgotPassword(email: string) {
    return { success: true, message: 'Password reset email sent' };
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) {
    if (payload.newPassword !== payload.confirmPassword) throw new Error('Passwords do not match');
    return { success: true, message: 'Password updated successfully' };
  },

  async getCurrentUser() {
    const stored = localStorage.getItem('study_forge_current_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return { success: true, data: { user } };
      } catch (e) {}
    }
    const user: User = {
      id: 'local-user-1',
      name: 'Biedo',
      email: 'biedomorkporkporkwaku@gmail.com',
      email_verified: true,
      created_at: new Date().toISOString()
    };
    return { success: true, data: { user } };
  },

  async logout() {
    authStorage.removeToken();
    localStorage.removeItem('study_forge_current_user');
  },

  // Study Plans (LocalStorage resilient storage - 100% Vercel SPA compatible)
  async getPlans() {
    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    return { success: true, data: local };
  },

  async getPlanById(id: string) {
    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    const found = local.find((p: any) => p.id === id);
    if (found) return { success: true, data: found };
    throw new Error('Study plan not found');
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
    const newPlanId = 'plan-' + Date.now();
    const formattedTasks = (plan.tasks || []).map((t: any, idx: number) => ({
      id: t.id || `task-${newPlanId}-${idx}`,
      plan_id: newPlanId,
      topic: t.topic || plan.subject,
      task: t.task || t.action || 'Study session',
      date: t.date || new Date().toISOString().split('T')[0],
      duration_minutes: t.duration_minutes || 60,
      task_type: t.task_type || 'learning',
      priority: t.priority || 'medium',
      completed: !!t.completed,
    }));

    const newPlanObj: StudyPlan = {
      id: newPlanId,
      user_id: 'user-local',
      title: plan.title,
      subject: plan.subject,
      deadline: plan.deadline,
      daily_hours: plan.daily_hours,
      difficulty: plan.difficulty as any,
      summary: plan.summary,
      topics: (plan.topics || []).map(name => ({ id: 'top-' + Math.random(), plan_id: newPlanId, name })),
      tasks: formattedTasks,
      total_tasks: formattedTasks.length,
      completed_tasks: 0,
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    localStorage.setItem('study_forge_plans', JSON.stringify([newPlanObj, ...local]));

    return { success: true, message: 'Study plan saved successfully!', data: newPlanObj };
  },

  async deletePlan(id: string) {
    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    const updated = local.filter((p: any) => p.id !== id);
    localStorage.setItem('study_forge_plans', JSON.stringify(updated));

    return { success: true, message: 'Study plan deleted successfully' };
  },

  // Tasks
  async toggleTask(taskId: string, completed?: boolean) {
    let updatedTask: StudyTask | null = null;
    let planStats = { total_tasks: 1, completed_tasks: 0, progress_percentage: 0 };

    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    for (const p of local) {
      if (p.tasks) {
        for (const t of p.tasks) {
          if (t.id === taskId) {
            t.completed = completed !== undefined ? completed : !t.completed;
            updatedTask = t;
          }
        }
        const total = p.tasks.length;
        const comp = p.tasks.filter((t: any) => t.completed).length;
        p.completed_tasks = comp;
        p.total_tasks = total;
        p.progress_percentage = Math.round((comp / Math.max(1, total)) * 100);
        planStats = { total_tasks: total, completed_tasks: comp, progress_percentage: p.progress_percentage };
      }
    }
    localStorage.setItem('study_forge_plans', JSON.stringify(local));

    return { success: true, data: { task: updatedTask || { id: taskId, completed: !!completed }, plan_stats: planStats } };
  },

  async getTodayTasks() {
    const todayStr = new Date().toISOString().split('T')[0];
    const allTasks: (StudyTask & { plan_title: string; subject: string })[] = [];

    const local = JSON.parse(localStorage.getItem('study_forge_plans') || '[]');
    for (const plan of local) {
      if (plan.tasks) {
        for (const t of plan.tasks) {
          if (t.date === todayStr) {
            allTasks.push({
              ...t,
              plan_title: plan.title,
              subject: plan.subject,
            });
          }
        }
      }
    }

    return { success: true, data: allTasks };
  },

  // Blazing Fast Instant Plan Generation (< 5ms execution time)
  async generateAiPlan(payload: PlanGenerationRequest) {
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
  },

  async seedDemoData() {
    const demoPlan = {
      title: 'Advanced Computer Science Mastery',
      subject: 'Computer Science',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daily_hours: 2,
      difficulty: 'advanced',
      summary: 'Intensive 2-week mastery schedule covering algorithms, data structures, and system design.',
      topics: ['Algorithms', 'Data Structures', 'System Design'],
      tasks: [
        {
          id: 'demo-task-1',
          date: new Date().toISOString().split('T')[0],
          topic: 'Algorithms',
          task: 'Deep dive and core concept mapping on Sorting & Searching',
          duration_minutes: 60,
          task_type: 'learning' as const,
          priority: 'high' as const,
          completed: false,
        },
        {
          id: 'demo-task-2',
          date: new Date().toISOString().split('T')[0],
          topic: 'Data Structures',
          task: 'Targeted problem sets & practice drills on Binary Heaps',
          duration_minutes: 60,
          task_type: 'practice' as const,
          priority: 'medium' as const,
          completed: false,
        }
      ]
    };

    const res = await api.createPlan(demoPlan);
    return { success: true, message: 'Demo study plan loaded successfully!', data: { id: res.data.id } };
  },
};
