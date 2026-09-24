const mongoose = require("mongoose");

const REPORT_REASONS = ["spam", "abuse", "misinformation", "privacy", "other"];

const communityReportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["post", "comment"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    // The post the target belongs to (the post itself for post reports).
    post: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, default: "", trim: true, maxlength: 500 },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

// One report per student per piece of content.
communityReportSchema.index({ targetType: 1, target: 1, reporter: 1 }, { unique: true });
communityReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("CommunityReport", communityReportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
