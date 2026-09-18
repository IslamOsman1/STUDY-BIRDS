const express = require("express");
const {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  uploadUniversityImages,
} = require("../controllers/universityController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { cacheRoute } = require("../utils/responseCache");

const { requireSection } = require("../middleware/employeeAccess");
const router = express.Router();

router.get("/", cacheRoute(60_000), getUniversities);
router.get("/:id", cacheRoute(60_000), getUniversityById);
router.post("/upload-images", protect, requireSection("universities"), upload.array("files", 6), uploadUniversityImages);
router.post("/", protect, requireSection("universities"), createUniversity);
router.put("/:id", protect, requireSection("universities"), updateUniversity);
router.delete("/:id", protect, requireSection("universities"), deleteUniversity);

module.exports = router;
