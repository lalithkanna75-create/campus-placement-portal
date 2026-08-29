const { z } = require("zod");
const prisma = require("../config/prisma");

const driveSchema = {
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    companyName: z.string().min(2, "Company name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    ctc: z.string().min(1, "CTC is required"),
    location: z.string().min(1, "Location is required"),
    minCgpa: z.number().min(0).max(10).default(0.0),
    allowedBranches: z.array(z.string()).default([]),
    maxBacklogs: z.number().int().min(0).default(0),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid ISO date string"),
  }),
};

// GET /api/drives
const getDrives = async (req, res, next) => {
  try {
    const { branch, maxBacklogs, search } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    if (branch) {
      whereClause.allowedBranches = { has: branch };
    }

    if (maxBacklogs !== undefined) {
      whereClause.maxBacklogs = { gte: parseInt(maxBacklogs, 10) };
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

    return res.status(200).json({
      success: true,
      count: drives.length,
      data: { drives },
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
        error: { message: "Placement drive not found" },
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
    const {
      title,
      companyName,
      description,
      ctc,
      location,
      minCgpa = 0.0,
      allowedBranches = [],
      maxBacklogs = 0,
      deadline,
    } = req.body;

    const drive = await prisma.jobDrive.create({
      data: {
        title,
        companyName,
        description,
        ctc,
        location,
        minCgpa,
        allowedBranches,
        maxBacklogs,
        deadline: new Date(deadline),
        createdById: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Placement drive created successfully",
      data: { drive },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/drives/:id (Recruiter / Admin only)
const updateDrive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingDrive = await prisma.jobDrive.findUnique({ where: { id } });
    if (!existingDrive) {
      return res.status(404).json({
        success: false,
        error: { message: "Placement drive not found" },
      });
    }

    if (req.user.role !== "ADMIN" && existingDrive.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Unauthorized to update this drive" },
      });
    }

    const updatedDrive = await prisma.jobDrive.update({
      where: { id },
      data: {
        ...req.body,
        ...(req.body.deadline && { deadline: new Date(req.body.deadline) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Drive updated successfully",
      data: { drive: updatedDrive },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/drives/:id (Admin only)
const deleteDrive = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.jobDrive.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Placement drive deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  driveSchema,
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
};
