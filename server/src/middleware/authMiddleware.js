const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: JWT secret configuration is missing in production.");
    }
    return "campus_portal_dev_jwt_access_secret_key_12345";
  }
  return secret;
};

/**
 * Middleware to verify JWT token from Authorization header or cookie
 * and attach req.user with profile details.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null) || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Authentication required. Please log in." },
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "The user account no longer exists." },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: { message: "Session token expired. Please log in again." },
      });
    }
    return res.status(403).json({
      success: false,
      error: { message: "Invalid authentication token." },
    });
  }
};

/**
 * Optional authentication middleware: if token present, attach req.user, else continue.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null) || req.cookies?.accessToken;

    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
        },
      });
      if (user) req.user = user;
    }
  } catch (_) {
    // Ignore invalid optional tokens
  }
  next();
};

/**
 * RBAC Authorization Middleware
 * @param  {...string} allowedRoles - e.g. 'STUDENT', 'RECRUITER', 'ADMIN'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of permissions: [${allowedRoles.join(", ")}]`,
        },
      });
    }
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  getJwtSecret,
};
