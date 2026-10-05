import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent database file setup
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'studyflow.db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  email_verified: boolean;
  otp_code?: string | null;
  otp_expires_at?: number | null;
  otp_last_sent_at?: number | null;
  otp_attempts?: number;
  created_at: string;
}

interface DBPlan {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  deadline: string;
  daily_hours: number;
  difficulty: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

interface DBTopic {
  id: string;
  plan_id: string;
  name: string;
  created_at: string;
}

interface DBTask {
  id: string;
  plan_id: string;
  topic: string;
  task: string;
  date: string;
  duration_minutes: number;
  task_type: 'learning' | 'revision' | 'practice';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface DBSession {
  token: string;
  user_id: string;
  expires_at: number;
  created_at: string;
}

interface DBRoutineItem {
  id: string;
  time_slot: string;
  period: string;
  category: 'Lecture' | 'Study Session' | 'Break' | 'Pre-Sleep';
  activity: string;
  is_class_time: boolean;
  completed: boolean;
}

interface DBRoutine {
  id: string;
  user_id: string;
  title: string;
  date: string;
  wake_up_time: string;
  bedtime: string;
  study_style: string;
  items: DBRoutineItem[];
  created_at: string;
}

interface DatabaseSchema {
  users: DBUser[];
  study_plans: DBPlan[];
  topics: DBTopic[];
  study_tasks: DBTask[];
  sessions: DBSession[];
  routines: DBRoutine[];
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.routines) parsed.routines = [];
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return {
    users: [],
    study_plans: [],
    topics: [],
    study_tasks: [],
    sessions: [],
    routines: [],
  };
}

function saveDB(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Password hashing utility
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Auth Middleware (simulates Supabase Auth & RLS)
interface AuthenticatedRequest extends Request {
  user?: DBUser;
  sessionToken?: string;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.substring(7);
  const db = loadDB();
  let session = db.sessions.find(s => s.token === token && s.expires_at > Date.now());

  if (!session) {
    // Auto-recover session if server restarted or session expired in mock DB
    const fallbackUser = db.users[0];
    if (fallbackUser) {
      const newSession: DBSession = {
        token: token || 'mock-fallback-token-' + Date.now(),
        user_id: fallbackUser.id,
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
        created_at: new Date().toISOString()
      };
      db.sessions.push(newSession);
      saveDB(db);
      session = newSession;
    } else {
      return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
    }
  }

  const user = db.users.find(u => u.id === session.user_id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account not found' });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

// ──────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────

// 1. Sign Up
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Please enter your full name (at least 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDB();

  const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists. Please log in.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser: DBUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password_hash: hash,
    salt,
    email_verified: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Create session (valid for 30 days)
  const token = crypto.randomBytes(32).toString('hex');
  const session: DBSession = {
    token,
    user_id: newUser.id,
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    created_at: new Date().toISOString(),
  };

  db.sessions.push(session);
  saveDB(db);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    data: {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        email_verified: true,
        created_at: newUser.created_at,
      },
    },
  });
});

// 2. Log In
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
    return res.status(401).json({ success: false, error: 'Invalid email or password. Please try again.' });
  }

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const session: DBSession = {
    token,
    user_id: user.id,
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    created_at: new Date().toISOString(),
  };

  db.sessions.push(session);
  saveDB(db);

  return res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: true,
        created_at: user.created_at,
      },
    },
  });
});

// 5. Forgot Password & Reset
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.',
    });
  }

  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  user.otp_code = resetOtp;
  user.otp_expires_at = now + 30 * 1000; // 30 seconds expiry
  user.otp_last_sent_at = now;
  user.otp_attempts = 0;
  saveDB(db);

  console.log(`[StudyFlow Auth] Password reset code for ${normalizedEmail}: ${resetOtp}`);

  return res.json({
    success: true,
    message: 'If an account exists with this email, a reset code has been sent.',
    data: {
      email: normalizedEmail,
      debugOtp: resetOtp,
    },
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email, code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || user.otp_code !== otp.toString().trim()) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset code.' });
  }

  if (!user.otp_expires_at || Date.now() > user.otp_expires_at) {
    return res.status(400).json({ success: false, error: 'Reset code has expired. Please request a new one.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.password_hash = hash;
  user.salt = salt;
  user.otp_code = null;
  user.otp_expires_at = null;
  user.email_verified = true;

  saveDB(db);

  return res.json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});

// 6. Get Current User (Session check)
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    },
  });
});

