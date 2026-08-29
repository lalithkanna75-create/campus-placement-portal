const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/authRoutes");
const driveRoutes = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profile.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security & Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes Mounting
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

// Fallback Route (404 Handler)
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
