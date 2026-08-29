const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware");
const {
  driveSchema,
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
} = require("../controllers/drives.controller");

router.get("/", getDrives);
router.get("/:id", getDriveById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("RECRUITER", "ADMIN"),
  validate(driveSchema),
  createDrive
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("RECRUITER", "ADMIN"),
  updateDrive
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deleteDrive
);

module.exports = router;
