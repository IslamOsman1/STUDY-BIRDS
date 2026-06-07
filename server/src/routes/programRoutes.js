const express = require("express");
const {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  uploadProgramCover,
} = require("../controllers/programController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { cacheRoute } = require("../utils/responseCache");

const router = express.Router();

router.get("/", cacheRoute(60_000), getPrograms);
router.post("/upload-cover", protect, authorize("admin"), upload.single("file"), uploadProgramCover);
router.get("/:id", cacheRoute(60_000), getProgramById);
router.post("/", protect, authorize("admin"), createProgram);
router.put("/:id", protect, authorize("admin"), updateProgram);
router.delete("/:id", protect, authorize("admin"), deleteProgram);

module.exports = router;
