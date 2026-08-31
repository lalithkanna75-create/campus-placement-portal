const path = require("path");
const fs = require("fs");
const { z } = require("zod");
const prisma = require("../config/prisma");

const studentProfileSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  rollNumber: z.string().min(2, "Roll Number is required"),
  department: z.string().min(2, "Department is required"),
  cgpa: z.union([z.number(), z.string()]).transform((val) => parseFloat(val)),
  tenthPercentage: z.union([z.number(), z.string()]).optional().transform((val) => (val !== undefined ? parseFloat(val) : 85.0)),
  twelfthPercentage: z.union([z.number(), z.string()]).optional().transform((val) => (val !== undefined ? parseFloat(val) : 85.0)),
  activeBacklogs: z.union([z.number(), z.string()]).optional().transform((val) => (val !== undefined ? parseInt(val, 10) : 0)),
  phone: z.string().optional().nullable(),
  skills: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  }),
});

/**
 * Upsert Student Profile (Onboarding & Updates)
 * POST /api/students/profile
 * Access: STUDENT
 */
const upsertStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validated = studentProfileSchema.parse(req.body);

    const profileData = {
      fullName: validated.fullName,
      rollNumber: validated.rollNumber,
      department: validated.department,
      cgpa: validated.cgpa,
      tenthPercentage: validated.tenthPercentage,
      twelfthPercentage: validated.twelfthPercentage,
      activeBacklogs: validated.activeBacklogs,
      phone: validated.phone || null,
      skills: validated.skills || [],
    };

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully.",
      data: { profile },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: { message: "This Roll Number is already registered with another student account." },
      });
    }
    next(error);
  }
};

/**
 * Upload & Link Student PDF Resume
 * POST /api/students/upload-resume
 * Access: STUDENT
 */
const uploadStudentResume = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if student profile exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return res.status(400).json({
        success: false,
        error: {
          code: "PROFILE_INCOMPLETE",
          message: "Please complete your academic profile before uploading a resume.",
        },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: "Please select a PDF resume file to upload." },
      });
    }

    const diskPath = `/uploads/resumes/${req.file.filename}`;
    const resumeUrl = `/api/students/resume/${userId}`;

    // Update StudentProfile record in database
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { resumeUrl: diskPath },
    });

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        resumeUrl,
        filename: req.file.originalname,
        fileSize: req.file.size,
        storageMode: process.env.STORAGE_DRIVER || "LOCAL_DISK",
        profile: {
          ...updatedProfile,
          resumeUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Student Profile
 * GET /api/students/profile
 * Access: STUDENT
 */
const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: { profile: null },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          ...profile,
          resumeUrl: profile.resumeUrl ? `/api/students/resume/${userId}` : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Protected Resume Download / Stream Endpoint
 * GET /api/students/resume/:userId
 * Access:
 * - Owning Student (req.user.id === userId)
 * - Admin
 * - Recruiter (only if student applied to a drive created by this recruiter)
 */
const getStudentResume = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({
        success: false,
        error: { message: "Resume not found for this candidate." },
      });
    }

    // Authorization verification
    let isAuthorized = false;

    if (currentUser.role === "ADMIN") {
      isAuthorized = true;
    } else if (currentUser.role === "STUDENT" && currentUser.id === userId) {
      isAuthorized = true;
    } else if (currentUser.role === "RECRUITER") {
      const applicationToRecruiterDrive = await prisma.application.findFirst({
        where: {
          studentId: userId,
          jobDrive: {
            createdById: currentUser.id,
          },
        },
      });
      if (applicationToRecruiterDrive) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: { message: "Unauthorized: You do not have permission to view or download this resume." },
      });
    }

    // If external URL (e.g. cloud storage or demo test URL)
    if (profile.resumeUrl.startsWith("http://") || profile.resumeUrl.startsWith("https://")) {
      return res.redirect(profile.resumeUrl);
    }

    // Relative disk path on server
    const cleanPath = profile.resumeUrl.replace(/^\//, "");
    const absolutePath = path.resolve(__dirname, "../../", cleanPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        error: { message: "Resume file does not exist on disk." },
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="resume-${profile.rollNumber || userId}.pdf"`
    );
    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertStudentProfile,
  uploadStudentResume,
  getStudentProfile,
  getStudentResume,
};
