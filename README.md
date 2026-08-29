# Campus Recruitment & Placement Drive Portal (NexPlacement)

A modern enterprise full-stack placement drive and recruitment portal built with **Node.js, Express, PostgreSQL, Prisma ORM, and React + Vite**.

---

## 🏗️ Project Architecture

```text
campus-placement-portal/
├── server/                           # Backend API
│   ├── prisma/
│   │   ├── schema.prisma             # Production relational schema (User, StudentProfile, JobDrive, Application)
│   │   └── seed.js                   # Database seed script (Admin, Recruiters, Students, Drives)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js             # Singleton Prisma Client instance
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # JWT Auth, Register, Login, Me
│   │   │   ├── drives.controller.js  # Job Drive postings & filtering
│   │   │   ├── applications.controller.js # Student eligibility & application workflow
│   │   │   └── profile.controller.js # Student academic profile
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification & RBAC authorization
│   │   │   ├── validate.middleware.js# Zod schema validation
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth
│   │   │   ├── drives.routes.js      # /api/drives
│   │   │   ├── applications.routes.js# /api/applications
│   │   │   ├── profile.routes.js     # /api/profile
│   │   │   └── health.routes.js      # /api/health
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Entry point with DB ping & graceful shutdown
│   ├── .env.example
│   └── package.json
└── client/                           # React + Vite Frontend
    ├── src/
    │   ├── App.jsx                   # Student, Recruiter & Admin interactive dashboards
    │   ├── services/mockData.js      # Mock and fallback dataset
    │   ├── index.css                 # Dark mode & glassmorphic design system
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection URL
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

Server will run at: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

### 2. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Client will run at: `http://localhost:5173`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System uptime & live PostgreSQL connectivity ping |
| `POST` | `/api/auth/register` | Public | User registration (Student / Recruiter / Admin) |
| `POST` | `/api/auth/login` | Public | User login & JWT cookie issuance |
| `GET` | `/api/auth/me` | Authenticated | Current user details |
| `GET` | `/api/drives` | Public | List all active placement drives with filters |
| `POST` | `/api/drives` | Recruiter, Admin | Post a new placement drive |
| `POST` | `/api/applications/apply` | Student | Apply to a drive (Validates CGPA, backlogs & branch) |
| `GET` | `/api/applications/my` | Student | Student's application tracker |
| `PATCH`| `/api/applications/:id/status` | Recruiter, Admin | Update candidate stage (Shortlisted, Offered, etc.) |
| `GET` | `/api/profile/me` | Student | Student's academic profile |
| `PUT` | `/api/profile` | Student | Upsert student CGPA, backlogs, skills, resume |
