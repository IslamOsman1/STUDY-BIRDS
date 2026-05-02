const mongoose = require("mongoose");
const slugify = require("slugify");

const programSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    degreeLevel: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    duration: String,
    tuition: Number,
    partnerTuition: Number,
    applicationDeadline: Date,
    intake: String,
    requirements: [String],
    summary: String,
    articleTitle: String,
    articleHeadings: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "Program article headings cannot exceed 7 items",
      },
    },
    articleBodies: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "Program article bodies cannot exceed 7 items",
      },
    },
    coverImage: String,
    featured: {
      type: Boolean,
      default: false,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

programSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.title) {
    const universityPart = this.university ? String(this.university).slice(-6) : "program";
    this.slug = slugify(`${this.title}-${this.degreeLevel}-${universityPart}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});

module.exports = mongoose.model("Program", programSchema);
