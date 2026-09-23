const mongoose = require("mongoose");

const accommodationBookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "AccommodationListing", required: true },
    moveInDate: Date,
    notes: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "confirmed", "rejected", "cancelled"], default: "pending", index: true },
    staffNote: { type: String, default: "", trim: true },
    history: [{
      status: { type: String, enum: ["pending", "confirmed", "rejected", "cancelled"] },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

accommodationBookingSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("AccommodationBooking", accommodationBookingSchema);
