const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing tables in order of dependency
  await prisma.application.deleteMany();
  await prisma.jobDrive.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash("Password@123", salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@placement.edu",
      passwordHash: commonPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("👤 Admin user created: admin@placement.edu");

  // 2. Create Recruiters
  const googleRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.google@placement.edu",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });

  const microsoftRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.microsoft@placement.edu",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });

  const amazonRecruiter = await prisma.user.create({
    data: {
      email: "recruiter.amazon@placement.edu",
      passwordHash: commonPasswordHash,
      role: "RECRUITER",
    },
  });
  console.log("🏢 3 Recruiter accounts created");

  // 3. Create Students with Profiles
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
          cgpa: 8.85,
          tenthPercentage: 94.2,
          twelfthPercentage: 92.5,
          activeBacklogs: 0,
          resumeUrl: "https://example.com/resumes/alex-sharma.pdf",
          skills: ["React", "Node.js", "PostgreSQL", "Python", "Docker"],
          phone: "+91 98765 43210",
        },
      },
    },
    include: { profile: true },
  });

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
          cgpa: 7.9,
          tenthPercentage: 88.0,
          twelfthPercentage: 86.5,
          activeBacklogs: 0,
          resumeUrl: "https://example.com/resumes/priya-patel.pdf",
          skills: ["Java", "Spring Boot", "MySQL", "AWS"],
          phone: "+91 98765 43211",
        },
      },
    },
    include: { profile: true },
  });
  console.log("🎓 2 Students with complete profiles created");

  // 4. Create Placement Drives
  const drive1 = await prisma.jobDrive.create({
    data: {
      title: "Software Development Engineer - I (Frontend/Fullstack)",
      companyName: "Google",
      description:
        "Join Google Cloud team to build next-generation enterprise interfaces and scalable distributed cloud systems. Strong grasp of algorithms and web technologies required.",
      ctc: "32 LPA",
      location: "Bangalore / Hyderabad, India",
      minCgpa: 8.0,
      allowedBranches: ["Computer Science", "Information Technology"],
      maxBacklogs: 0,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdById: googleRecruiter.id,
    },
  });

  const drive2 = await prisma.jobDrive.create({
    data: {
      title: "Graduate Software Engineer (Azure / AI Core)",
      companyName: "Microsoft",
      description:
        "Work on cutting-edge Azure distributed platforms, OpenAI integration pipelines, and high-performance computing services.",
      ctc: "28 LPA",
      location: "Hyderabad, India",
      minCgpa: 7.5,
      allowedBranches: ["Computer Science", "Information Technology", "Electronics"],
      maxBacklogs: 0,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdById: microsoftRecruiter.id,
    },
  });

  const drive3 = await prisma.jobDrive.create({
    data: {
      title: "Systems Engineer (AWS Platform Infrastructure)",
      companyName: "Amazon",
      description:
        "Architect resilient backend microservices, event-driven pipelines, and high-throughput databases at petabyte scale.",
      ctc: "26 LPA",
      location: "Chennai / Bangalore, India",
      minCgpa: 7.0,
      allowedBranches: ["Computer Science", "Information Technology", "Electronics", "Electrical"],
      maxBacklogs: 1,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      createdById: amazonRecruiter.id,
    },
  });
  console.log("💼 3 Job Drives created");

  // 5. Create Sample Applications
  await prisma.application.create({
    data: {
      studentId: student1.id,
      jobDriveId: drive1.id,
      status: "SHORTLISTED",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student1.id,
      jobDriveId: drive2.id,
      status: "APPLIED",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student2.id,
      jobDriveId: drive2.id,
      status: "INTERVIEW_SCHEDULED",
    },
  });
  console.log("📝 3 Initial applications recorded");

  console.log("\n✅ Database seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Test Login Credentials (Password for all: Password@123):");
  console.log("- Admin:     admin@placement.edu");
  console.log("- Recruiter: recruiter.google@placement.edu");
  console.log("- Recruiter: recruiter.microsoft@placement.edu");
  console.log("- Student:   alex.sharma@student.edu (CGPA 8.85)");
  console.log("- Student:   priya.patel@student.edu (CGPA 7.9)");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
