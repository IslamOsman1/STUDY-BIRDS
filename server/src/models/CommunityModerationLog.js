const mongoose = require("mongoose");

// Append-only record of every moderation decision. Entries are never edited
// or deleted, including when the author later deletes their own post.
//   post/comment: fromStatus/toStatus are "published" | "hidden".
//   user (community suspension): "active" | "suspended", with `subject`.
const communityModerationLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["post", "comment", "user"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    fromStatus: { type: String, enum: ["published", "hidden", "active", "suspended"], required: true },
    toStatus: { type: String, enum: ["published", "hidden", "active", "suspended"], required: true },
    note: { type: String, default: "", trim: true, maxlength: 500 },
    reportsClosed: { type: Number, default: 0, min: 0 },
    suspendedUntil: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

communityModerationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommunityModerationLog", communityModerationLogSchema);
