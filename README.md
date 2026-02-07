# ReachInbox Email Scheduler

A production-grade email scheduler service with a clean dashboard.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, BullMQ, Redis, PostgreSQL, Prisma.
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons.
- **Queue:** BullMQ for reliable job scheduling and rate limiting.
- **Email:** Ethereal Email (Fake SMTP).

## Features
- ✅ **Google OAuth Login:** Secure authentication using real Google OAuth.
- ✅ **Persistent Scheduling:** BullMQ delayed jobs ensure emails are sent at the right time even after server restarts.
- ✅ **Rate Limiting:** Global and per-sender hourly limits (Redis-backed).
- ✅ **Worker Concurrency:** Configurable parallel processing of email jobs.
- ✅ **Delay Between Emails:** Minimum delay between individual sends to mimic provider throttling.
- ✅ **CSV Upload:** Parse email lists from CSV/text files.
- ✅ **Modern Dashboard:** View scheduled and sent emails with status tracking.

## Architecture Highlights
- **Persistence:** All campaigns and jobs are stored in PostgreSQL. Job states are tracked in Redis via BullMQ.
- **Idempotency:** Each job has a unique ID tied to the DB record. Status is checked before sending to prevent duplicates.
- **Rate Limiting:** Implemented using Redis INCR with hour-based keys. When limits are hit, jobs are rescheduled for the next hour window.
- **Scalability:** Multiple BullMQ workers can run in parallel without race conditions thanks to Redis atomicity.

## How to Run (Local - No Docker)

To run this application without Docker, you will need **Redis** (port 6379) installed and running on your machine. The database has been switched to **SQLite** for easier local setup (no PostgreSQL installation or password required).

### 1. Prerequisites
- **Redis:** Ensure a Redis server is running at `localhost:6379`.
  - *Windows tip:* If you don't have Redis, you can install the [Redis for Windows](https://github.com/tporadowski/redis/releases) or use WSL.

### 2. Quick Start
From the root directory, you can run:
```bash
# 1. Install all dependencies
npm run install:all

# 2. Setup SQLite Database (Backend)
cd backend
npx prisma generate
npx prisma migrate dev --name init

# 3. Start both Frontend & Backend
cd ..
npm run dev
```

### 3. Manual Setup (Two Terminals)

**Terminal 1: Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Configuration
- **Backend:** Update `backend/.env` with your `DATABASE_URL`, `JWT_SECRET`, and Google OAuth credentials.
- **Frontend:** Update `frontend/.env.local` with your `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Usage
1. Login via Google.
2. Click **"Auto-Generate Ethereal"** in the Compose modal to get a test sender account.
3. Upload a CSV of emails or enter them manually.
4. Set your subject, body, and start time.
5. Click **"Schedule Campaign"**.
6. Monitor the status in the Scheduled and Sent tabs.

---
Built with ❤️ for ReachInbox.
