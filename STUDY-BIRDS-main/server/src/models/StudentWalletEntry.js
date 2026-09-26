const mongoose = require("mongoose");

const studentWalletEntrySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    kind: { type: String, enum: ["referral-reward", "redemption", "adjustment"], required: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "", trim: true, maxlength: 500 },
    relatedReferral: { type: mongoose.Schema.Types.ObjectId, ref: "StudentReferral" },
    relatedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    // Present only for staff-issued manual adjustments; automatic entries
    // (referral rewards, redemptions) have no human author.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

studentWalletEntrySchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("StudentWalletEntry", studentWalletEntrySchema);
