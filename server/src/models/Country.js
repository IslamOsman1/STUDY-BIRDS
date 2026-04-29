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
