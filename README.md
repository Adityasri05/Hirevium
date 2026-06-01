# 🧠 HIREIQ — AI Hiring Intelligence Operating System

> **Grand Winner Entry** • Engineered for modern recruitment pipelines, simulating real-world elite hiring practices (like Google, Amazon, and Meta). Powered by **Gemini 2.5 Flash Lite** & **FastAPI** & **Next.js 16**.

---

## 🌟 Pitch & Vision

HIREIQ transforms traditional static interview preparation and talent screening from simple **"Question $\rightarrow$ Answer $\rightarrow$ Feedback"** chat loops into a highly comprehensive, fully automated **AI Hiring Intelligence Operating System**. 

It serves two target demographics:
1. **For Candidates**: Provides hyper-personalized, adaptive technical simulations, live pressure metrics, communication reviews, and dynamic coach roadmaps that guide targeted improvement sprints.
2. **For Recruiters**: Auto-screens candidates, parses skill confidence graphs with timeline verifications, matches job requirements, and generates deep hiring verdicts—saving hundreds of manual hours.

---

## 🚀 Key Features

* **Resume Intelligence**: Decodes technical skills, validates timelines, reviews project complexities, and builds a comprehensive talent verification matrix.
* **Job Description Analyzer**: Matches candidate profiles against JDs, calculating accurate match ratios and surfacing missing critical stack components.
* **Interactive Live Interview Room**: Uses a dynamic **Adaptive Difficulty Controller** (adjusting queries from Easy $\rightarrow$ Expert in real time based on candidate answers) and evaluates technical accuracy and communication.
* **Early Termination Guard**: Prevents waste by automatically terminating simulations if fundamental skill gaps are flagged consecutively.
* **AI Career Coach**: Generates granular, modular study sprints (7 to 90-day horizons) dynamically mapped to candidate weaknesses.
* **Recruiter workspace**: Renders unified candidate pipelines with automated hiring manager verdicts (Reject $\rightarrow$ Strong Hire) and verification confidence levels.
* **AI Copilot Sidebar**: A persistent conversational assistant available across all dashboard tabs, providing tailored preparation guidance using candidate context.

---

## 🛠️ Technological Stack

| Tier | Technologies Used |
|---|---|
| **Frontend** | React 19, Next.js 16, TypeScript, Recharts, Lucide, Framer Motion, Tailwind CSS |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0 ORM, SQLite |
| **AI Layer** | Gemini 2.5 Flash Lite, Direct Google GenAI Client, Structured JSON Schema parsing |
| **Crypto & Auth** | JWT Tokens, Direct Salted Bcrypt Hashing |

---

## 📂 Architecture Overview

```text
HireIQ/
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router Views (Dashboard, Live Room, JD, Coach, Recruiter, Auth)
│   ├── components/               # Layout elements (Sticky Navigation Header, Sidebar, AI Copilot)
│   └── globals.css               # Styling System
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── main.py               # Lifespan app entry, CORS, and routers mounting
│   │   ├── database.py           # Async SQLAlchemy Engine & SessionLocal
│   │   ├── models/               # Declarative DB Models (Users, Resumes, Interviews, Badges, etc.)
│   │   ├── schemas/              # Pydantic Schemas
│   │   ├── routers/              # API Route Handlers
│   │   ├── agents/               # Gemini AI Agents (Base Agent + 14 Specialized Engines)
│   │   ├── services/             # Core Core engines (Interview orchestrator, Scoring, Coaching)
│   │   └── utils/                # Resilient file parsers and direct bcrypt encoders
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment blueprint
└── README.md                     # Hackathon Documentation
```

---

## ⚡ Quick Start & Run Guidelines

### Prerequisites
* Python 3.12+ (Python 3.13 recommended)
* Node.js 18+ (Node.js 20 recommended)
* Google Gemini API Key

---

### 1. Run the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your environment variables:
   * Create a `.env` file from the example:
     ```bash
     cp .env.example .env
     ```
   * Set your Gemini API key in `.env`:
     ```env
     GOOGLE_API_KEY=your_gemini_api_key_here
     ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   The backend API will initialize and run on `http://localhost:8000`.

---

### 2. Run the Next.js Frontend

1. Open a new terminal in the root directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will initialize and run on `http://localhost:3000`.

---

## 🏆 Hackathon Winning Design Rationale

* **Zero-Friction Prototype Access**: Built robust local local-storage and database-backed fallbacks. Hackathon judges can click "Start AI Interview" on the landing page and immediately experience onboarding, resume parsing, and interactive mock interviews without mandatory account signup gates.
* **Direct Bcrypt Security**: Avoided standard passlib library initialization bugs on Python 3.13 by implementing direct, high-performance bcrypt hashing, ensuring stable API performance.
* **Hybrid Mock Fallbacks**: Includes a schema-compliant mock data generator in the base agent class. If the system API key experiences network latency or exhaustion, all dashboards, radars, and live interview rooms remain fully populated and premium, preventing display failures.
* **Premium UX/UI**: Leveraged custom HSL Tailored Hires palettes, deep dark spaces, clean border boundaries, glowing gradients, and Framer Motion spring micro-animations.

---

## 🚀 Production Deployment to Railway

HIREIQ is designed for out-of-the-box deployment to **Railway** using a double-service monorepo configuration (Next.js frontend + FastAPI backend).

### 1. Deploy the Backend Service (FastAPI)

1. Log into your [Railway Dashboard](https://railway.app) and click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select your `HireIQ` repository.
3. Once the service is created, go to its **Settings** and modify:
   * **Root Directory**: Set this to `backend`.
   * **Custom Start Command**: Railway will automatically detect the `Procfile` containing:
     ```bash
     web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
     ```
4. Go to **Variables** and add:
   * `GOOGLE_API_KEY`: *Your Google Gemini API Key*
   * `JWT_SECRET`: *A secure random string*
   * `DATABASE_URL`: *(Optional)* Defaults to self-contained SQLite file storage, perfect for zero-maintenance hackathon testing!
5. Generate a **Public Domain** under settings (e.g., `https://backend-production-xxxx.up.railway.app`). Copy this URL.

---

### 2. Deploy the Frontend Service (Next.js)

1. In the same Railway project, click **New** $\rightarrow$ **GitHub Repo** and select `HireIQ` again.
2. Once created, go to **Settings** and keep the **Root Directory** as `/` (default).
3. Go to **Variables** and add:
   * `NEXT_PUBLIC_API_URL`: Paste the public backend domain URL you copied in the previous step.
4. Railway will automatically compile the Next.js static files and launch the server. Generate a **Public Domain** for the frontend service to access your app online!



## Demo Video



https://github.com/user-attachments/assets/419801dd-a54d-4a48-9aaa-d6fb620bb375



