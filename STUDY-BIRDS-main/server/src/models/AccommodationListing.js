const mongoose = require("mongoose");

const accommodationListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["single", "shared", "apartment"], required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University", required: true },
    distanceFromCampusKm: { type: Number, min: 0 },
    amenities: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", trim: true },
    rules: { type: String, default: "", trim: true },
    capacity: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

accommodationListingSchema.index({ university: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("AccommodationListing", accommodationListingSchema);
