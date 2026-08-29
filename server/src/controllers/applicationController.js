const { z } = require("zod");
const prisma = require("../config/prisma");

const statusSchema = z.object({
  status: z.enum([
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "OFFERED",
    "REJECTED",
  ]),
});

// POST /api/applications/apply/:driveId (Student only)
const applyForDrive = async (req, res, next) => {
  try {
    const jobDriveId = req.params.driveId || req.body.jobDriveId;
    const studentId = req.user.id;

    if (!jobDriveId) {
      return res.status(400).json({
        success: false,
        error: { message: "Job drive ID is required" },
      });
    }

    // 1. Fetch Student Profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Please complete your student profile before applying to drives.",
        },
      });
    }

    // 2. Fetch Drive
    const drive = await prisma.jobDrive.findUnique({
      where: { id: jobDriveId },
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { message: "Placement drive not found." },
      });
    }

    // 3. Check Deadline
    if (new Date() > new Date(drive.deadline)) {
      return res.status(400).json({
        success: false,
        error: { message: "Application deadline for this drive has already passed." },
      });
    }

    // 4. Validate Student Eligibility
    const errors = [];
    if (profile.cgpa < drive.minCgpa) {
      errors.push(`Minimum CGPA requirement is ${drive.minCgpa} (Your CGPA: ${profile.cgpa})`);
    }
    if (profile.activeBacklogs > drive.maxBacklogs) {
      errors.push(`Max allowed backlogs is ${drive.maxBacklogs} (Your backlogs: ${profile.activeBacklogs})`);
    }
    if (
      drive.allowedBranches.length > 0 &&
      !drive.allowedBranches.some(
        (b) => b.trim().toLowerCase() === profile.department.trim().toLowerCase()
      )
    ) {
      errors.push(`Department ${profile.department} is not eligible for this drive`);
    }

    if (errors.length > 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: "You are not eligible for this placement drive.",
          details: errors,
        },
      });
    }

    // 5. Check Duplicate Application
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobDriveId: {
          studentId,
          jobDriveId,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: { message: "You have already applied to this drive." },
      });
    }

    // 6. Create Application
    const application = await prisma.application.create({
      data: {
        studentId,
        jobDriveId,
        status: "APPLIED",
      },
      include: {
        jobDrive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Successfully applied to ${drive.companyName}!`,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/my-applications (Student only)
const getMyApplications = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        jobDrive: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/drive/:driveId (Recruiter / Admin)
const getDriveApplications = async (req, res, next) => {
  try {
    const { driveId } = req.params;

    const applications = await prisma.application.findMany({
      where: { jobDriveId: driveId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/status (Recruiter / Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = statusSchema.parse(req.body);

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        jobDrive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Candidate stage updated to ${status}`,
      data: { application },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid status value provided" },
      });
    }
    next(error);
  }
};

module.exports = {
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  updateApplicationStatus,
};
