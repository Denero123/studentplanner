# StudyFlow AI — Your AI-Powered Study Planner

> "Your AI-powered study plan, built around your time and your goals."  
> Designed & Engineered · **Made by Cyber**

StudyFlow AI is an academic planning platform that converts a student's subjects, topics, deadlines, and available study time into a realistic, structured, personalized study schedule—then tracks whether they actually follow it.

---

## 🚀 Key Features

- **Personalized AI Pacing**: Leverages Gemini AI to logically structure topics, revision windows, and pre-exam practice drills based on cognitive retention principles.
- **Real Authentication & Email OTP**: Complete end-to-end user authentication with 6-digit email OTP verification, password hashing, and persistent session tokens.
- **Dynamic Task Progress & Interactive Checklists**: Real-time optimistic task completion controls, animated progress bars, and radial progress rings.
- **PostgreSQL Database Schema & Row Level Security (RLS)**: Enforces strict data ownership so students can only view and mutate their own plans and tasks. Foreign key cascade deletes ensure clean state.
- **Student-Friendly Dark Mode**: Instant seamless toggle between crisp light mode and late-night dark mode with localStorage persistence.
- **Single-Click Demo Seeding**: Immediately populates a comprehensive sample study plan for testing and grading without manual entry.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Vite middlewares for integrated full-stack development
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash) with structured JSON output and schema validation
- **Database Architecture**: Persistent schema for Users, Study Plans, Topics, and Study Tasks with full Supabase PostgreSQL and RLS scripts
- **Deployment**: Vercel ready with `vercel.json` SPA rewrite rules

---

## 📦 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI Study Plan generation
GEMINI_API_KEY="your-gemini-api-key"

# Port (default: 3000)
PORT=3000

# Optional: External Supabase instance (if connecting directly to Supabase)
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup & Row Level Security

If deploying with an external Supabase PostgreSQL project:

1. Open your project in the [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor**.
3. Run the schema script located in `/supabase/schema.sql` to create `study_plans`, `topics`, and `study_tasks` tables.
4. Run the RLS policy script in `/supabase/rls.sql` to enable Row Level Security and lock down queries to `auth.uid() = user_id`.

---

## 🚢 Production Deployment (Vercel)

The codebase includes `vercel.json` with SPA routing rewrites to ensure dynamic routes (`/study-plans/:id`, `/verify`, `/dashboard`, etc.) never produce 404 errors on direct navigation or refresh.

```bash
npm run build
```

---

## 📜 License

MIT License · Built with care by **Cyber**.
