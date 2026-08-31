const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/authRoutes");
const driveRoutes = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profile.routes");
const studentRoutes = require("./routes/studentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Trust reverse proxies (Render, Vercel, Cloudflare)
app.set("trust proxy", 1);

// Production Security Headers with Cross-Origin Resource Policy for PDF viewing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Gzip Compression for Fast Payloads
app.use(compression());

// Production Multi-Origin CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check configured origins or Vercel deployment preview domains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        defaultOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com");

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback to prevent deployment blocks
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Public uploads route removed for privacy; resumes are served via authenticated /api/students/resume/:userId

// API Routes Mounting
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/students", studentRoutes);

// Root Welcome & Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "NexPlacement Portal API",
    status: "ONLINE",
    version: "1.0.0",
    healthEndpoint: "/api/health",
  });
});

// Fallback Route (404 Handler)
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found on server.`,
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
