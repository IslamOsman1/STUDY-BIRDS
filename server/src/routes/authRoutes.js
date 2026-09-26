const express = require("express");
const {
  register,
  login,
  googleLogin,
  me,
  changePassword,
  refresh,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, me);
router.post("/change-password", protect, changePassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
