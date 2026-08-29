const { z } = require("zod");
const prisma = require("../config/prisma");

const profileSchema = {
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    rollNumber: z.string().min(2, "Roll number is required"),
    department: z.string().min(2, "Department is required"),
    cgpa: z.number().min(0).max(10),
    tenthPercentage: z.number().min(0).max(100),
    twelfthPercentage: z.number().min(0).max(100),
    activeBacklogs: z.number().int().min(0).default(0),
    resumeUrl: z.string().url().optional().or(z.literal("")),
    skills: z.array(z.string()).default([]),
    phone: z.string().optional(),
  }),
};

// GET /api/profile
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: "Profile not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

// POST / PUT /api/profile
const upsertMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      rollNumber,
      department,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      resumeUrl,
      skills,
      phone,
    } = req.body;

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        fullName,
        rollNumber,
        department,
        cgpa,
        tenthPercentage,
        twelfthPercentage,
        activeBacklogs,
        resumeUrl: resumeUrl || null,
        skills,
        phone,
      },
      create: {
        userId,
        fullName,
        rollNumber,
        department,
        cgpa,
        tenthPercentage,
        twelfthPercentage,
        activeBacklogs,
        resumeUrl: resumeUrl || null,
        skills,
        phone,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  profileSchema,
  getMyProfile,
  upsertMyProfile,
};
