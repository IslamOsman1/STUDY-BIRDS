const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    fieldOfInterest: {
      type: String,
      required: true,
      trim: true,
    },
    currentCountry: {
      type: String,
      required: true,
      trim: true,
    },
    upcomingEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UpcomingEvent",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
