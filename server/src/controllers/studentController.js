const prisma = require("../config/prisma");

/**
 * Upload & Link Student PDF Resume
 * POST /api/students/upload-resume
 * Access: STUDENT
 */
const uploadStudentResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: "Please select a PDF resume file to upload." },
      });
    }

    const userId = req.user.id;
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

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: "Student profile not found." },
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

module.exports = {
  uploadStudentResume,
  getStudentProfile,
};
