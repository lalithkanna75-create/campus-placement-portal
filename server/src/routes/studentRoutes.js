const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");
const {
  uploadStudentResume,
  getStudentProfile,
  upsertStudentProfile,
} = require("../controllers/studentController");

const router = express.Router();

// Protected: Student Only
router.post("/profile", protect, authorize("STUDENT"), upsertStudentProfile);
router.get("/profile", protect, authorize("STUDENT"), getStudentProfile);

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

module.exports = router;