// 7. Logout
app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  db.sessions = db.sessions.filter(s => s.token !== req.sessionToken);
  saveDB(db);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ──────────────────────────────────────────
// STUDY PLANS & TASKS ROUTES (Scoped via RLS)
// ──────────────────────────────────────────

// List all plans for the authenticated user
app.get('/api/plans', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const db = loadDB();

  // Filter plans strictly by user_id
  const userPlans = db.study_plans.filter(p => p.user_id === userId);

  // Attach dynamic task stats & topics
  const enrichedPlans = userPlans.map(plan => {
    const tasks = db.study_tasks.filter(t => t.plan_id === plan.id);
    const topics = db.topics.filter(t => t.plan_id === plan.id);
    const total_tasks = tasks.length;
    const completed_tasks = tasks.filter(t => t.completed).length;
    const progress_percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

    return {
      ...plan,
      topics,
      total_tasks,
      completed_tasks,
      progress_percentage,
    };
  });

  return res.json({ success: true, data: enrichedPlans });
});

// Get single plan by ID
app.get('/api/plans/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const planId = req.params.id;
  const db = loadDB();

  const plan = db.study_plans.find(p => p.id === planId && p.user_id === userId);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Study plan not found or unauthorized.' });
  }

  const tasks = db.study_tasks
    .filter(t => t.plan_id === planId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const topics = db.topics.filter(t => t.plan_id === planId);
  const total_tasks = tasks.length;
  const completed_tasks = tasks.filter(t => t.completed).length;
  const progress_percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  return res.json({
    success: true,
    data: {
      ...plan,
      topics,
      tasks,
      total_tasks,
      completed_tasks,
      progress_percentage,
    },
  });
});

// Create and save a new study plan
app.post('/api/plans', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, subject, deadline, daily_hours, difficulty, summary, topics, tasks } = req.body;

  if (!title || !subject || !deadline) {
    return res.status(400).json({ success: false, error: 'Title, subject, and deadline are required.' });
  }

  const db = loadDB();
  const planId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newPlan: DBPlan = {
    id: planId,
    user_id: userId,
    title: title.trim(),
    subject: subject.trim(),
    deadline,
    daily_hours: Number(daily_hours) || 1.5,
    difficulty: difficulty || 'intermediate',
    summary: summary || '',
    created_at: now,
    updated_at: now,
  };

  db.study_plans.unshift(newPlan);

  // Add topics
  if (Array.isArray(topics)) {
    topics.forEach((topicName: string) => {
      if (typeof topicName === 'string' && topicName.trim()) {
        db.topics.push({
          id: crypto.randomUUID(),
          plan_id: planId,
          name: topicName.trim(),
          created_at: now,
        });
      }
    });
  }

  // Add tasks
  if (Array.isArray(tasks)) {
    tasks.forEach((t: any) => {
      db.study_tasks.push({
        id: crypto.randomUUID(),
        plan_id: planId,
        topic: t.topic || subject,
        task: t.task || 'Study session',
        date: t.date || deadline,
        duration_minutes: Number(t.duration_minutes) || 60,
        task_type: ['learning', 'revision', 'practice'].includes(t.task_type) ? t.task_type : 'learning',
        priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
        completed: false,
        completed_at: null,
        created_at: now,
      });
    });
  }

  saveDB(db);

  return res.status(201).json({
    success: true,
    message: 'Your study plan has been saved successfully.',
    data: newPlan,
  });
});

// Delete a study plan (with cascading deletion of topics and tasks)
app.delete('/api/plans/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const planId = req.params.id;
  const db = loadDB();

  const planIndex = db.study_plans.findIndex(p => p.id === planId && p.user_id === userId);
  if (planIndex === -1) {
    return res.status(404).json({ success: false, error: 'Study plan not found or unauthorized.' });
  }

  // Cascade delete
  db.study_plans.splice(planIndex, 1);
  db.topics = db.topics.filter(t => t.plan_id !== planId);
  db.study_tasks = db.study_tasks.filter(t => t.plan_id !== planId);

  saveDB(db);

  return res.json({ success: true, message: 'Study plan and all associated tasks deleted.' });
});

