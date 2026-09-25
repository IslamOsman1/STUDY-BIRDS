const mongoose = require("mongoose");

const studentRewardEntrySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["referral", "stage", "bonus", "admin"],
      default: "admin",
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

studentRewardEntrySchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("StudentRewardEntry", studentRewardEntrySchema);
