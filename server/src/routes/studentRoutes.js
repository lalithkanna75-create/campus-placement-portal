const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");
const {
  uploadStudentResume,
  getStudentProfile,
} = require("../controllers/studentController");

const router = express.Router();

// Protected: Student Only
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

router.get("/profile", protect, authorize("STUDENT"), getStudentProfile);

module.exports = router;