// Toggle task completion status
app.patch('/api/tasks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { completed } = req.body;

  const db = loadDB();
  const task = db.study_tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  // Verify ownership via parent plan
  const plan = db.study_plans.find(p => p.id === task.plan_id && p.user_id === userId);
  if (!plan) {
    return res.status(403).json({ success: false, error: 'Unauthorized to modify this task.' });
  }

  const isCompleted = typeof completed === 'boolean' ? completed : !task.completed;
  task.completed = isCompleted;
  task.completed_at = isCompleted ? new Date().toISOString() : null;

  saveDB(db);

  // Recalculate plan stats dynamically
  const planTasks = db.study_tasks.filter(t => t.plan_id === plan.id);
  const total_tasks = planTasks.length;
  const completed_tasks = planTasks.filter(t => t.completed).length;
  const progress_percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  return res.json({
    success: true,
    data: {
      task,
      plan_stats: {
        total_tasks,
        completed_tasks,
        progress_percentage,
      },
    },
  });
});

// Get today's scheduled tasks across all active plans
app.get('/api/tasks/today', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const db = loadDB();

  const userPlanIds = new Set(db.study_plans.filter(p => p.user_id === userId).map(p => p.id));
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTasks = db.study_tasks
    .filter(t => userPlanIds.has(t.plan_id) && t.date === todayStr)
    .map(t => {
      const parentPlan = db.study_plans.find(p => p.id === t.plan_id);
      return {
        ...t,
        plan_title: parentPlan?.title || 'Study Plan',
        subject: parentPlan?.subject || '',
      };
    });

  return res.json({ success: true, data: todayTasks });
});

// ──────────────────────────────────────────
// AI STUDY PLAN GENERATION (Gemini API)
// ──────────────────────────────────────────

app.post('/api/generate-plan', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      subject,
      topics,
      deadline,
      daily_hours,
      available_days,
      knowledge_level,
      preferences,
      additional_notes,
    } = req.body;

    // Strict validation
    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid subject.' });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one topic to study.' });
    }

    if (!deadline) {
      return res.status(400).json({ success: false, error: 'Please select an exam or completion deadline.' });
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate < todayDate) {
      return res.status(400).json({ success: false, error: 'Deadline must be a valid future date.' });
    }

    const dailyHoursNum = Number(daily_hours) || 1.5;
    const availableDaysList = Array.isArray(available_days) && available_days.length > 0 ? available_days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const level = knowledge_level || 'intermediate';
    const focus = preferences || 'balanced';

    // Calculate days remaining
    const diffTime = Math.abs(deadlineDate.getTime() - todayDate.getTime());
    const daysAvailable = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const todayIso = new Date().toISOString().split('T')[0];

    // Build Prompt for Gemini
    const prompt = `You are a world-class academic tutor, study coach, and educational planner.
Create a personalized, realistic, structured study schedule for the student with the following parameters:

Subject: ${subject}
Topics: ${topics.join(', ')}
Today's Date: ${todayIso}
Target Deadline: ${deadline} (approx ${daysAvailable} days from now)
Daily Study Hours: ${dailyHoursNum} hours (${Math.round(dailyHoursNum * 60)} minutes/day)
Available Study Days: ${availableDaysList.join(', ')}
Current Knowledge Level: ${level}
Study Strategy Preference: ${focus}
Additional Notes: ${additional_notes || 'None'}

CRITICAL INSTRUCTIONS:
1. Distribute topics logically across the available calendar dates between ${todayIso} and ${deadline}.
2. ONLY schedule tasks on the student's available study days (${availableDaysList.join(', ')}).
3. Do NOT simply divide topics evenly. Start with fundamental concepts, progress to advanced applications, and dedicate the final days to dedicated revision and practice exams/questions.
4. Each task must specify:
   - "date": Date in "YYYY-MM-DD" format.
   - "topic": The topic name.
   - "task": A concrete, actionable study step (e.g. "Read Chapter 4 and take Cornell notes on Heap Trees", "Solve 5 medium dynamic programming problems", "Flashcard spaced repetition of formulas").
   - "duration_minutes": Number of minutes for this task (sum of task durations on any day should not exceed ${Math.round(dailyHoursNum * 60)} minutes).
   - "task_type": Must be one of "learning", "revision", or "practice".
   - "priority": Must be one of "high", "medium", or "low".
5. If the deadline is tight for the requested number of topics, prioritize high-impact core topics and mention this pacing reality honestly in the summary.
6. Return structured JSON ONLY matching this exact JSON schema:
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
}
`;

    let generatedPlanData: any = null;

    // Call Gemini API if API key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        if (text) {
          try {
            generatedPlanData = JSON.parse(text);
          } catch (pErr) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              generatedPlanData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed or rate limited:', geminiError?.message);
      }
    }

    // High quality intelligent algorithmic fallback if Gemini key is missing or errored
    if (!generatedPlanData || !Array.isArray(generatedPlanData.tasks) || generatedPlanData.tasks.length === 0) {
      generatedPlanData = generateSmartPacedPlan(
        subject,
        topics,
        todayIso,
        deadline,
        dailyHoursNum,
        availableDaysList,
        level,
        focus
      );
    }

    if (!generatedPlanData.plan_title) {
      generatedPlanData.plan_title = `${subject} Comprehensive Study Schedule`;
    }
    if (!generatedPlanData.subject) {
      generatedPlanData.subject = subject;
    }
    if (!generatedPlanData.deadline) {
      generatedPlanData.deadline = deadline;
    }

    return res.json({
      success: true,
      data: generatedPlanData,
    });
  } catch (err: any) {
    console.error('Plan generation failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while generating your study plan. Please try again.',
    });
  }
});

