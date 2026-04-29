const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadDocument,
  getDocuments,
  getApplications,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", authorize("student", "partner"), updateProfile);
router.use(authorize("student"));
router.post("/documents", upload.single("file"), uploadDocument);
router.get("/documents", getDocuments);
router.get("/applications", getApplications);

module.exports = router;
