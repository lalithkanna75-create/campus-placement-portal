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

test("Recruiter Ownership Authorization", async (t) => {
  let recruiterA, recruiterB, adminUser, studentUser;
  let driveA, driveB, appA, appB;
  let tokenA, tokenB, tokenAdmin, tokenStudent;

  t.before(async () => {
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash("Password@123", salt);

    // Create Recruiter A
    recruiterA = await prisma.user.create({
      data: { email: `recruiterA.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });
    tokenA = makeToken(recruiterA);

    // Create Recruiter B
    recruiterB = await prisma.user.create({
      data: { email: `recruiterB.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });
    tokenB = makeToken(recruiterB);

    // Create Admin
    adminUser = await prisma.user.create({
      data: { email: `admin.${Date.now()}@test.com`, passwordHash: pwd, role: "ADMIN" },
    });
    tokenAdmin = makeToken(adminUser);

    // Create Student
    studentUser = await prisma.user.create({
      data: {
        email: `student.${Date.now()}@test.com`,
        passwordHash: pwd,
        role: "STUDENT",
        profile: {
          create: {
            fullName: "Test Student",
            rollNumber: `ROLL${Date.now()}`,
            department: "Computer Science",
            cgpa: 9.0,
            tenthPercentage: 90.0,
            twelfthPercentage: 90.0,
          },
        },
      },
    });
    tokenStudent = makeToken(studentUser);

    // Drive A created by Recruiter A
    driveA = await prisma.jobDrive.create({
      data: {
        title: "Drive A Title",
        companyName: "Company A",
        description: "Description for Drive A test",
        ctc: "20 LPA",
        location: "Bangalore",
        deadline: new Date(Date.now() + 86400000),
        createdById: recruiterA.id,
      },
    });

    // Drive B created by Recruiter B
    driveB = await prisma.jobDrive.create({
      data: {
        title: "Drive B Title",
        companyName: "Company B",
        description: "Description for Drive B test",
        ctc: "25 LPA",
        location: "Hyderabad",
        deadline: new Date(Date.now() + 86400000),
        createdById: recruiterB.id,
      },
    });

    // Student applies to Drive A and Drive B
    appA = await prisma.application.create({
      data: { studentId: studentUser.id, jobDriveId: driveA.id, status: "APPLIED" },
    });

    appB = await prisma.application.create({
      data: { studentId: studentUser.id, jobDriveId: driveB.id, status: "APPLIED" },
    });
  });

  t.after(async () => {
    await prisma.application.deleteMany({
      where: { id: { in: [appA.id, appB.id] } },
    });
    await prisma.jobDrive.deleteMany({
      where: { id: { in: [driveA.id, driveB.id] } },
    });
    await prisma.studentProfile.deleteMany({
      where: { userId: studentUser.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [recruiterA.id, recruiterB.id, adminUser.id, studentUser.id] } },
    });
    await prisma.$disconnect();
  });

  await t.test("Recruiter B is blocked (403) from viewing applicant roster for Drive A", async () => {
    const res = await request(app)
      .get(`/api/applications/drive/${driveA.id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test("Recruiter A can view applicant roster for their own Drive A", async () => {
    const res = await request(app)
      .get(`/api/applications/drive/${driveA.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.applications.length, 1);
  });

  await t.test("Recruiter B is blocked (403) from exporting CSV for Drive A", async () => {
    const res = await request(app)
      .get(`/api/drives/${driveA.id}/export-csv`)
      .set("Authorization", `Bearer ${tokenB}`);

    assert.equal(res.status, 403);
  });

  await t.test("Recruiter A can export CSV for Drive A", async () => {
    const res = await request(app)
      .get(`/api/drives/${driveA.id}/export-csv`)
      .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /text\/csv/);
  });

  await t.test("Recruiter B is blocked (403) from updating application status on Drive A", async () => {
    const res = await request(app)
      .patch(`/api/applications/${appA.id}/status`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ status: "SHORTLISTED" });

    assert.equal(res.status, 403);
  });

  await t.test("Recruiter A can update application status on their own Drive A", async () => {
    const res = await request(app)
      .patch(`/api/applications/${appA.id}/status`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ status: "SHORTLISTED" });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.application.status, "SHORTLISTED");
  });

  await t.test("Admin can view rosters, export CSV, and update status on any drive", async () => {
    const rosterRes = await request(app)
      .get(`/api/applications/drive/${driveA.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assert.equal(rosterRes.status, 200);

    const exportRes = await request(app)
      .get(`/api/drives/${driveA.id}/export-csv`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assert.equal(exportRes.status, 200);

    const updateRes = await request(app)
      .patch(`/api/applications/${appA.id}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "OFFERED" });
    assert.equal(updateRes.status, 200);
  });
});
