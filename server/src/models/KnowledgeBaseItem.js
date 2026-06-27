const mongoose = require("mongoose");

const knowledgeBaseItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "general",
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    resourceType: {
      type: String,
      enum: ["article", "pdf", "video", "link"],
      default: "article",
    },
    fileUrl: String,
    videoUrl: String,
    targetRole: {
      type: String,
      enum: ["all", "student", "partner"],
      default: "all",
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeBaseItem", knowledgeBaseItemSchema);
