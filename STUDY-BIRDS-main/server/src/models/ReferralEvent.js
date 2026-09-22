const mongoose = require("mongoose");

const referralEventSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["click", "signup", "accepted", "commission"],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    studentEmail: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReferralEvent", referralEventSchema);
