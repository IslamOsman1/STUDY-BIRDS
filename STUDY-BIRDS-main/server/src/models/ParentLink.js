const mongoose = require("mongoose");

/**
 * NEW model. Mirrors the existing AgencyRequest pattern (request → admin
 * review → approved/rejected) so a Parent account only ever sees a Student's
 * data after an explicit, auditable link — never by just entering an email.
 */
const parentLinkSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    relationship: {
      type: String,
      trim: true,
      default: "",
    },
    parentNote: {
      type: String,
      trim: true,
      default: "",
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// A parent can only have ONE pending/approved link per student (prevents
// duplicate spam requests); re-requesting after a rejection is still allowed
// by application logic (the controller checks existing status first).
parentLinkSchema.index({ parent: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ParentLink", parentLinkSchema);
