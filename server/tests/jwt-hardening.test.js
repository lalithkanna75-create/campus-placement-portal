const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

test("CORS and JWT Hardening", async (t) => {
  await t.test("Unlisted malicious CORS origin is blocked", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "https://malicious-attacker-site.com");

    // Blocked by CORS error handler with status 403 or 500 error from CORS middleware
    assert.ok(res.status === 403 || res.status === 500);
  });

  await t.test("Allowed origin (localhost or vercel preview) is permitted", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    assert.equal(res.status, 200);
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
  });
});
