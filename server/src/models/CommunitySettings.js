const mongoose = require("mongoose");

// Single document (key "community") holding moderator-managed settings.
const communitySettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "community", unique: true },
    blockedTerms: { type: [String], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunitySettings", communitySettingsSchema);
