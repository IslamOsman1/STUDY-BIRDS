const mongoose = require("mongoose");
const slugify = require("slugify");

const ourServiceSchema = new mongoose.Schema(
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

ourServiceSchema.pre("validate", function ourServicePreValidate(next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, { lower: true, strict: true }) || `service-${this._id}`;
  }

  next();
});

module.exports = mongoose.model("OurService", ourServiceSchema);
