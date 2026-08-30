const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding for NexPlacement...");

  // Clean existing records in correct foreign key order
  await prisma.application.deleteMany();
  await prisma.jobDrive.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash("Password@123", salt);
  const adminPasswordHash = await bcrypt.hash("Admin@123", salt);

  // 1. Create Admins
  const primaryAdmin = await prisma.user.create({
    data: {
      email: "admin@nexplacement.dev",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const demoAdmin = await prisma.user.create({
    data: {
      email: "admin@placement.edu",
      passwordHash: commonPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("👤 Admin accounts created: admin@nexplacement.dev & admin@placement.edu");

  // 2. Create Recruiters
  const amazonRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.amazon@nexplacement.dev",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });

  const microsoftRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.microsoft@nexplacement.dev",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });

  const googleRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.google@placement.edu",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });

  const tcsRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.tcs@nexplacement.dev",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });
  console.log("🏢 4 Recruiter accounts created (Amazon, Microsoft, Google, TCS)");

  // 3. Create 5 Diverse Students
  // Student 1: Top Tier Student (Alex Sharma - 9.2 CGPA, 0 backlogs)
  const student1 = await prisma.user.create({
    data: {
      email: "alex.sharma@student.edu",
      passwordHash: commonPasswordHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Alex Sharma",
          rollNumber: "CS2023001",
          department: "Computer Science",
          cgpa: 9.2,
          tenthPercentage: 95.5,
          twelfthPercentage: 94.0,
          activeBacklogs: 0,
          resumeUrl: "/uploads/resumes/demo-alex-sharma-resume.pdf",
          skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
          phone: "+91 98765 43210",
        },
      },
    },
    include: { profile: true },
  });

  // Student 2: Solid Student (Priya Patel - 8.4 CGPA, 0 backlogs)
  const student2 = await prisma.user.create({
    data: {
      email: "priya.patel@student.edu",
      passwordHash: commonPasswordHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Priya Patel",
          rollNumber: "IT2023045",
          department: "Information Technology",
          cgpa: 8.4,
          tenthPercentage: 89.0,
          twelfthPercentage: 87.5,
          activeBacklogs: 0,
          resumeUrl: "/uploads/resumes/demo-priya-patel-resume.pdf",
          skills: ["Java", "Spring Boot", "MySQL", "AWS", "Microservices"],
          phone: "+91 98765 43211",
        },
      },
    },
    include: { profile: true },
  });

  // Student 3: Borderline Student (Rohan Varma - 7.2 CGPA, 1 backlog)
  const student3 = await prisma.user.create({
    data: {
      email: "rohan.varma@student.edu",
      passwordHash: commonPasswordHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Rohan Varma",
          rollNumber: "EC2023089",
          department: "Electronics",
          cgpa: 7.2,
          tenthPercentage: 82.0,
          twelfthPercentage: 80.5,
          activeBacklogs: 1,
          skills: ["Embedded C", "IoT", "Python", "Verilog", "MATLAB"],
          phone: "+91 98765 43212",
        },
      },
    },
    include: { profile: true },
  });

  // Student 4: Low CGPA Student (Rahul Kumar - 6.1 CGPA, 2 backlogs)
  const student4 = await prisma.user.create({
    data: {
      email: "rahul.kumar@student.edu",
      passwordHash: commonPasswordHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Rahul Kumar",
          rollNumber: "ME2023112",
          department: "Mechanical",
          cgpa: 6.1,
          tenthPercentage: 75.0,
          twelfthPercentage: 72.0,
          activeBacklogs: 2,
          skills: ["AutoCAD", "SolidWorks", "ANSYS", "Python"],
          phone: "+91 98765 43213",
        },
      },
    },
    include: { profile: true },
  });

  // Student 5: Fresh Registered Student (No Profile -> Tests Onboarding Flow)
  const student5 = await prisma.user.create({
    data: {
      email: "new.student@student.edu",
      passwordHash: commonPasswordHash,
      role: "STUDENT",
    },
  });
  console.log("🎓 5 Student accounts created across diverse academic brackets & onboarding states");

  // 4. Create 4 Realistic Placement Drives
  const driveAmazon = await prisma.jobDrive.create({
    data: {
      title: "Systems Engineer (AWS Platform Infrastructure)",
      companyName: "Amazon",
      description:
        "Architect resilient backend cloud infrastructure, high-throughput message streaming, and distributed microservices at global scale.",
      ctc: "26 LPA",
      location: "Chennai / Bangalore, India",
      minCgpa: 7.0,
      allowedBranches: ["Computer Science", "Information Technology", "Electronics", "Electrical"],
      maxBacklogs: 1,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      createdById: amazonRecruiter.id,
    },
  });

  const driveMicrosoft = await prisma.jobDrive.create({
    data: {
      title: "Software Development Engineer - Azure Core",
      companyName: "Microsoft",
      description:
        "Develop high-performance distributed systems for Azure infrastructure, AI model serving, and kernel-level cloud optimizations.",
      ctc: "28 LPA",
      location: "Hyderabad / Bangalore, India",
      minCgpa: 8.0,
      allowedBranches: ["Computer Science", "Information Technology"],
      maxBacklogs: 0,
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      createdById: microsoftRecruiter.id,
    },
  });

  const driveGoogle = await prisma.jobDrive.create({
    data: {
      title: "Frontend Engineering Specialist",
      companyName: "Google",
      description:
        "Build rich, accessible, and ultra-fast web user interfaces across Google Workspace, Cloud Console, and developer tooling.",
      ctc: "32 LPA",
      location: "Bangalore, India",
      minCgpa: 8.5,
      allowedBranches: ["Computer Science", "Information Technology", "Electronics"],
      maxBacklogs: 0,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdById: googleRecruiter.id,
    },
  });

  const driveTCS = await prisma.jobDrive.create({
    data: {
      title: "Digital Technology Engineer",
      companyName: "TCS",
      description:
        "Enterprise fullstack development, cloud migration, and AI integration for Fortune 500 global clients.",
      ctc: "9 LPA",
      location: "Pan India",
      minCgpa: 6.0,
      allowedBranches: ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil"],
      maxBacklogs: 2,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdById: tcsRecruiter.id,
    },
  });
  console.log("💼 4 Placement Drives published (Amazon, Microsoft, Google, TCS)");

  // 5. Pre-populate Applications across all lifecycle stages
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setHours(10, 30, 0, 0);

  const dayAfter = new Date(Date.now() + 172800000);
  dayAfter.setHours(14, 0, 0, 0);

  // Application 1: Alex Sharma -> Amazon (OFFERED)
  await prisma.application.create({
    data: {
      studentId: student1.id,
      jobDriveId: driveAmazon.id,
      status: "OFFERED",
      feedbackNotes: "Outstanding performance in system architecture and technical coding rounds. Official offer letter dispatched!",
    },
  });

  // Application 2: Alex Sharma -> Microsoft (INTERVIEW_SCHEDULED)
  await prisma.application.create({
    data: {
      studentId: student1.id,
      jobDriveId: driveMicrosoft.id,
      status: "INTERVIEW_SCHEDULED",
      interviewDate: tomorrow,
      feedbackNotes: "Round 2 Technical Interview on Microsoft Teams: teams.microsoft.com/r2-interview. Focus on concurrency and distributed systems.",
    },
  });

  // Application 3: Alex Sharma -> Google (SHORTLISTED)
  await prisma.application.create({
    data: {
      studentId: student1.id,
      jobDriveId: driveGoogle.id,
      status: "SHORTLISTED",
      feedbackNotes: "Resume screened and shortlisted for Online Technical Assessment.",
    },
  });

  // Application 4: Priya Patel -> Amazon (INTERVIEW_SCHEDULED)
  await prisma.application.create({
    data: {
      studentId: student2.id,
      jobDriveId: driveAmazon.id,
      status: "INTERVIEW_SCHEDULED",
      interviewDate: dayAfter,
      feedbackNotes: "Round 1 Live Coding & Problem Solving on HackerRank. Link shared via email.",
    },
  });

  // Application 5: Priya Patel -> Microsoft (APPLIED)
  await prisma.application.create({
    data: {
      studentId: student2.id,
      jobDriveId: driveMicrosoft.id,
      status: "APPLIED",
    },
  });

  // Application 6: Rohan Varma -> Amazon (APPLIED)
  await prisma.application.create({
    data: {
      studentId: student3.id,
      jobDriveId: driveAmazon.id,
      status: "APPLIED",
    },
  });

  // Application 7: Rahul Kumar -> TCS (SHORTLISTED)
  await prisma.application.create({
    data: {
      studentId: student4.id,
      jobDriveId: driveTCS.id,
      status: "SHORTLISTED",
      feedbackNotes: "Shortlisted for National Qualifier Test (NQT) Digital Round.",
    },
  });

  // Application 8: Rohan Varma -> Microsoft (REJECTED)
  await prisma.application.create({
    data: {
      studentId: student3.id,
      jobDriveId: driveMicrosoft.id,
      status: "REJECTED",
      feedbackNotes: "Candidate CGPA (7.2) does not satisfy the drive minimum threshold of 8.0 CGPA.",
    },
  });
  console.log("📝 8 Pre-populated Applications across all stages recorded");

  console.log("\n========================================================");
  console.log("✨ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("DEMO ACCOUNTS READY TO TEST:");
  console.log("1. Admin:      admin@nexplacement.dev / Admin@123 (or admin@placement.edu / Password@123)");
  console.log("2. Recruiters: recruiter.amazon@nexplacement.dev / Password@123");
  console.log("               recruiter.microsoft@nexplacement.dev / Password@123");
  console.log("3. Students:   alex.sharma@student.edu (9.2 CGPA - Tier-1 Eligible, Offers/Interviews)");
  console.log("               priya.patel@student.edu (8.4 CGPA - CSE/IT Eligible, Interview Scheduled)");
  console.log("               rohan.varma@student.edu (7.2 CGPA, 1 Backlog - Partial Eligibility)");
  console.log("               rahul.kumar@student.edu (6.1 CGPA, 2 Backlogs - Restricted/Core Eligible)");
  console.log("               new.student@student.edu (No Profile - Tests Onboarding Flow)");
  console.log("========================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
