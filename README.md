# Studyforge — Your Intelligent Study & Academic Planner

> "Your AI-powered study plan, built around your time and your goals."  
> Designed & Engineered · **Made by Cyber**

Studyforge is an advanced academic planning platform that converts a student's subjects, topics, deadlines, and available study time into a realistic, structured, personalized study schedule—then tracks whether they actually follow it.

---

## 🚀 Key Features

- **Personalized Study Intelligence**: Leverages advanced language models to logically structure topics, revision windows, and pre-exam practice drills based on cognitive retention principles.
- **Real Authentication & Email OTP**: Complete end-to-end user authentication with 6-digit email OTP verification, password hashing, and persistent session tokens.
- **Dynamic Task Progress & Interactive Checklists**: Real-time optimistic task completion controls, animated progress bars, and radial progress rings.
- **Database Architecture & Security**: Enforces strict data ownership so students can only view and mutate their own plans and tasks. Foreign key cascade deletes ensure clean state.
- **Single-Click Demo Seeding**: Immediately populates a comprehensive sample study plan for testing and grading without manual entry.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Vite middlewares for integrated full-stack development
- **AI Engine**: `@google/genai` with structured JSON output and schema validation
- **Database Architecture**: Persistent schema for Users, Study Plans, Topics, and Study Tasks
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
# Required for AI plan generation
AI_API_KEY="your-ai-api-key"
VITE_AI_API_KEY="your-ai-api-key"

# Port (default: 3000)
PORT=3000
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment (Vercel)

The codebase includes `vercel.json` with SPA routing rewrites to ensure dynamic routes (`/study-plans/:id`, `/verify`, `/dashboard`, etc.) never produce 404 errors on direct navigation or refresh.

```bash
npm run build
```

---

## 📜 License

MIT License · Built with care by **Cyber**.
