const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

test("Drive Detail Applicant Data Privacy", async (t) => {
  let recruiter, student, drive, application;

  t.before(async () => {
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash("Password@123", salt);

    recruiter = await prisma.user.create({
      data: { email: `recruiter.privacy.${Date.now()}@test.com`, passwordHash: pwd, role: "RECRUITER" },
    });

    student = await prisma.user.create({
      data: {
        email: `student.sensitive.${Date.now()}@test.com`,
        passwordHash: pwd,
        role: "STUDENT",
        profile: {
          create: {
            fullName: "Sensitive Student Name",
            rollNumber: `PRIVACY${Date.now()}`,
            department: "Computer Science",
            cgpa: 9.5,
            tenthPercentage: 95.0,
            twelfthPercentage: 94.0,
            phone: "+91 99999 88888",
            resumeUrl: "/uploads/resumes/confidential-resume.pdf",
          },
        },
      },
      include: { profile: true },
    });

    drive = await prisma.jobDrive.create({
      data: {
        title: "Public Privacy Test Drive",
        companyName: "SecureCorp",
        description: "Public job description test",
        ctc: "30 LPA",
        location: "Remote",
        deadline: new Date(Date.now() + 86400000),
        createdById: recruiter.id,
      },
    });

    application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobDriveId: drive.id,
        status: "SHORTLISTED",
        feedbackNotes: "Top secret internal recruiter rating: 10/10",
      },
    });
  });

  t.after(async () => {
    await prisma.application.deleteMany({ where: { id: application.id } });
    await prisma.jobDrive.deleteMany({ where: { id: drive.id } });
    await prisma.studentProfile.deleteMany({ where: { userId: student.id } });
    await prisma.user.deleteMany({ where: { id: { in: [recruiter.id, student.id] } } });
    await prisma.$disconnect();
  });

  await t.test("Anonymous public request to GET /api/drives/:id must not expose applicant PII", async () => {
    const res = await request(app).get(`/api/drives/${drive.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.drive);

    const d = res.body.data.drive;
    // Verify drive fields are present
    assert.equal(d.title, "Public Privacy Test Drive");
    assert.equal(d.companyName, "SecureCorp");
    assert.equal(d.applicantsCount, 1);

    // Verify applicant data is completely absent from the response
    assert.equal(d.applications, undefined, "Public response must not contain applications array");
    const rawBody = JSON.stringify(res.body);
    assert.ok(!rawBody.includes("Sensitive Student Name"), "Must not leak student name");
    assert.ok(!rawBody.includes("student.sensitive"), "Must not leak student email");
    assert.ok(!rawBody.includes("+91 99999 88888"), "Must not leak student phone number");
    assert.ok(!rawBody.includes("confidential-resume.pdf"), "Must not leak resume URL");
    assert.ok(!rawBody.includes("Top secret internal recruiter rating"), "Must not leak feedback notes");
  });
});
