const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  registerSchema,
  loginSchema,
  register,
  login,
  getMe,
  logout,
} = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateToken, getMe);
router.post("/logout", logout);

module.exports = router;
