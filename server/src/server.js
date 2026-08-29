require("dotenv").config();
const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify DB Connection on startup
    await prisma.$connect();
    console.log("✅ [Database] PostgreSQL connected successfully via Prisma");

    const server = app.listen(PORT, () => {
      console.log(`🚀 [Server] Campus Placement Portal API running on http://localhost:${PORT}`);
      console.log(`🩺 [Health Check] Available at http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n🛑 [Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log("🔌 [Server] HTTP server closed.");
        await prisma.$disconnect();
        console.log("🔌 [Database] Prisma client disconnected.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ [Server] Failed to connect to database on startup:", error.message);
    process.exit(1);
  }
};

startServer();
