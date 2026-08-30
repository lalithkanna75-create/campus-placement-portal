const prisma = require("../config/prisma");

/**
 * Upsert Student Profile (Onboarding & Updates)
 * POST /api/students/profile
 * Access: STUDENT
 */
const upsertStudentProfile = async (req, res, next) => {
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
      phone,
      skills,
    } = req.body;

    if (!fullName || !rollNumber || !department || cgpa === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Please fill in all mandatory fields: Full Name, Roll Number, Department, and CGPA.",
        },
      });
    }

    const parsedCgpa = parseFloat(cgpa);
    const parsedTenth = tenthPercentage ? parseFloat(tenthPercentage) : 85.0;
    const parsedTwelfth = twelfthPercentage ? parseFloat(twelfthPercentage) : 85.0;
    const parsedBacklogs = activeBacklogs !== undefined ? parseInt(activeBacklogs, 10) : 0;
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        fullName,
        rollNumber,
        department,
        cgpa: parsedCgpa,
        tenthPercentage: parsedTenth,
        twelfthPercentage: parsedTwelfth,
        activeBacklogs: parsedBacklogs,
        phone: phone || null,
        skills: parsedSkills,
      },
      create: {
        userId,
        fullName,
        rollNumber,
        department,
        cgpa: parsedCgpa,
        tenthPercentage: parsedTenth,
        twelfthPercentage: parsedTwelfth,
        activeBacklogs: parsedBacklogs,
        phone: phone || null,
        skills: parsedSkills,
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

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Update StudentProfile record in database
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { resumeUrl },
    });

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        resumeUrl,
        filename: req.file.originalname,
        fileSize: req.file.size,
        profile: updatedProfile,
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

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertStudentProfile,
  uploadStudentResume,
  getStudentProfile,
};
