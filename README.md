# Release Checklist

A single-page application that helps development teams track their release process with a shared, step-by-step checklist.

## Live Demo

> Deploy URLs go here after running on Vercel/Render/etc.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Styling | Custom CSS (no UI library) |

---

## Running Locally

### Option A — Docker Compose (recommended)

Requires Docker and Docker Compose installed.

```bash
git clone <repo-url>
cd release-checklist

docker compose up --build
```

- API: http://localhost:3001
- UI: http://localhost:5173 (run separately — see Option B)

### Option B — Manual setup

**Prerequisites:** Node.js ≥ 18, PostgreSQL instance (local or hosted)

#### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
npm install
npm run migrate      # creates the releases table
npm run dev          # starts API on port 3001
```

#### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if your API runs on a different port
npm install
npm run dev          # starts UI on port 5173
```

Open http://localhost:5173

---

## Database Schema

### Table: `releases`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PRIMARY KEY | Auto-increment |
| `name` | VARCHAR(255) | NOT NULL | Release name, e.g. "v2.4.0" |
| `release_date` | TIMESTAMPTZ | NOT NULL | Target release datetime |
| `additional_info` | TEXT | NULLABLE | Free-form notes |
| `completed_steps` | TEXT[] | DEFAULT '{}' | Array of completed step IDs |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Updated on every mutation |

**Status** is computed from `completed_steps` at query time:
- `planned` — no steps completed  
- `ongoing` — 1–9 steps completed  
- `done` — all 10 steps completed  

**Steps** are hard-coded constants (no DB table needed):

| ID | Label |
|----|-------|
| `code_freeze` | Code freeze |
| `unit_tests` | Unit tests passing |
| `integration_tests` | Integration tests passing |
| `staging_deploy` | Deployed to staging |
| `qa_sign_off` | QA sign-off |
| `release_notes` | Release notes written |
| `db_migrations` | DB migrations applied |
| `prod_deploy` | Deployed to production |
| `smoke_tests` | Smoke tests passing |
| `monitoring` | Monitoring & alerts verified |

---

## API Endpoints

### Releases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/releases` | List all releases (ordered by date) |
| `GET` | `/api/releases/:id` | Get a single release |
| `POST` | `/api/releases` | Create a new release |
| `PATCH` | `/api/releases/:id` | Update `additional_info` |
| `PATCH` | `/api/releases/:id/steps` | Toggle a step on/off |
| `DELETE` | `/api/releases/:id` | Delete a release |
| `GET` | `/api/releases/meta/steps` | List all step definitions |

### Request / Response examples

**POST /api/releases**
```json
{
  "name": "v2.4.0",
  "release_date": "2024-12-15T10:00:00Z",
  "additional_info": "Holiday release — extra care needed"
}
```

**PATCH /api/releases/:id/steps**
```json
{
  "step_id": "code_freeze",
  "completed": true
}
```

**Release object (response)**
```json
{
  "id": 1,
  "name": "v2.4.0",
  "release_date": "2024-12-15T10:00:00.000Z",
  "additional_info": "Holiday release",
  "completed_steps": ["code_freeze", "unit_tests"],
  "status": "ongoing",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## Running Tests

```bash
cd backend
# Set TEST_DATABASE_URL or DATABASE_URL in your .env
npm test
```

Tests use `supertest` to hit the Express app directly and run 6 integration tests covering the full CRUD lifecycle.

---

## Deployment

### Vercel (frontend)

```bash
cd frontend
npx vercel --prod
# Set VITE_API_URL to your API URL in Vercel env vars
```

### Render (backend)

1. Create a new Web Service pointing to `backend/`
2. Build command: `npm install`
3. Start command: `node src/migrate.js && node src/index.js`
4. Add `DATABASE_URL` and `FRONTEND_URL` environment variables

### Neon / Supabase / Railway (PostgreSQL)

Any hosted PostgreSQL works. Copy the connection string into `DATABASE_URL`.
