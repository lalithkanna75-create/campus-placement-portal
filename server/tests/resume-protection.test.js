const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "campus_portal_dev_jwt_access_secret_key_12345";

const makeToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
};

test("Protected Resume Download & Authorization", async (t) => {
  let studentOwner, otherStudent, hiringRecruiter, otherRecruiter, admin;
  let drive, application;
  let tokenOwner, tokenOtherStudent, tokenHiringRecruiter, tokenOtherRecruiter, tokenAdmin;

  t.before(async () => {
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash("Password@123", salt);

    // Student Owner
    studentOwner = await prisma.user.create({
      data: {
        email: `student.owner.${Date.now()}@test.com`,
        passwordHash: pwd,
        role: "STUDENT",
        profile: {
          create: {
            fullName: "Owner Student",
            rollNumber: `OWN${Date.now()}`,
            department: "Computer Science",
            cgpa: 9.0,
            tenthPercentage: 90.0,
            twelfthPercentage: 90.0,
            resumeUrl: "https://example.com/mock-resumes/owner-resume.pdf",
          },
        },
      },
    });
    tokenOwner = makeToken(studentOwner);

    // Other Student
    otherStudent = await prisma.user.create({
      data: {
        email: `student.other.${Date.now()}@test.com`,
        passwordHash: pwd,
        role: "STUDENT",
        profile: {
          create: {
            fullName: "Other Student",
            rollNumber: `OTH${Date.now()}`,
            department: "Computer Science",
            cgpa: 8.0,
            tenthPercentage: 80.0,
            twelfthPercentage: 80.0,
          },
        },
      },
    });
    tokenOtherStudent = makeToken(otherStudent);

    // Hiring Recruiter
    hiringRecruiter = await prisma.user.create({
      data: { email: `recruiter.hiring.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });
    tokenHiringRecruiter = makeToken(hiringRecruiter);

    // Other Recruiter
    otherRecruiter = await prisma.user.create({
      data: { email: `recruiter.unrelated.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });
    tokenOtherRecruiter = makeToken(otherRecruiter);

    // Admin
    admin = await prisma.user.create({
      data: { email: `admin.resume.${Date.now()}@test.com`, passwordHash: pwd, role: "ADMIN" },
    });
    tokenAdmin = makeToken(admin);

    // Drive authored by hiringRecruiter
    drive = await prisma.jobDrive.create({
      data: {
        title: "Hiring Drive",
        companyName: "HiringCorp",
        description: "Hiring drive description",
        ctc: "22 LPA",
        location: "Pune",
        deadline: new Date(Date.now() + 86400000),
        createdById: hiringRecruiter.id,
      },
    });

    // StudentOwner applies to HiringCorp drive
    application = await prisma.application.create({
      data: { studentId: studentOwner.id, jobDriveId: drive.id, status: "APPLIED" },
    });
  });

  t.after(async () => {
    await prisma.application.deleteMany({ where: { id: application.id } });
    await prisma.jobDrive.deleteMany({ where: { id: drive.id } });
    await prisma.studentProfile.deleteMany({
      where: { userId: { in: [studentOwner.id, otherStudent.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [studentOwner.id, otherStudent.id, hiringRecruiter.id, otherRecruiter.id, admin.id] } },
    });
    await prisma.$disconnect();
  });

  await t.test("Anonymous user cannot download resume (401)", async () => {
    const res = await request(app).get(`/api/students/resume/${studentOwner.id}`);
    assert.equal(res.status, 401);
  });

  await t.test("Unrelated student cannot download another student's resume (403)", async () => {
    const res = await request(app)
      .get(`/api/students/resume/${studentOwner.id}`)
      .set("Authorization", `Bearer ${tokenOtherStudent}`);
    assert.equal(res.status, 403);
  });

  await t.test("Unrelated recruiter cannot download resume (403)", async () => {
    const res = await request(app)
      .get(`/api/students/resume/${studentOwner.id}`)
      .set("Authorization", `Bearer ${tokenOtherRecruiter}`);
    assert.equal(res.status, 403);
  });

  await t.test("Owning student can access their own resume", async () => {
    const res = await request(app)
      .get(`/api/students/resume/${studentOwner.id}`)
      .set("Authorization", `Bearer ${tokenOwner}`);
    assert.ok(res.status === 200 || res.status === 302);
  });

  await t.test("Hiring recruiter whose drive student applied to can access candidate resume", async () => {
    const res = await request(app)
      .get(`/api/students/resume/${studentOwner.id}`)
      .set("Authorization", `Bearer ${tokenHiringRecruiter}`);
    assert.ok(res.status === 200 || res.status === 302);
  });

  await t.test("Admin can access any candidate resume", async () => {
    const res = await request(app)
      .get(`/api/students/resume/${studentOwner.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assert.ok(res.status === 200 || res.status === 302);
  });

  await t.test("Direct static /uploads path is blocked (404)", async () => {
    const res = await request(app).get("/uploads/resumes/sample-resume.pdf");
    assert.equal(res.status, 404);
  });
});
