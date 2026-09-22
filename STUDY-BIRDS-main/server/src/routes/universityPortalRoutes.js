const express = require("express");
const {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  requestDocument,
} = require("../controllers/universityPortalController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("university"));
router.get("/applications", getApplications);
router.get("/applications/:id", getApplicationById);
router.patch("/applications/:id/status", updateApplicationStatus);
router.post("/applications/:id/request-document", requestDocument);

module.exports = router;
