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

const router = express.Router();

router.get("/", getPrograms);
router.post("/upload-cover", protect, authorize("admin"), upload.single("file"), uploadProgramCover);
router.get("/:id", getProgramById);
router.post("/", protect, authorize("admin"), createProgram);
router.put("/:id", protect, authorize("admin"), updateProgram);
router.delete("/:id", protect, authorize("admin"), deleteProgram);

module.exports = router;
