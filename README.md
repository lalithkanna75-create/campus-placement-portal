# NexPlacement — Campus Recruitment & Placement Drive Portal

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://campus-placement-portal-phi.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Render-46E3B7?style=for-the-badge&logo=render)](https://nexplacement-api.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Tests](https://img.shields.io/badge/Tests-28%2F28_Passing-success?style=for-the-badge&logo=node.js)](https://github.com/lalithkanna75-create/campus-placement-portal)

**NexPlacement** is an enterprise-grade, secure full-stack campus recruitment and placement drive portal engineered for universities, recruiters, and students. Built on **React 18 + Vite**, **Node.js/Express**, **Prisma ORM**, and **Supabase PostgreSQL**, it streamlines the entire campus hiring lifecycle—from public drive discovery and automated eligibility calculation to multi-stage interview scheduling, protected PDF resume ingestion, and 1-click applicant roster reports.

---

## 🚀 Live Production Deployments

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://campus-placement-portal-phi.vercel.app](https://campus-placement-portal-phi.vercel.app) |
| **Backend REST API** | **Render** | [https://nexplacement-api.onrender.com](https://nexplacement-api.onrender.com) |
| **API Health Check** | **Render** | [https://nexplacement-api.onrender.com/api/health](https://nexplacement-api.onrender.com/api/health) |
| **Relational Database** | **Supabase** | `PostgreSQL 15 (AWS ap-south-1)` |

---

## 👥 Public vs Authenticated Portal Experience

NexPlacement enforces a strict separation between unauthenticated public exploration and role-authorized workspace environments:

```
                          ┌────────────────────────┐
                          │   Unauthenticated      │
                          │   Public Visitor       │
                          └───────────┬────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ Public Landing & Drives   │             │   Sign In / Registration  │
   │ - Browse active drives    │             │ - Verified Student signup │
   │ - Search & branch filters │             │ - Authenticated session   │
   │ - No student data exposed │             └─────────────┬─────────────┘
   └───────────────────────────┘                           │
                                                           │ (RBAC via JWT)
                                  ┌────────────────────────┼────────────────────────┐
                                  ▼                        ▼                        ▼
                     ┌────────────────────────┐┌────────────────────────┐┌────────────────────────┐
                     │   Student Dashboard    ││   Recruiter Console    ││ Placement Admin Suite  │
                     │ - Academic standing    ││ - Authored drive mgmt  ││ - University analytics │
                     │ - Apply to drives      ││ - Candidate pipeline   ││ - Global roster export │
                     │ - Protected resume     ││ - Interview scheduling ││ - System audit metrics │
                     │ - Stage tracker        ││ - CSV applicant export ││ - Full drive controls  │
                     └────────────────────────┘└────────────────────────┘└────────────────────────┘
```

### 1. Unauthenticated Public Landing (`PublicLanding.jsx`)
- **Public Drive Exploration:** Guests can browse active campus recruitment drives, search by role or company, and filter by eligible academic departments.
- **Strict Privacy Barrier:** Public visitors **cannot** view any personal student metrics, CGPAs, active backlogs, application rosters, candidate resumes, or private applicant data.
- **Calls to Action:** Includes dedicated **"Sign In"** and **"Register Student Account"** actions to enter authenticated workflows.

### 2. Authenticated Student Dashboard (`StudentDashboard.jsx`)
- **Academic Standing & KPIs:** Real-time display of verified CGPA, department, and backlog count.
- **Automated Eligibility Engine:** Live evaluation against drive parameters (`ELIGIBILITY MET` vs specific restriction reasons).
- **Protected Resume Management:** Drag-and-drop PDF upload pipeline with secure streaming links.
- **Application Stage Tracker:** Interactive timeline tracking stage progression (`APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `OFFERED`, `REJECTED`) with interview schedule details and recruiter feedback.

### 3. Authenticated Recruiter Console (`ApplicantTable.jsx`)
- **Authored Drive Management:** Create, update, and manage job postings owned by the recruiter.
- **Candidate Roster Pipeline:** Review applicants, inspect qualifications, and stream resumes exclusively for drives authored by that recruiter.
- **Interview Scheduling & Feedback Modal:** Schedule interview dates/times with meeting links and stage transition notes.
- **1-Click CSV Export:** Export candidate rosters for authored drives.

### 4. Placement Director / Admin Suite
- **University-Wide Intelligence:** Total active drives, global applications, average CTC package, and overall placement rate metrics.
- **Cross-Drive Roster Oversight:** Full administrative access across all corporate recruitment drives.

---

## 🔒 Security & Privacy Architecture

NexPlacement adheres to defense-in-depth security principles across API design, authentication, authorization, and data isolation:

```
[ Incoming Request ]
        │
        ▼
[ Strict CORS Allowlist ] ────── (Blocked: 403 Forbidden)
        │
        ▼
[ Security Headers (Helmet) & Compression ]
        │
        ▼
[ JWT Verification (authMiddleware) ] ── (Missing/Expired: 401 Unauthorized)
        │
        ▼
[ RBAC Authorization (authorize) ] ──── (Wrong Role: 403 Forbidden)
        │
        ▼
[ Ownership & Access Control ] ──────── (Cross-Drive/Unauthorized: 403 Forbidden)
        │
        ▼
[ Zod Schema Validation ] ───────────── (Invalid payload: 400 Bad Request)
        │
        ▼
[ Controller & Database (Prisma) ]
```

### 1. Public Registration Security & Privilege Escalation Prevention
- Public registration (`POST /api/auth/register`) strictly forces the `STUDENT` role on all new accounts.
- Any attempt to supply `"role": "ADMIN"` or `"role": "RECRUITER"` in public requests is ignored. Recruiter and Admin provisioning is strictly confined to secure database seeds or administrative workflows.

### 2. Recruiter Ownership Authorization
- Recruiters can view applicant rosters (`GET /api/applications/drive/:driveId`), update candidate stages (`PATCH /api/applications/:id/status`), and export applicant CSVs (`GET /api/drives/:id/export-csv`) **only for drives they authored** (`drive.createdById === req.user.id`).
- Unauthorized recruiter access across unowned drives is rejected with `403 Forbidden`.
- Administrators retain comprehensive oversight across all drives.

### 3. Applicant Data Privacy & PII Protection
- Public drive discovery endpoints (`GET /api/drives` and `GET /api/drives/:id`) return only public drive parameters and an aggregated `applicantsCount`.
- Applicant names, emails, roll numbers, application statuses, feedback notes, and resume links are completely excluded from unauthenticated endpoints.

### 4. Protected Resume Ingestion & Authorized Streaming
- Public `/uploads` static file serving is **disabled**. Uploaded resumes cannot be accessed by guessing URLs.
- Resumes are served through an authenticated streaming route: `GET /api/students/resume/:userId`.
- Access is strictly restricted to:
  1. The **owning student** (`req.user.id === userId`).
  2. An **authorized recruiter** whose drive the student has applied to.
  3. A **placement administrator**.
- Unauthorized requests return `401 Unauthorized` or `403 Forbidden`.

### 5. CORS Allowlist & JWT Hardening
- Express CORS middleware uses an explicit allowlist from `CORS_ORIGIN` (supporting local dev origins and production Vercel/Render domains). Unlisted origins are rejected.
- Production startup validates that `JWT_SECRET` or `JWT_ACCESS_SECRET` is present; the server fails safely with a descriptive fatal error if missing in production.

### 6. Strict Zod Schema Validation
- Drive modifications (`PUT /api/drives/:id`) and student profile updates (`POST /api/students/profile`) validate input shapes with Zod schemas and extract explicit database fields, eliminating raw `req.body` spreading.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS v3, Lucide Icons, PostCSS, Autoprefixer |
| **Backend API** | Node.js (v18+), Express 4, Prisma ORM 5.22, Zod Schema Validation |
| **Database** | PostgreSQL 15 via Supabase (Connection Pooling + Direct Access) |
| **Authentication** | JWT (JSON Web Tokens) with strict RBAC, Bcrypt.js (Salt rounds: 10) |
| **File Storage** | Multer Local Disk Ingestion with Cloud Storage Adapter support |
| **Notifications** | Nodemailer (Ethereal Dev Mode / Production SMTP) |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`), Supertest |
| **Deployment** | Vercel (Frontend SPA with rewrites), Render (Backend Web Service), Supabase |

---

## 📡 REST API Reference

| Method | Endpoint | Access Level | Authorized Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Anyone | System uptime & live PostgreSQL connectivity ping |
| `POST` | `/api/auth/register` | Public | Anyone | Register student account (strictly forces `STUDENT` role) |
| `POST` | `/api/auth/login` | Public | Anyone | User authentication & JWT issuance |
| `GET` | `/api/auth/me` | Authenticated | All logged-in users | Retrieve current user profile and role |
| `GET` | `/api/students/profile` | Protected | `STUDENT` | Retrieve current student academic profile |
| `POST` | `/api/students/profile` | Protected | `STUDENT` | Upsert student CGPA, department, roll number, backlogs (Zod validated) |
| `POST` | `/api/students/upload-resume` | Protected | `STUDENT` | Upload sanitized PDF resume (Max 5MB) |
| `GET` | `/api/students/resume/:userId` | Protected | Owner `STUDENT`, Hiring `RECRUITER`, `ADMIN` | Authenticated PDF resume streaming endpoint |
| `GET` | `/api/drives` | Public | Anyone | List active placement drives (sanitized, no applicant PII) |
| `GET` | `/api/drives/:id` | Public | Anyone | Get drive details with aggregated applicant count |
| `POST` | `/api/drives` | Protected | `RECRUITER`, `ADMIN` | Author and publish a new placement drive |
| `PUT` | `/api/drives/:id` | Protected | Author `RECRUITER`, `ADMIN` | Update placement drive details (Zod validated) |
| `DELETE` | `/api/drives/:id` | Protected | Author `RECRUITER`, `ADMIN` | Delete placement drive |
| `GET` | `/api/drives/:id/export-csv` | Protected | Author `RECRUITER`, `ADMIN` | 1-Click CSV export of applicants for an authored drive |
| `POST` | `/api/applications/apply/:driveId` | Protected | `STUDENT` | Apply to drive (enforces CGPA & branch eligibility) |
| `GET` | `/api/applications/my-applications` | Protected | `STUDENT` | Fetch authenticated student's applications & stage history |
| `GET` | `/api/applications/drive/:driveId` | Protected | Author `RECRUITER`, `ADMIN` | Fetch candidate roster for an authored drive |
| `PATCH` | `/api/applications/:id/status` | Protected | Author `RECRUITER`, `ADMIN` | Update candidate stage, interview slot & feedback notes |

---

## 🧪 Testing & Verification

The repository includes comprehensive automated test suites covering security, authorization, and data isolation.

### Running Backend Tests
```bash
cd server
npm test
```

### Test Suite Summary (28/28 Passing)

| Test File | Category | Tests | Status | Description |
| :--- | :--- | :---: | :---: | :--- |
| `tests/auth.test.js` | **Public Registration Security** | 3 | `PASS` | Proves requests with `"role": "ADMIN"` or `"role": "RECRUITER"` are forced to `STUDENT`. |
| `tests/recruiter-ownership.test.js` | **Recruiter Ownership Authorization** | 8 | `PASS` | Proves recruiters cannot view rosters, update statuses, or export CSVs for drives they did not create (`403 Forbidden`). |
| `tests/drive-privacy.test.js` | **Drive Detail Applicant Data Privacy** | 2 | `PASS` | Proves anonymous `GET /api/drives/:id` requests never expose applicant names, emails, roll numbers, or resumes. |
| `tests/resume-protection.test.js` | **Protected Resume Download & RBAC** | 8 | `PASS` | Proves unauthenticated users (`401`), unrelated students (`403`), and unrelated recruiters (`403`) cannot access resumes, while owners, hiring recruiters, and admins are authorized. Direct static `/uploads` returns `404`. |
| `tests/jwt-hardening.test.js` | **CORS & JWT Hardening** | 3 | `PASS` | Proves unlisted CORS origins are rejected with `403` while configured origins succeed. |
| `tests/validation-cleanup.test.js` | **Validation & Schema Hardening** | 4 | `PASS` | Proves invalid date strings or malformed payloads in drive and profile updates are rejected with `400`. |

```
✔ Public Registration Security - 3/3 passed
✔ Recruiter Ownership Authorization - 8/8 passed
✔ Drive Detail Applicant Data Privacy - 2/2 passed
✔ Protected Resume Download & Authorization - 8/8 passed
✔ CORS and JWT Hardening - 3/3 passed
✔ Validation & Schema Hardening - 4/4 passed

ℹ tests 28
ℹ pass 28
ℹ fail 0
```

### Running Frontend Production Build
```bash
cd client
npm run build
```
*Output: `1830 modules transformed. dist/ built with 0 errors.`*

---

## 👥 Seeded Showcase Accounts

> [!WARNING]
> The credentials below are **DEMO / SHOWCASE ACCOUNTS** seeded exclusively for local development, evaluation, and portfolio demonstration. Do not reuse these passwords in production environments.

The database seed script (`server/prisma/seed.js`) populates multi-bracket candidate profiles, realistic company drives, and multi-stage applications:

| Role | Email | Password | Showcase Profile / Testing Scenario |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nexplacement.dev` | `Admin@123` | University Placement Director • Global Analytics & Roster Management |
| **Recruiter** | `recruiter.amazon@nexplacement.dev` | `Password@123` | Amazon Recruiter • AWS Systems Engineer Drive (26 LPA) |
| **Recruiter** | `recruiter.microsoft@nexplacement.dev` | `Password@123` | Microsoft Recruiter • Azure Core SDE Drive (28 LPA) |
| **Student** | `alex.sharma@student.edu` | `Password@123` | 9.2 CGPA • CSE • Eligible for all Tier-1 drives • Amazon Offer |
| **Student** | `priya.patel@student.edu` | `Password@123` | 8.4 CGPA • IT • Standard Tier-1 Eligibility • Interview Scheduled |
| **Student** | `rohan.varma@student.edu` | `Password@123` | 7.2 CGPA • ECE • 1 Backlog • Partial Eligibility Warning Test |
| **Student** | `rahul.kumar@student.edu` | `Password@123` | 6.1 CGPA • Mechanical • 2 Backlogs • Criteria Restriction Block Test |
| **Student** | `new.student@student.edu` | `Password@123` | Fresh Student Account • Profile Onboarding Flow Test |

---

## 📁 Repository Directory Structure

```text
campus-placement-portal/
├── client/                               # React 18 + Vite Frontend SPA
│   ├── public/                           # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicantTable.jsx        # Candidate roster & recruiter status update modal
│   │   │   ├── ApplicationStepper.jsx    # Student multi-stage timeline tracker
│   │   │   ├── AuthModal.jsx             # 1-Click demo login & student registration modal
│   │   │   ├── CompanyLogo.jsx           # Inline SVG company brand resolver
│   │   │   ├── DriveCard.jsx             # Placement drive card with eligibility tag
│   │   │   ├── ErrorBoundary.jsx         # Root runtime error boundary
│   │   │   ├── MetricsRibbon.jsx         # Academic & placement KPI analytics ribbon
│   │   │   ├── Navbar.jsx                # Brand mark, health probe & authenticated user pill
│   │   │   ├── ProfileSetupModal.jsx     # Academic onboarding & profile modal
│   │   │   └── ResumeUploadCard.jsx      # PDF resume uploader & stream preview
│   │   ├── pages/
│   │   │   ├── PublicLanding.jsx         # Public visitor landing page (no student PII)
│   │   │   └── StudentDashboard.jsx      # Authenticated student workspace
│   │   ├── services/
│   │   │   ├── api.js                    # Fetch client with JWT interceptor
│   │   │   └── mockData.js               # Initial fallback types
│   │   ├── App.jsx                       # Authenticated session router & modal manager
│   │   ├── index.css                     # Modern Light Theme CSS design system
│   │   └── main.jsx                      # React DOM entry wrapped in ErrorBoundary
│   ├── vercel.json                       # SPA routing rewrite rules for Vercel
│   └── vite.config.js                    # Vite build configuration
├── server/                               # Node.js + Express Backend API
│   ├── prisma/
│   │   ├── schema.prisma                 # Data models (User, StudentProfile, JobDrive, Application)
│   │   └── seed.js                       # Comprehensive database seed script
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js                 # Singleton Prisma client
│   │   ├── controllers/
│   │   │   ├── applicationController.js  # Stage transitions, ownership checks & email alerts
│   │   │   ├── authController.js         # Student registration & JWT auth
│   │   │   ├── driveController.js        # Drive CRUD, CSV export & privacy filters
│   │   │   └── studentController.js      # Profile upsert & authenticated resume streaming
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT verification & RBAC authorization
│   │   │   ├── errorHandler.js           # Centralized JSON error formatting
│   │   │   └── uploadMiddleware.js       # Multer PDF filter & disk storage
│   │   ├── routes/
│   │   │   ├── applicationRoutes.js      # /api/applications
│   │   │   ├── authRoutes.js             # /api/auth
│   │   │   ├── driveRoutes.js            # /api/drives
│   │   │   ├── health.routes.js          # /api/health
│   │   │   └── studentRoutes.js          # /api/students
│   │   ├── utils/
│   │   │   └── emailService.js           # Nodemailer stage update alerts
│   │   ├── app.js                        # Express app with Helmet, CORS & Compression
│   │   └── server.js                     # HTTP listener with DB connection verification
│   ├── tests/                            # Automated security & RBAC test suites
│   │   ├── auth.test.js                  # Public registration security test
│   │   ├── drive-privacy.test.js         # Applicant PII privacy test
│   │   ├── jwt-hardening.test.js         # CORS allowlist & JWT hardening test
│   │   ├── recruiter-ownership.test.js   # Recruiter cross-drive ownership test
│   │   ├── resume-protection.test.js     # Protected resume download test
│   │   └── validation-cleanup.test.js    # Input schema validation test
│   ├── uploads/resumes/
│   │   └── .gitkeep                      # Upload directory placeholder
│   └── package.json                      # Server scripts, dependencies & test command
└── README.md                             # Project documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$
- Supabase PostgreSQL database instance

### 1. Clone the Repository
```bash
git clone https://github.com/lalithkanna75-create/campus-placement-portal.git
cd campus-placement-portal
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment configuration
cp .env.example .env
```

Configure your `server/.env` variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Initialize database & seed showcase data:
```bash
# Push schema to database
npx prisma db push

# Populate demo accounts and placement drives
node prisma/seed.js

# Start backend dev server
npm run dev
```
*Backend runs on `http://localhost:5000` (Health Probe: `http://localhost:5000/api/health`)*

### 3. Frontend Setup
```bash
# In a separate terminal:
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔐 Recent Security & Architecture Improvements

The following improvements were implemented and verified on the `security-polish` branch:

1. **Public Registration Security (`1dcb7fd`)**: Enforced `STUDENT` role strictly in `authController.js`, eliminating privilege escalation via public registration payloads.
2. **Recruiter Ownership Authorization (`43c69cd`)**: Enforced drive ownership checks (`drive.createdById === req.user.id || req.user.role === 'ADMIN'`) on applicant rosters, status transitions, and CSV exports, returning `403 Forbidden` on cross-drive access.
3. **Applicant Data Privacy (`d1cdcd2`)**: Removed candidate PII (names, emails, roll numbers, feedback, resumes) from public drive detail endpoints, exposing only aggregated `applicantsCount`.
4. **Resume Privacy Pipeline (`2942849`)**: Removed unauthenticated `/uploads` static file serving and added protected streaming endpoint `GET /api/students/resume/:userId` with RBAC authorization. Removed tracked PDF files from git.
5. **CORS & JWT Hardening (`f860490`)**: Enforced an explicit `CORS_ORIGIN` allowlist rejecting unlisted origins and added fail-safe production startup checks for missing JWT secrets.
6. **Frontend Authenticated Role Binding (`f7f3f76`)**: Replaced automatic demo login with authenticated session management via `GET /api/auth/me` and added `AuthModal.jsx` for 1-click seeded login.
7. **Module Consolidation & Validation (`0149f56`)**: Deleted 10 unused duplicate legacy controller/route files and added Zod schema validation to drive and profile updates.
8. **Public Landing Page Separation (`60ecafc`)**: Created dedicated `PublicLanding.jsx` for unauthenticated visitors, completely removing mock student academic data and resume upload cards from public view while preserving live drive exploration.

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
