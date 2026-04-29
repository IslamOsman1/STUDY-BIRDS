const express = require("express");
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/", authorize("student"), createApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id/status", authorize("admin"), updateApplicationStatus);

module.exports = router;
