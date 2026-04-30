const mongoose = require("mongoose");
const slugify = require("slugify");

const studyFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

studyFieldSchema.pre("validate", function setSlug(next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug =
      slugify(this.name, {
        lower: true,
        strict: true,
      }) || `study-field-${Date.now()}`;
  }

  next();
});

module.exports = mongoose.model("StudyField", studyFieldSchema);
