const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware");
const {
  applySchema,
  statusUpdateSchema,
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  updateApplicationStatus,
} = require("../controllers/applications.controller");

router.post(
  "/apply",
  authenticateToken,
  authorizeRoles("STUDENT"),
  validate(applySchema),
  applyForDrive
);

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getMyApplications
);

router.get(
  "/drive/:driveId",
  authenticateToken,
  authorizeRoles("RECRUITER", "ADMIN"),
  getDriveApplications
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("RECRUITER", "ADMIN"),
  validate(statusUpdateSchema),
  updateApplicationStatus
);

module.exports = router;
