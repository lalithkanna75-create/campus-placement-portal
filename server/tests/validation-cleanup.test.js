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

test("Validation & Schema Hardening", async (t) => {
  let recruiter, student, drive;
  let tokenRecruiter, tokenStudent;

  t.before(async () => {
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash("Password@123", salt);

    recruiter = await prisma.user.create({
      data: { email: `recruiter.val.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });
    tokenRecruiter = makeToken(recruiter);

    student = await prisma.user.create({
      data: { email: `student.val.${Date.now()}@test.com`, passwordHash: pwd, role: "STUDENT" },
    });
    tokenStudent = makeToken(student);

    drive = await prisma.jobDrive.create({
      data: {
        title: "Validation Test Drive",
        companyName: "ValCorp",
        description: "Test drive for input validation",
        ctc: "15 LPA",
        location: "Mumbai",
        deadline: new Date(Date.now() + 86400000),
        createdById: recruiter.id,
      },
    });
  });

  t.after(async () => {
    await prisma.jobDrive.deleteMany({ where: { id: drive.id } });
    await prisma.studentProfile.deleteMany({ where: { userId: student.id } });
    await prisma.user.deleteMany({ where: { id: { in: [recruiter.id, student.id] } } });
    await prisma.$disconnect();
  });

  await t.test("PUT /api/drives/:id rejects invalid deadline date string with 400", async () => {
    const res = await request(app)
      .put(`/api/drives/${drive.id}`)
      .set("Authorization", `Bearer ${tokenRecruiter}`)
      .send({ deadline: "not-a-valid-date" });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test("PUT /api/drives/:id successfully updates validated fields", async () => {
    const res = await request(app)
      .put(`/api/drives/${drive.id}`)
      .set("Authorization", `Bearer ${tokenRecruiter}`)
      .send({ title: "Updated Drive Title", ctc: "24 LPA" });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.drive.title, "Updated Drive Title");
    assert.equal(res.body.data.drive.ctc, "24 LPA");
  });

  await t.test("POST /api/students/profile validates and saves student profile", async () => {
    const res = await request(app)
      .post("/api/students/profile")
      .set("Authorization", `Bearer ${tokenStudent}`)
      .send({
        fullName: "Validated Student",
        rollNumber: `VAL${Date.now()}`,
        department: "Information Technology",
        cgpa: 8.8,
        tenthPercentage: 88,
        twelfthPercentage: 90,
        activeBacklogs: 0,
        skills: ["Node.js", "React"],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.fullName, "Validated Student");
    assert.equal(res.body.data.profile.cgpa, 8.8);
  });
});
