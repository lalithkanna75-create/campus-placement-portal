const express = require("express");
const router = express.Router();
const { protect, optionalAuth, authorize } = require("../middleware/authMiddleware");
const {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  exportDriveApplicantsCSV,
} = require("../controllers/driveController");

router.get("/", optionalAuth, getDrives);
router.get("/:id/export-csv", protect, authorize("RECRUITER", "ADMIN"), exportDriveApplicantsCSV);
router.get("/:id", getDriveById);
router.post("/", protect, authorize("RECRUITER", "ADMIN"), createDrive);
router.put("/:id", protect, authorize("RECRUITER", "ADMIN"), updateDrive);
router.delete("/:id", protect, authorize("ADMIN"), deleteDrive);

module.exports = router;
