const express = require("express");
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const { requireSection, authorizeApplicationRead } = require("../middleware/employeeAccess");

router.use(protect);
router.post("/", authorize("student"), createApplication);
router.get("/", authorizeApplicationRead, getApplications);
router.get("/:id", authorizeApplicationRead, getApplicationById);
router.put("/:id/status", requireSection("applications"), updateApplicationStatus);
router.delete("/:id", requireSection("applications"), deleteApplication);

module.exports = router;
