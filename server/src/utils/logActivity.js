const ActivityLog = require("../models/ActivityLog");

const logActivity = async (req, userId, action, description, metadata = {}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      description,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
      metadata,
    });
  } catch (error) {
    console.error("Failed to store activity log:", error.message);
  }
};

module.exports = {
  logActivity,
};
