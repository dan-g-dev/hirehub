# HireHub Ethiopia

A full-stack job and internship platform that connects Ethiopian students and job seekers with employers. It includes job search and filtering, applications with a status timeline, employer and admin dashboards, and AI-assisted CV-to-job matching.

**Live demo:** https://hirehub-livid-omega.vercel.app

> The backend runs on free-tier hosting, so the first request after a period of inactivity can take a while. If data does not appear straight away, wait a moment and refresh.

<!-- Add 2-3 screenshots here, for example:
![Home page](docs/home.png)
![Employer dashboard](docs/employer-dashboard.png)
-->

## Try it without registering

Use the demo login buttons in the navigation bar to sign in instantly as a job seeker, employer, or admin. Seeded accounts also share the password `password123` (for example `yohannes@student.aau.edu.et` as a job seeker, `hr@ethiotech.et` as an employer, and `admin@hirehub.et` as an admin).

## Features

**Job seekers**
- Search and filter jobs and internships by category and location
- Apply to jobs and follow each application through a status timeline; withdraw an application
- Save jobs, manage a profile, and upload a PDF resume that is parsed to text
- AI-assisted CV-to-job match score (Google Gemini, with a rule-based fallback)
- Notifications

**Employers**
- Company profile and job posting
- View applicants and update application status

**Admins**
- Platform statistics
- Manage users, approve companies, moderate jobs, and feature jobs

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, TypeScript, JWT, bcrypt, Multer, pdf-parse, Nodemailer |
| Database | MySQL 8 (`mysql2` connection pool), 9 tables |
| AI | Google Gemini API, called only from the backend |
| Hosting | Frontend on Vercel, MySQL on Clever Cloud |

## Architecture notes

- **Role-based access:** JWTs carry the user ID and role, and the backend checks the role on every protected route instead of trusting the frontend.
- **Database:** `users`, `student_profiles`, `companies`, `jobs`, `applications`, `saved_jobs`, `notifications`, `categories`, and `locations` are relational tables with foreign keys. Job skills, profile education entries, and an application's status timeline are stored in MySQL `JSON` columns.
- **Queries:** All SQL uses parameterized placeholders.
- **AI matching:** The Gemini API key stays on the server. If no key is configured, the backend uses a simple skill-overlap matcher instead of failing.
- **Production config:** The frontend reads the backend URL from `VITE_API_URL`, so it works when the frontend and API are on different domains.

## Project structure

```
hirehub/
├── frontend/   React + Vite + TypeScript client
├── backend/    Express + TypeScript REST API
└── database/   schema.sql (and fix-charset.sql)
```

## Run locally

You need Node.js and MySQL 8.

**1. Database**

```bash
mysql -u root -e "CREATE USER IF NOT EXISTS 'hirehub_user'@'localhost' IDENTIFIED BY 'secure_password'; GRANT ALL PRIVILEGES ON hirehub_ethiopia.* TO 'hirehub_user'@'localhost'; FLUSH PRIVILEGES;"
mysql -u root < database/schema.sql
```

**2. Backend** (runs on http://localhost:3000)

```bash
cd backend
npm install
cp .env.example .env     # defaults match the database setup above
npm run seed             # loads demo users, companies, jobs, and applications
npm run dev
```

**3. Frontend** (runs on http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

In development, Vite proxies `/api` and `/uploads` to the backend. To use a different backend, set `BACKEND_URL` before `npm run dev`. For a deployed frontend, set `VITE_API_URL` to your API's `/api` URL.

## Environment variables (backend)

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Secret used to sign tokens |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection (or use `DATABASE_URL`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `GEMINI_API_KEY` | Optional, enables AI matching |
| `SMTP_*` | Optional, enables email notifications (otherwise logged to the console) |

## Known limitations

- Without a `GEMINI_API_KEY`, matching uses the simpler rule-based score.
- Without SMTP credentials, emails are logged instead of sent.
- No automated tests yet.
- Uploaded files are stored on the server's local disk, which free hosting may reset.
