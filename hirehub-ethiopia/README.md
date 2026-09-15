# HireHub Ethiopia — ሀይርሀብ ኢትዮጵያ

A full-stack job & internship platform connecting Ethiopian students and job
seekers with employers. Includes job search & filtering, applications with a
status timeline, employer dashboards, an admin panel, and AI-assisted CV
matching — backed by a real, persistent MySQL database.

## Project structure

```
hirehub-ethiopia/
├── frontend/     React + Vite + TypeScript + Tailwind (client)
├── backend/      Node.js + Express + TypeScript (REST API + MySQL)
├── database/     schema.sql — the MySQL schema the backend actually runs on
├── .gitignore
└── README.md
```

The frontend and backend are two independent apps with their own
`package.json`, and run as two separate processes.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, Axios, Motion (Framer Motion)
- **Backend:** Node.js, Express, JWT auth, bcrypt, Multer (file uploads), Nodemailer, pdf-parse
- **Database:** MySQL 8, accessed via `mysql2`'s promise pool (`backend/src/config/db.ts`). All data is real, persistent SQL — nothing is held in memory between requests.
- **AI:** Google Gemini for CV-to-job matching, called only from the backend (the API key never reaches the browser). If no key is configured, the backend automatically uses a transparent rule-based skill matcher instead of failing.

## Database design

Core entities — `users`, `student_profiles`, `companies`, `jobs`,
`applications`, `saved_jobs`, `notifications`, `categories`, `locations` —
are normalized relational tables with foreign keys (see
`database/schema.sql`). Repeatable sub-data that has no independent identity
outside its parent record — a job's required skills, a profile's education
entries, an application's status timeline — is stored as native MySQL
`JSON` columns rather than separate join tables. This keeps the schema
small enough to actually read in one sitting while still being genuinely
relational where it matters (search, filtering, foreign keys, uniqueness
constraints). Denormalized display fields (e.g. an application's
`student_name` or `job_title`) are **not** stored — they're reconstructed
via `JOIN` at read time in `backend/src/db/store.ts`, so they can never go
stale.

## Running locally

You'll run **three things**: MySQL, the backend API, and the frontend dev
server.

### 1. Database

Create the database and load the schema (only needs to be done once):

```bash
mysql -u root -e "CREATE USER IF NOT EXISTS 'hirehub_user'@'localhost' IDENTIFIED BY 'secure_password'; GRANT ALL PRIVILEGES ON hirehub_ethiopia.* TO 'hirehub_user'@'localhost'; FLUSH PRIVILEGES;"
mysql -u root < database/schema.sql
```

(Adjust the username/password if you'd rather use your own — just match
them in `backend/.env` in the next step.)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # defaults already match the DB setup above
npm run seed               # loads realistic Ethiopian demo data (users, jobs, companies, applications...)
npm run dev                 # starts the API on http://localhost:3000
```

`npm run seed` truncates every table and reloads the demo dataset — safe to
re-run any time you want to reset to a clean state. It's also exposed at
runtime as `POST /api/admin/reset-data` for admins.

### 3. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev                # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` and
`/uploads/*` requests to the backend on port 3000 (see `frontend/vite.config.ts`),
so the frontend's `axios` calls can keep using relative paths like `/api/jobs`.

If your backend runs on a different port or host, set `BACKEND_URL` before
starting the frontend, e.g. `BACKEND_URL=http://localhost:4000 npm run dev`.

### Demo accounts

`POST /api/auth/demo-login` with `{ "role": "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | "STUDENT_DESIGNER" }`
logs you in instantly as a seeded demo user, for quick evaluation without
registering. All seeded accounts share the password `password123`.

## Production build

```bash
# Backend
cd backend
npm run build     # bundles to backend/dist/server.cjs
npm start

# Frontend
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # serve the build locally to sanity-check it
```

In production, deploy `frontend/dist` as static files behind a CDN/static
host or reverse proxy, and point it at your deployed backend's URL. Set
`FRONTEND_URL` in the backend's `.env` to that deployed frontend origin so
CORS allows it, and point `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` (or
`DATABASE_URL`) at your production MySQL instance.

## API overview

All endpoints are prefixed with `/api`. Key groups:

- `auth` — register, login, demo-login, me
- `jobs` — list/search/filter, get by id, create/update/delete, apply, save/unsave, category/location lookups, autocomplete suggestions
- `applications` — list, get by id, update status, withdraw
- `saved-jobs` — list saved jobs
- `profile` — get/update job-seeker profile, view another candidate's profile
- `resumes` — upload CV (PDF, extracted to text), parse pasted text
- `companies` — list, get by id, update
- `ai` — `/ai/cv-match` — AI (or rule-based fallback) CV-to-job match
- `notifications` — list, mark one/all as read
- `admin` — platform stats, users, companies (incl. approval), jobs (incl. featured toggle), reset demo data

## Security notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored,
  and `password_hash` is never selected as part of any `User` object that
  could be returned to a client (see `USER_PUBLIC_COLUMNS` in `store.ts`).
- JWTs carry `user_id` and `role`; the backend re-checks the role
  server-side on every protected route — the frontend's claimed role is
  never trusted.
- `GEMINI_API_KEY`, `JWT_SECRET`, and SMTP/DB credentials live only in
  `backend/.env`, which is git-ignored. Only `.env.example` (placeholders)
  is committed.
- All SQL queries use parameterized placeholders (`?`) — no string-built
  SQL — so user input can't be used for SQL injection.
- Uploaded CVs are stored under `backend/uploads/`, which is also
  git-ignored, since resumes contain personal data.

## Known limitations

- AI matching quality depends on whether `GEMINI_API_KEY` is configured;
  otherwise you get the rule-based fallback score, which is a reasonable but
  simpler keyword-overlap heuristic.
- Email sending requires real SMTP credentials; without them, notifications
  are logged to the backend console instead of delivered.
- Timestamp fields come back from MySQL as `YYYY-MM-DD HH:MM:SS` strings
  rather than full ISO-8601 (`...T...Z`). `new Date(...)` parses both fine
  for display purposes, but if you need timezone-exact comparisons, be
  aware of the difference.
- One employer `user_id` can technically own more than one `companies` row
  in the schema (no `UNIQUE` constraint on `companies.user_id`); the app
  only ever operates on the first one found. This mirrors a pre-existing
  assumption in the original app logic rather than a new limitation.
