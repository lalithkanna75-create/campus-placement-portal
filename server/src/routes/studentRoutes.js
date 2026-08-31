const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");
const {
  uploadStudentResume,
  getStudentProfile,
  upsertStudentProfile,
  getStudentResume,
} = require("../controllers/studentController");

const router = express.Router();

// Protected: Student Only Profile Management
router.post("/profile", protect, authorize("STUDENT"), upsertStudentProfile);
router.get("/profile", protect, authorize("STUDENT"), getStudentProfile);

// Protected: Student Resume Upload
router.post(
  "/upload-resume",
  protect,
  authorize("STUDENT"),
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: { message: err.message || "File upload error" },
        });
      }
      next();
    });
  },
  uploadStudentResume
);

// Protected: Authenticated & Authorized Resume Streaming (Student owner, Hiring Recruiter, Admin)
router.get("/resume/:userId", protect, getStudentResume);

module.exports = router;
