const mongoose = require("mongoose");

// One document per suspended student. Lifting a suspension deletes it; the
// moderation log keeps the history.
const communitySuspensionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    // null = until a moderator lifts it.
    until: { type: Date, default: null },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

communitySuspensionSchema.statics.activeFor = function activeFor(userId) {
  return this.findOne({ user: userId, $or: [{ until: null }, { until: { $gt: new Date() } }] }).lean();
};

module.exports = mongoose.model("CommunitySuspension", communitySuspensionSchema);
