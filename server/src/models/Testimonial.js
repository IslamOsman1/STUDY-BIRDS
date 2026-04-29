const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    destination: String,
    quote: {
      type: String,
      required: true,
    },
    avatar: String,
    rating: {
      type: Number,
      default: 5,
    },
    featured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
