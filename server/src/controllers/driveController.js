const { z } = require("zod");
const prisma = require("../config/prisma");

const driveValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyName: z.string().min(2, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  ctc: z.string().min(1, "CTC is required"),
  location: z.string().min(1, "Location is required"),
  minCgpa: z.number().min(0).max(10).default(0.0),
  allowedBranches: z.array(z.string()).default([]),
  maxBacklogs: z.number().int().min(0).default(0),
  deadline: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid ISO date string"),
});

// GET /api/drives
const getDrives = async (req, res, next) => {
  try {
    const { branch, search } = req.query;
    const user = req.user; // Attached by optionalAuth middleware

    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }
    if (branch && branch !== "ALL") {
      whereClause.allowedBranches = { has: branch };
    }

    const drives = await prisma.jobDrive.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, email: true, role: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If logged in student, compute dynamic eligibility and application status
    let studentProfile = null;
    let studentApplicationsMap = {};

    if (user && user.role === "STUDENT") {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });

      const userApps = await prisma.application.findMany({
        where: { studentId: user.id },
        select: { jobDriveId: true, status: true },
      });

      userApps.forEach((app) => {
        studentApplicationsMap[app.jobDriveId] = app.status;
      });
    }

    const enrichedDrives = drives.map((drive) => {
      let isEligible = true;
      const ineligibilityReasons = [];

      if (studentProfile) {
        if (studentProfile.cgpa < drive.minCgpa) {
          isEligible = false;
          ineligibilityReasons.push(
            `Minimum CGPA required: ${drive.minCgpa} (Your CGPA: ${studentProfile.cgpa})`
          );
        }
        if (studentProfile.activeBacklogs > drive.maxBacklogs) {
          isEligible = false;
          ineligibilityReasons.push(
            `Maximum backlogs allowed: ${drive.maxBacklogs} (Your backlogs: ${studentProfile.activeBacklogs})`
          );
        }
        if (
          drive.allowedBranches.length > 0 &&
          !drive.allowedBranches.some(
            (b) => b.trim().toLowerCase() === studentProfile.department.trim().toLowerCase()
          )
        ) {
          isEligible = false;
          ineligibilityReasons.push(
            `Department not eligible (Your department: ${studentProfile.department})`
          );
        }
      }

      return {
        ...drive,
        isEligible: studentProfile ? isEligible : true,
        ineligibilityReasons,
        appliedStatus: studentApplicationsMap[drive.id] || null,
        applicantsCount: drive._count.applications,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedDrives.length,
      data: { drives: enrichedDrives },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/drives/:id
const getDriveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const drive = await prisma.jobDrive.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, email: true },
        },
        applications: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { message: "Placement drive not found." },
      });
    }

    return res.status(200).json({
      success: true,
      data: { drive },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/drives (Recruiter / Admin only)
const createDrive = async (req, res, next) => {
  try {
    const data = driveValidationSchema.parse(req.body);

    const drive = await prisma.jobDrive.create({
      data: {
        title: data.title,
        companyName: data.companyName,
        description: data.description,
        ctc: data.ctc,
        location: data.location,
        minCgpa: data.minCgpa,
        allowedBranches: data.allowedBranches,
        maxBacklogs: data.maxBacklogs,
        deadline: new Date(data.deadline),
        createdById: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Placement drive published successfully.",
      data: { drive },
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

// PUT /api/drives/:id
const updateDrive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.jobDrive.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { message: "Drive not found" },
      });
    }

    if (req.user.role !== "ADMIN" && existing.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Unauthorized to modify this recruitment drive." },
      });
    }

    const drive = await prisma.jobDrive.update({
      where: { id },
      data: {
        ...req.body,
        ...(req.body.deadline && { deadline: new Date(req.body.deadline) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Drive updated successfully",
      data: { drive },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/drives/:id
const deleteDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.jobDrive.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Placement drive deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
};
