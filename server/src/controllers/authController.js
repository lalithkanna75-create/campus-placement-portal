const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../config/prisma");

const registerValidationSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "RECRUITER", "ADMIN"]).default("STUDENT"),
  fullName: z.string().optional(),
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  tenthPercentage: z.number().min(0).max(100).optional(),
  twelfthPercentage: z.number().min(0).max(100).optional(),
  activeBacklogs: z.number().int().min(0).optional(),
  skills: z.array(z.string()).optional(),
  phone: z.string().optional(),
});

const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const createToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET || "campus_portal_dev_jwt_access_secret_key_12345",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const validatedData = registerValidationSchema.parse(req.body);
    const {
      email,
      password,
      role,
      fullName,
      rollNumber,
      department,
      cgpa = 0.0,
      tenthPercentage = 0.0,
      twelfthPercentage = 0.0,
      activeBacklogs = 0,
      skills = [],
      phone,
    } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: "Account with this email already exists." },
      });
    }

    if (role === "STUDENT" && rollNumber) {
      const existingRoll = await prisma.studentProfile.findUnique({
        where: { rollNumber },
      });
      if (existingRoll) {
        return res.status(409).json({
          success: false,
          error: { message: "Student with this roll number already registered." },
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(role === "STUDENT" && fullName && rollNumber && department
          ? {
              profile: {
                create: {
                  fullName,
                  rollNumber,
                  department,
                  cgpa,
                  tenthPercentage,
                  twelfthPercentage,
                  activeBacklogs,
                  skills,
                  phone,
                },
              },
            }
          : {}),
      },
      include: {
        profile: true,
      },
    });

    const token = createToken(user);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          details: error.errors.map((e) => e.message),
        },
      });
    }
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = loginValidationSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password credentials." },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password credentials." },
      });
    }

    const token = createToken(user);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          details: error.errors.map((e) => e.message),
        },
      });
    }
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
