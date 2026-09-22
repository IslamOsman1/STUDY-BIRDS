const express = require("express");
const {
  createLinkRequest,
  getLinkRequests,
  getChildren,
  getChildOverview,
  getChildPayments,
} = require("../controllers/parentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("parent"));
router.post("/link-requests", createLinkRequest);
router.get("/link-requests", getLinkRequests);
router.get("/children", getChildren);
router.get("/children/:studentId/overview", getChildOverview);
router.get("/children/:studentId/payments", getChildPayments);

module.exports = router;
