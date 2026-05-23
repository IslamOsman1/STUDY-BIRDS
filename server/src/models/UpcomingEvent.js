const mongoose = require("mongoose");

const upcomingEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    eventType: {
      type: String,
      default: "",
      trim: true,
    },
    eventDate: {
      type: Date,
      default: null,
    },
    ctaText: {
      type: String,
      default: "",
      trim: true,
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UpcomingEvent", upcomingEventSchema);
