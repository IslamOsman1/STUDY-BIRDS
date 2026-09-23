const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const PushToken = require("../models/PushToken");
const { isPushEnabled } = require("../utils/pushNotifications");

const router = express.Router();
router.use(protect);

router.get("/status", (req, res) => res.json({ enabled: isPushEnabled() }));

router.post("/", asyncHandler(async (req, res) => {
  const { token, platform = "android" } = req.body;
  if (typeof token !== "string" || !token.trim() || token.length > 4096 || !["ios", "android", "web"].includes(platform)) {
    return res.status(400).json({ message: "Invalid push token" });
  }
  await PushToken.findOneAndUpdate({ token: token.trim() }, { user: req.user._id, platform }, { upsert: true, setDefaultsOnInsert: true });
  res.status(201).json({ registered: true });
}));

router.delete("/", asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (typeof token !== "string" || !token.trim()) return res.status(400).json({ message: "Invalid push token" });
  await PushToken.deleteOne({ token: token.trim(), user: req.user._id });
  res.json({ removed: true });
}));

module.exports = router;
