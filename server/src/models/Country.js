const mongoose = require("mongoose");
const slugify = require("slugify");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: String,
    articleTitle: String,
    articleTitleColor: {
      type: String,
      default: "#0f172a",
    },
    articleHeadingColor: {
      type: String,
      default: "#0f172a",
    },
    articleBodyColor: {
      type: String,
      default: "#475569",
    },
    articleHeadings: {
      type: [String],
      default: [],
    },
    articleBodies: {
      type: [String],
      default: [],
    },
    visaNotes: String,
    heroImage: String,
    universityCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialtyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageTuition: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

countrySchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

countrySchema.index({ featured: -1, name: 1 });

module.exports = mongoose.model("Country", countrySchema);