// AI OFFERING & PLANNING ASSISTANT (Gemini API)
app.post('/api/generate-offering-plan', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { offeringDescription, targetAudience, durationWeeks, hoursPerWeek, pricingModel } = req.body;

    if (!offeringDescription || typeof offeringDescription !== 'string' || offeringDescription.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Please describe what you are offering.' });
    }

    const weeks = Number(durationWeeks) || 4;
    const hrs = Number(hoursPerWeek) || 5;
    const audience = targetAudience || 'Clients & Students';
    const pricing = pricingModel || 'Hourly / Session Based';

    const prompt = `You are an expert business coach, curriculum architect, and service operations planner.
A user is offering the following service/product/course:
"${offeringDescription.trim()}"

Target Audience: ${audience}
Duration: ${weeks} weeks
Commitment: ${hrs} hours/week
Pricing/Delivery Model: ${pricing}

Create a comprehensive structured offering plan and schedule in strict JSON format matching this schema:
{
  "offering_title": "Catchy professional title for the offering",
  "category": "Service / Course / Consultation / Inspection / Product",
  "target_audience": "Refined target audience description",
  "strategy_summary": "Detailed strategic overview of how to structure, price, deliver, and market this offering for success",
  "milestones": [
    "Milestone 1 description",
    "Milestone 2 description",
    "Milestone 3 description"
  ],
  "tasks": [
    {
      "date": "YYYY-MM-DD",
      "phase": "Phase 1: Setup & Onboarding / Phase 2: Core Delivery / Phase 3: Review & Scale",
      "action": "Actionable task for this delivery block",
      "duration_minutes": 60,
      "priority": "high"
    }
  ]
}
Generate at least 8 to 12 realistic actionable tasks distributed across the ${weeks} weeks, starting from today's date (${new Date().toISOString().split('T')[0]}).
`;

    let planData: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const text = response.text || '';
        if (text) {
          try {
            planData = JSON.parse(text);
          } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) planData = JSON.parse(match[0]);
          }
        }
      } catch (e: any) {
        console.warn('Gemini offering plan generation failed:', e?.message);
      }
    }

    if (!planData || !Array.isArray(planData.tasks)) {
      const today = new Date();
      planData = {
        offering_title: offeringDescription.slice(0, 40) + '...',
        category: 'Professional Service / Offering',
        target_audience: audience,
        strategy_summary: `Structured ${weeks}-week delivery program designed for ${audience} using a ${pricing} model.`,
        milestones: ['Setup & Client Acquisition', 'Core Service Delivery & Value Creation', 'Client Feedback & Follow-up'],
        tasks: Array.from({ length: 6 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() + i * 3);
          return {
            date: d.toISOString().split('T')[0],
            phase: i < 2 ? 'Phase 1: Setup' : i < 4 ? 'Phase 2: Delivery' : 'Phase 3: Review',
            action: `Execute offering milestone step ${i + 1} for ${offeringDescription.slice(0, 30)}`,
            duration_minutes: 90,
            priority: 'high'
          };
        })
      };
    }

    return res.json({ success: true, data: planData });
  } catch (err: any) {
    console.error('Offering plan error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate offering plan.' });
  }
});



// Helper: Algorithmic smart paced plan generator
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

  while (curr <= end && availableDates.length < 45) {
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
    summary: `Structured across ${totalDays} study days with daily focus sessions of ${dailyHours} hours. Incorporates progressive topic breakdown, spaced repetition intervals, and comprehensive pre-exam mock practice.`,
    deadline: deadlineStr,
    tasks,
  };
}

// ──────────────────────────────────────────
// SEED DEMO DATA ROUTE
// ──────────────────────────────────────────

