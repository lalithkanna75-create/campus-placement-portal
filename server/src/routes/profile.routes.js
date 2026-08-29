const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware");
const {
  profileSchema,
  getMyProfile,
  upsertMyProfile,
} = require("../controllers/profile.controller");

router.get("/me", authenticateToken, authorizeRoles("STUDENT"), getMyProfile);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  validate(profileSchema),
  upsertMyProfile
);
router.put(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  validate(profileSchema),
  upsertMyProfile
);

module.exports = router;
