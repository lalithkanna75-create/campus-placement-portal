const { z } = require("zod");
const prisma = require("../config/prisma");

const applySchema = {
  body: z.object({
    jobDriveId: z.string().uuid("Invalid Job Drive ID format"),
  }),
};

const statusUpdateSchema = {
  body: z.object({
    status: z.enum([
      "APPLIED",
      "SHORTLISTED",
      "INTERVIEW_SCHEDULED",
      "OFFERED",
      "REJECTED",
    ]),
  }),
};

// POST /api/applications/apply (Student only)
const applyForDrive = async (req, res, next) => {
  try {
    const { jobDriveId } = req.body;
    const studentId = req.user.id;

    // 1. Fetch Student Profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: { message: "Please complete your student academic profile before applying." },
      });
    }

    // 2. Fetch Drive
    const drive = await prisma.jobDrive.findUnique({
      where: { id: jobDriveId },
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { message: "Placement drive not found" },
      });
    }

    // 3. Check Deadline
    if (new Date() > new Date(drive.deadline)) {
      return res.status(400).json({
        success: false,
        error: { message: "The application deadline for this placement drive has passed." },
      });
    }

    // 4. Check Eligibility Criteria
    const eligibilityErrors = [];

    if (profile.cgpa < drive.minCgpa) {
      eligibilityErrors.push(
        `CGPA requirement not met (Your CGPA: ${profile.cgpa}, Minimum Required: ${drive.minCgpa})`
      );
    }

    if (profile.activeBacklogs > drive.maxBacklogs) {
      eligibilityErrors.push(
        `Active backlogs exceed limit (Your backlogs: ${profile.activeBacklogs}, Maximum Allowed: ${drive.maxBacklogs})`
      );
    }

    if (
      drive.allowedBranches.length > 0 &&
      !drive.allowedBranches.some(
        (b) => b.trim().toLowerCase() === profile.department.trim().toLowerCase()
      )
    ) {
      eligibilityErrors.push(
        `Department not eligible (Your department: ${profile.department}, Allowed: ${drive.allowedBranches.join(", ")})`
      );
    }

    if (eligibilityErrors.length > 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: "You do not meet the eligibility criteria for this drive.",
          details: eligibilityErrors,
        },
      });
    }

    // 5. Check Existing Application
    const existing = await prisma.application.findUnique({
      where: {
        studentId_jobDriveId: {
          studentId,
          jobDriveId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: "You have already applied to this placement drive." },
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
      message: "Application submitted successfully!",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/my (Student only)
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
    const { status } = req.body;

    const updated = await prisma.application.update({
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
      message: `Application status updated to ${status}`,
      data: { application: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applySchema,
  statusUpdateSchema,
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  updateApplicationStatus,
};
