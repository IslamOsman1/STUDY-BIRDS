const mongoose = require("mongoose");
const slugify = require("slugify");

const recognitionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    detailTitle: {
      type: String,
      default: "",
      trim: true,
    },
    detailBody: {
      type: String,
      default: "",
      trim: true,
    },
    detailImage: {
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

recognitionSchema.pre("validate", function recognitionPreValidate(next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, { lower: true, strict: true }) || `recognition-${this._id}`;
  }

  next();
});

recognitionSchema.index({ featured: -1, sortOrder: 1, createdAt: -1 });
recognitionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Recognition", recognitionSchema);
