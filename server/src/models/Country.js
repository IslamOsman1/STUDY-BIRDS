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
    articleHeadings: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "Country article headings cannot exceed 7 items",
      },
    },
    articleBodies: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 7,
        message: "Country article bodies cannot exceed 7 items",
      },
    },
    visaNotes: String,
    heroImage: String,
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

module.exports = mongoose.model("Country", countrySchema);
