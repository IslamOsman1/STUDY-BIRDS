const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    commentCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published", index: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationNote: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

communityPostSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("CommunityPost", communityPostSchema);
