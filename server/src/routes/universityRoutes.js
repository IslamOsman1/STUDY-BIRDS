const express = require("express");
const {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  uploadUniversityImages,
} = require("../controllers/universityController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { cacheRoute } = require("../utils/responseCache");

const router = express.Router();

router.get("/", cacheRoute(60_000), getUniversities);
router.get("/:id", cacheRoute(60_000), getUniversityById);
router.post("/upload-images", protect, authorize("admin"), upload.array("files", 6), uploadUniversityImages);
router.post("/", protect, authorize("admin"), createUniversity);
router.put("/:id", protect, authorize("admin"), updateUniversity);
router.delete("/:id", protect, authorize("admin"), deleteUniversity);

module.exports = router;
