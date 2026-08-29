const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

// Student endpoints
router.post(
  "/apply/:driveId",
  protect,
  authorize("STUDENT"),
  applyForDrive
);
router.post(
  "/apply",
  protect,
  authorize("STUDENT"),
  applyForDrive
);
router.get(
  "/my-applications",
  protect,
  authorize("STUDENT"),
  getMyApplications
);
router.get(
  "/my",
  protect,
  authorize("STUDENT"),
  getMyApplications
);

// Recruiter & Admin endpoints
router.get(
  "/drive/:driveId",
  protect,
  authorize("RECRUITER", "ADMIN"),
  getDriveApplications
);
router.patch(
  "/:id/status",
  protect,
  authorize("RECRUITER", "ADMIN"),
  updateApplicationStatus
);

module.exports = router;
