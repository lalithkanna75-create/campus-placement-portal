const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

test("Public Registration Security", async (t) => {
  const testAdminEmail = `attacker.admin.${Date.now()}@test.com`;
  const testRecruiterEmail = `attacker.recruiter.${Date.now()}@test.com`;

  t.after(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testAdminEmail, testRecruiterEmail],
        },
      },
    });
    await prisma.$disconnect();
  });

  await t.test("Registering with role: ADMIN forces role to STUDENT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: testAdminEmail,
        password: "Password@123",
        role: "ADMIN",
        fullName: "Attacker Admin",
        rollNumber: `ATK${Date.now()}`,
        department: "Computer Science",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, "STUDENT", "User role must be forced to STUDENT");

    // Also verify directly in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: testAdminEmail },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.role, "STUDENT", "Database record role must strictly be STUDENT");
  });

  await t.test("Registering with role: RECRUITER forces role to STUDENT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: testRecruiterEmail,
        password: "Password@123",
        role: "RECRUITER",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, "STUDENT", "User role must be forced to STUDENT");
  });
});
