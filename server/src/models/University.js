const mongoose = require("mongoose");
const slugify = require("slugify");

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    city: String,
    overview: String,
    articleTitle: String,
    articleHeadings: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "University article headings cannot exceed 7 items",
      },
    },
    articleBodies: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "University article bodies cannot exceed 7 items",
      },
    },
    ranking: Number,
    tuitionRange: {
      min: Number,
      max: Number,
    },
    logo: String,
    campusImages: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    isPartnerInstitution: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

universitySchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("University", universitySchema);
