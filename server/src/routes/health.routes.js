const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

/**
 * @route   GET /api/health
 * @desc    Comprehensive system health check with DB ping
 * @access  Public
 */
router.get("/health", async (req, res) => {
  const startTime = Date.now();
  let dbStatus = "DISCONNECTED";
  let dbLatencyMs = null;

  try {
    const dbPingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbPingStart;
    dbStatus = "CONNECTED";
  } catch (error) {
    dbStatus = "ERROR";
    console.error("[HealthCheck] Database connection error:", error.message);
  }

  const isHealthy = dbStatus === "CONNECTED";
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    responseLatencyMs: Date.now() - startTime,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
