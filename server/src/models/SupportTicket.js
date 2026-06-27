const mongoose = require("mongoose");

const SUPPORT_TICKET_CATEGORIES = [
  "documents",
  "application-status",
  "payment",
  "arrival-services",
  "student-application",
  "commission",
  "technical-issue",
  "other",
];

const supportReplySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    fromRole: {
      type: String,
      enum: ["student", "partner", "admin"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    requesterRole: {
      type: String,
      enum: ["student", "partner"],
      default: "partner",
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: SUPPORT_TICKET_CATEGORIES,
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "answered", "closed"],
      default: "open",
    },
    attachment: {
      fileName: String,
      filePath: String,
      mimeType: String,
      size: Number,
    },
    replies: [supportReplySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
module.exports.SUPPORT_TICKET_CATEGORIES = SUPPORT_TICKET_CATEGORIES;
