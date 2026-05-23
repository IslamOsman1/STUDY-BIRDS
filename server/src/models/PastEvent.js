const mongoose = require("mongoose");
const slugify = require("slugify");

const pastEventMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const pastEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["expos-fairs", "our-community", "webinars", "partnerships"],
      required: true,
    },
    eventDate: {
      type: Date,
      default: null,
    },
    countryCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    mediaItems: {
      type: [pastEventMediaSchema],
      default: [],
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

pastEventSchema.pre("validate", function pastEventPreValidate(next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, { lower: true, strict: true }) || `event-${this._id}`;
  }

  next();
});

module.exports = mongoose.model("PastEvent", pastEventSchema);
