const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = (authHeader && authHeader.split(" ")[1]) || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Authentication token required" },
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "campus_portal_dev_jwt_access_secret_key_12345"
    );

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
        error: { message: "User account no longer exists" },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: { message: "Token has expired, please log in again" },
      });
    }
    return res.status(403).json({
      success: false,
      error: { message: "Invalid or malformed authentication token" },
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]`,
        },
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
