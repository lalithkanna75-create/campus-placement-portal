# NexPlacement — Campus Recruitment & Placement Drive Portal

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://campus-placement-portal-phi.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Render-46E3B7?style=for-the-badge&logo=render)](https://nexplacement-api.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

**NexPlacement** is an enterprise-grade full-stack campus recruitment and placement management portal engineered for universities, recruiters, and students. Built on **React 18 + Vite**, **Node.js/Express**, **Prisma ORM**, and **Supabase PostgreSQL**, it streamlines the entire placement lifecycle from dynamic eligibility evaluation and resume ingestion to multi-round interview scheduling and 1-click applicant roster reports.

---

## 🚀 Live Production Deployments

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://campus-placement-portal-phi.vercel.app](https://campus-placement-portal-phi.vercel.app) |
| **Backend REST API** | **Render** | [https://nexplacement-api.onrender.com](https://nexplacement-api.onrender.com) |
| **API Health Check** | **Render** | [https://nexplacement-api.onrender.com/api/health](https://nexplacement-api.onrender.com/api/health) |
| **Relational Database** | **Supabase** | `PostgreSQL 15 (AWS ap-south-1)` |

---

## 🌟 Key Architectural Features

### 1. Multi-Tier Role-Based Access Control (RBAC)
- **Student Dashboard:** Real-time drive discovery, dynamic eligibility checker, resume PDF upload pipeline, and live application stage tracking.
- **Recruiter Console:** Placement drive authoring, candidate roster review, stage progression, interview slot scheduling, and 1-click CSV exports.
- **Placement Admin Suite:** Executive placement analytics, university-wide package metrics (Average CTC, Total Offers, Placement Rate), and global audit logs.

### 2. Dynamic Eligibility & Criteria Engine
- Computes candidate eligibility in real time against job drive parameters:
  - **Minimum CGPA Cutoff** (e.g., $\ge 8.0$)
  - **Allowed Academic Departments** (CSE, IT, ECE, Mechanical, etc.)
  - **Maximum Allowed Backlogs** (Strict $\le \text{threshold}$)
- Provides immediate visual feedback badges (`ELIGIBILITY MET`, `CGPA TOO LOW`, `BRANCH RESTRICTED`).

### 3. PDF Resume Upload Pipeline & Cloud Ingestion
- Integrated `Multer` disk storage and cloud storage adapters saving sanitized PDFs under 5MB.
- Automatic resume link binding to applicant profiles and recruiter review rosters.
- Profile onboarding guard: Prompts newly registered students to complete academic credentials before applying.

### 4. Recruiter Stage Update & Interview Scheduling Modal
- Interactive modal for advancing candidates across stages (`SHORTLISTED`, `INTERVIEW_SCHEDULED`, `OFFERED`, `REJECTED`).
- Built-in `datetime-local` interview picker and rich feedback notes textarea for meeting links (Zoom/Meet) and offer instructions.

### 5. Automated Notification Pipeline (Nodemailer)
- Asynchronous status change alerts dispatched via email on stage updates.
- Contains interview date/time, company details, direct action status badges, and recruiter feedback.

### 6. 1-Click Applicant Roster CSV Export Engine
- High-performance CSV generator built with `json2csv` enabling recruiters and placement officers to export complete candidate lists with 1 click.

### 7. Production Hardening & Error Boundary
- Root React `ErrorBoundary` preventing blank white screens on runtime exceptions.
- Hardened Express middleware stack: `helmet`, `compression`, dynamic multi-origin `cors`, and `/api/health` system probe.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS v3, Lucide Icons, PostCSS, Autoprefixer |
| **Backend** | Node.js (v18+), Express 4, Prisma ORM 5.22, Zod Schema Validation |
| **Database** | PostgreSQL 15 via Supabase (Connection Pooling + Direct DB Access) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js Password Hashing |
| **File Storage** | Multer Local Disk Ingestion with Cloud Storage Adapter support |
| **Email Service** | Nodemailer (Ethereal Dev Mode / Production SMTP) |
| **Deployment** | Vercel (Frontend SPA with rewrites), Render (Backend Web Service), Supabase |

---

## 👥 Seeded Showcase Accounts

The database is pre-seeded with realistic multi-bracket candidate records, active drives, and application stages. Password for all demo accounts is **`Password@123`** (Admin: **`Admin@123`**):

| Role | Email | Password | Academic / Drive Profile |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nexplacement.dev` | `Admin@123` | Placement Analytics & University-wide Roster |
| **Recruiter** | `recruiter.amazon@nexplacement.dev` | `Password@123` | Amazon AWS Systems Engineer Drive (26 LPA) |
| **Recruiter** | `recruiter.microsoft@nexplacement.dev` | `Password@123` | Microsoft Azure Core SDE Drive (28 LPA) |
| **Student** | `alex.sharma@student.edu` | `Password@123` | 9.2 CGPA • CSE • Amazon Offer & Microsoft Interview |
| **Student** | `priya.patel@student.edu` | `Password@123` | 8.4 CGPA • IT • Interview Scheduled |
| **Student** | `rohan.varma@student.edu` | `Password@123` | 7.2 CGPA • 1 Backlog • Partial Eligibility Test |
| **Student** | `rahul.kumar@student.edu` | `Password@123` | 6.1 CGPA • 2 Backlogs • Criteria Restriction Test |
| **Student** | `new.student@student.edu` | `Password@123` | Fresh Account • Profile Setup Onboarding Test |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$
- Supabase or local PostgreSQL instance

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

Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Push schema, run migrations, and seed test data:
```bash
# Push Prisma Schema to database
npx prisma db push

# Populate demo data
node prisma/seed.js

# Start backend server
npm run dev
```
*Backend runs on `http://localhost:5000` (Health Probe: `http://localhost:5000/api/health`)*

### 3. Frontend Setup
```bash
# In a new terminal:
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System uptime & live PostgreSQL connectivity ping |
| `POST` | `/api/auth/register` | Public | Register student, recruiter, or admin account |
| `POST` | `/api/auth/login` | Public | User authentication & JWT issuance |
| `GET` | `/api/auth/me` | Authenticated | Fetch current authenticated user session |
| `GET` | `/api/students/profile` | Student | Get current student academic profile |
| `POST` | `/api/students/profile` | Student | Upsert student CGPA, department, and backlogs |
| `POST` | `/api/students/upload-resume` | Student | Upload and link PDF resume file (Max 5MB) |
| `GET` | `/api/drives` | Public | List active placement drives with search & branch filters |
| `POST` | `/api/drives` | Recruiter, Admin | Author and publish a new placement drive |
| `GET` | `/api/drives/:id/export-csv` | Recruiter, Admin | 1-Click CSV export of all applicants for a drive |
| `POST` | `/api/applications/apply/:driveId` | Student | Apply to drive (Enforces CGPA & branch eligibility) |
| `GET` | `/api/applications/my-applications` | Student | Fetch student's applications and stage history |
| `GET` | `/api/applications/drive/:driveId` | Recruiter, Admin | Fetch applicant roster for a specific drive |
| `PATCH` | `/api/applications/:id/status` | Recruiter, Admin | Update candidate stage, interview slot & feedback notes |

---

## 📁 Repository Directory Structure

```text
campus-placement-portal/
├── client/                           # React 18 + Vite Frontend SPA
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicantTable.jsx    # Recruiter candidate roster & status modal
│   │   │   ├── ApplicationStepper.jsx# Student multi-stage timeline tracker
│   │   │   ├── CompanyLogo.jsx       # Direct inline SVG company brand resolver
│   │   │   ├── DriveCard.jsx         # Placement drive card with eligibility tag
│   │   │   ├── ErrorBoundary.jsx     # Root runtime error boundary
│   │   │   ├── MetricsRibbon.jsx     # Executive KPI analytics ribbon
│   │   │   ├── Navbar.jsx            # Brand mark & interactive role switcher
│   │   │   ├── ProfileSetupModal.jsx # Academic onboarding & profile modal
│   │   │   └── ResumeUploadCard.jsx  # Drag-and-drop PDF resume uploader
│   │   ├── pages/
│   │   │   └── StudentDashboard.jsx  # Main student view
│   │   ├── services/
│   │   │   ├── api.js                # Sanitized Fetch client with JWT interceptor
│   │   │   └── mockData.js           # Offline dataset fallback
│   │   ├── App.jsx                   # Role state & modal manager
│   │   ├── index.css                 # Modern Light Theme CSS design system
│   │   └── main.jsx                  # React DOM entry wrapped in ErrorBoundary
│   ├── vercel.json                   # SPA routing rewrite rules for Vercel
│   └── vite.config.js                # Vite build configuration
├── server/                           # Node.js + Express Backend API
│   ├── prisma/
│   │   ├── schema.prisma             # Relational data models (User, Profile, Drive, App)
│   │   └── seed.js                   # Comprehensive database seed script
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js             # Singleton Prisma client
│   │   ├── controllers/
│   │   │   ├── applicationController.js # Stage transitions & email alerts
│   │   │   ├── authController.js     # User registration & JWT auth
│   │   │   ├── driveController.js    # Drive creation & CSV export engine
│   │   │   └── studentController.js  # Profile upsert & resume upload
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification & RBAC authorization
│   │   │   ├── errorHandler.js       # Centralized JSON error formatting
│   │   │   └── uploadMiddleware.js   # Multer PDF filter & disk storage
│   │   ├── routes/
│   │   │   ├── applicationRoutes.js  # /api/applications
│   │   │   ├── authRoutes.js         # /api/auth
│   │   │   ├── driveRoutes.js        # /api/drives
│   │   │   ├── health.routes.js      # /api/health
│   │   │   └── studentRoutes.js      # /api/students
│   │   ├── utils/
│   │   │   └── emailService.js       # Nodemailer stage update alerts
│   │   ├── app.js                    # Express app with Helmet, CORS & Compression
│   │   └── server.js                 # HTTP listener with DB connection verification
│   ├── uploads/resumes/              # Local resume storage directory
│   └── package.json                  # Server scripts & dependencies
└── README.md                         # Project documentation
```

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