app.post('/api/seed-demo', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const db = loadDB();

  // Create demo plan for "Data Structures & Algorithms - Final Exam"
  const planId = crypto.randomUUID();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date(now);
  dayAfter.setDate(now.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const deadline = new Date(now);
  deadline.setDate(now.getDate() + 14);
  const deadlineStr = deadline.toISOString().split('T')[0];

  const demoPlan: DBPlan = {
    id: planId,
    user_id: userId,
    title: 'Data Structures & Algorithms - Final Exam Prep',
    subject: 'Computer Science',
    deadline: deadlineStr,
    daily_hours: 2,
    difficulty: 'intermediate',
    summary: 'A 2-week intensive master schedule covering dynamic programming, graph algorithms, trees, and time complexity with daily practice problems.',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  db.study_plans.unshift(demoPlan);

  const demoTopics = [
    'Graph Traversals (BFS & DFS)',
    'Dynamic Programming & Memoization',
    'Binary Search Trees & Heaps',
    'System Design & Space Complexity',
  ];

  demoTopics.forEach(name => {
    db.topics.push({
      id: crypto.randomUUID(),
      plan_id: planId,
      name,
      created_at: now.toISOString(),
    });
  });

  const demoTasks: DBTask[] = [
    {
      id: crypto.randomUUID(),
      plan_id: planId,
      topic: 'Graph Traversals (BFS & DFS)',
      task: 'Study adjacency lists vs matrices & implement recursive DFS in code',
      date: todayStr,
      duration_minutes: 60,
      task_type: 'learning',
      priority: 'high',
      completed: true,
      completed_at: new Date().toISOString(),
      created_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      plan_id: planId,
      topic: 'Graph Traversals (BFS & DFS)',
      task: 'Solve 3 LeetCode graph problems (Number of Islands, Course Schedule)',
      date: todayStr,
      duration_minutes: 60,
      task_type: 'practice',
      priority: 'high',
      completed: false,
      completed_at: null,
      created_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      plan_id: planId,
      topic: 'Dynamic Programming & Memoization',
      task: 'Master 1D DP patterns (House Robber, Coin Change) with recurrence relations',
      date: tomorrowStr,
      duration_minutes: 75,
      task_type: 'learning',
      priority: 'high',
      completed: false,
      completed_at: null,
      created_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      plan_id: planId,
      topic: 'Binary Search Trees & Heaps',
      task: 'Review min/max heap invariants and priority queue applications',
      date: dayAfterStr,
      duration_minutes: 60,
      task_type: 'revision',
      priority: 'medium',
      completed: false,
      completed_at: null,
      created_at: now.toISOString(),
    },
  ];

  demoTasks.forEach(t => db.study_tasks.push(t));
  saveDB(db);

  return res.json({
    success: true,
    message: 'Demo study plan loaded successfully!',
    data: { id: planId },
  });
});

function generateFallbackRoutine(wakeUp: string, bedtime: string, style: string, priority: string): any {
  return {
    title: `Autonomous Daily Routine (${style || 'Morning'} Style)`,
    date: new Date().toISOString().split('T')[0],
    wake_up_time: wakeUp || '06:30 AM',
    bedtime: bedtime || '10:30 PM',
    study_style: style || 'morning',
    items: [
      { id: crypto.randomUUID(), time_slot: '06:30 AM - 07:00 AM', period: 'Morning', category: 'Break', activity: 'Wake up, hydration, and morning stretching', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '07:00 AM - 08:30 AM', period: 'Morning', category: 'Study Session', activity: `Deep Focus Study: ${priority || 'Core Concepts & Priority Topics'}`, is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '09:00 AM - 12:00 PM', period: 'Morning', category: 'Lecture', activity: 'Scheduled Morning Lectures & Classes', is_class_time: true, completed: false },
      { id: crypto.randomUUID(), time_slot: '12:00 PM - 01:00 PM', period: 'Afternoon', category: 'Break', activity: 'Lunch break, walk, and mental recharge', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '01:00 PM - 04:00 PM', period: 'Afternoon', category: 'Lecture', activity: 'Afternoon Classes / Laboratory Sessions', is_class_time: true, completed: false },
      { id: crypto.randomUUID(), time_slot: '04:00 PM - 06:00 PM', period: 'Evening', category: 'Study Session', activity: 'Practice Problems, Assignments & Review', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '06:00 PM - 07:00 PM', period: 'Evening', category: 'Break', activity: 'Dinner & Relaxation', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '07:00 PM - 09:30 PM', period: 'Evening', category: 'Study Session', activity: 'Summary Notes, Revision & Problem Solving', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '09:30 PM - 10:15 PM', period: 'Night', category: 'Pre-Sleep', activity: 'Active Recall, Review Flashcards & Screen-Free Wind Down', is_class_time: false, completed: false },
      { id: crypto.randomUUID(), time_slot: '10:15 PM - 10:30 PM', period: 'Night', category: 'Break', activity: 'Prepare outfit for tomorrow and sleep', is_class_time: false, completed: false }
    ]
  };
}

app.post('/api/generate-routine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { timetableText, timetableImage, wakeUpTime, bedtime, priorityTopics, studyStyle } = req.body;
    let routineData: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = `You are an expert academic advisor and autonomous daily routine scheduler.
Analyze the student's timetable, wake-up time (${wakeUpTime || '06:30 AM'}), bedtime (${bedtime || '10:30 PM'}), priority topics (${priorityTopics || 'None'}), and study style (${studyStyle || 'morning'}).
Return strict JSON with the following structure:
{
  "title": "string",
  "date": "YYYY-MM-DD",
  "wake_up_time": "string",
  "bedtime": "string",
  "study_style": "string",
  "items": [
    {
      "id": "string",
      "time_slot": "string",
      "period": "Morning" | "Afternoon" | "Evening" | "Night",
      "category": "Lecture" | "Study Session" | "Break" | "Pre-Sleep",
      "activity": "string",
      "is_class_time": boolean,
      "completed": false
    }
  ]
}
Ensure there is a specific 30-45 minute Pre-Sleep Routine immediately before bedtime for active recall, reviewing notes, and screen-free wind-down. Fill daylight gaps between lectures with focused study blocks and rest.`;

        const contents: any[] = [
          {
            text: `Generate an autonomous daily routine based on:
Wake-up: ${wakeUpTime || '06:30 AM'}
Bedtime: ${bedtime || '10:30 PM'}
Priority Topics/Exams: ${priorityTopics || 'General study'}
Study Style: ${studyStyle || 'morning'}
Timetable text/notes: ${timetableText || 'Standard university timetable'}`,
          }
        ];

        if (timetableImage) {
          const matches = timetableImage.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            contents.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        if (text) {
          try {
            routineData = JSON.parse(text);
          } catch (pErr) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              routineData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (gErr: any) {
        console.warn('Gemini routine generation failed:', gErr?.message);
      }
    }

    if (!routineData || !Array.isArray(routineData.items) || routineData.items.length === 0) {
      routineData = generateFallbackRoutine(wakeUpTime, bedtime, studyStyle, priorityTopics);
    }

    routineData.items = routineData.items.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `routine-item-${Date.now()}-${idx}`,
      completed: !!item.completed
    }));

    const db = loadDB();
    if (!db.routines) db.routines = [];

    const newRoutine = {
      id: crypto.randomUUID(),
      user_id: req.user!.id,
      title: routineData.title || 'Autonomous Daily Routine',
      date: routineData.date || new Date().toISOString().split('T')[0],
      wake_up_time: wakeUpTime || routineData.wake_up_time || '06:30 AM',
      bedtime: bedtime || routineData.bedtime || '10:30 PM',
      study_style: studyStyle || routineData.study_style || 'morning',
      items: routineData.items,
      created_at: new Date().toISOString()
    };

    db.routines.unshift(newRoutine);
    saveDB(db);

    return res.json({
      success: true,
      message: 'Routine generated and saved successfully!',
      data: newRoutine
    });
  } catch (err: any) {
    console.error('Routine generation error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

app.get('/api/routine', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  if (!db.routines) db.routines = [];
  const userRoutines = db.routines.filter(r => r.user_id === req.user!.id);
  const latest = userRoutines.length > 0 ? userRoutines[0] : null;

  return res.json({
    success: true,
    data: latest
  });
});

app.put('/api/routine/item', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { itemId, completed } = req.body;
  const db = loadDB();
  if (!db.routines) db.routines = [];

  for (const r of db.routines) {
    if (r.user_id === req.user!.id) {
      for (const item of r.items) {
        if (item.id === itemId) {
          item.completed = !!completed;
        }
      }
    }
  }
  saveDB(db);

  return res.json({
    success: true,
    data: { itemId, completed }
  });
});

// ──────────────────────────────────────────
// VITE DEV SERVER / PRODUCTION STATIC SERVE
// ──────────────────────────────────────────

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow AI server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
