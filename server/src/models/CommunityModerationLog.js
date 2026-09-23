const mongoose = require("mongoose");

// Append-only record of every moderation decision. Entries are never edited
// or deleted, including when the author later deletes their own post.
const communityModerationLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["post", "comment"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
    fromStatus: { type: String, enum: ["published", "hidden"], required: true },
    toStatus: { type: String, enum: ["published", "hidden"], required: true },
    note: { type: String, default: "", trim: true, maxlength: 500 },
    reportsClosed: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

communityModerationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommunityModerationLog", communityModerationLogSchema);
