const mongoose = require("mongoose");

const communityCommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    reportCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published", index: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationNote: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

communityCommentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model("CommunityComment", communityCommentSchema);
