const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const studentId = req.user?.profile?.id || req.user?.id || "unknown";
    const timestamp = Date.now();
    const cleanExt = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `resume-${studentId}-${timestamp}${cleanExt}`);
  },
});

// File Filter strictly for PDFs
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only PDF documents (.pdf) are allowed."), false);
  }
};

// 5MB Max File Size Limit
const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = {
  uploadResume,
};
