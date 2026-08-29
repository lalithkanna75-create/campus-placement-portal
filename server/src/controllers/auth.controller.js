const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../config/prisma");

const registerSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["STUDENT", "RECRUITER", "ADMIN"]).default("STUDENT"),
    // Profile details if student
    fullName: z.string().optional(),
    rollNumber: z.string().optional(),
    department: z.string().optional(),
    cgpa: z.number().min(0).max(10).optional(),
    tenthPercentage: z.number().min(0).max(100).optional(),
    twelfthPercentage: z.number().min(0).max(100).optional(),
    activeBacklogs: z.number().int().min(0).optional(),
    skills: z.array(z.string()).optional(),
    phone: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
};

const generateTokens = (user) => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || "campus_portal_dev_jwt_access_secret_key_12345",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
  return { accessToken };
};

const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = "STUDENT",
      fullName,
      rollNumber,
      department,
      cgpa = 0.0,
      tenthPercentage = 0.0,
      twelfthPercentage = 0.0,
      activeBacklogs = 0,
      skills = [],
      phone,
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: "An account with this email already exists" },
      });
    }

    if (role === "STUDENT" && rollNumber) {
      const existingRoll = await prisma.studentProfile.findUnique({
        where: { rollNumber },
      });
      if (existingRoll) {
        return res.status(409).json({
          success: false,
          error: { message: "A student profile with this roll number already exists" },
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
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

    const { accessToken } = generateTokens(newUser);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: safeUser,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password credentials" },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password credentials" },
      });
    }

    const { accessToken } = generateTokens(user);

    res.cookie("accessToken", accessToken, {
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
        user: safeUser,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

const logout = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  registerSchema,
  loginSchema,
  register,
  login,
  getMe,
  logout,
};
