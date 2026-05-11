const mongoose = require("mongoose");
const slugify = require("slugify");

const exhibitionSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    titleColor: {
      type: String,
      trim: true,
      default: "#0f172a",
    },
    youtubeUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const exhibitionArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    titleColor: {
      type: String,
      trim: true,
      default: "#0f172a",
    },
    ctaText: {
      type: String,
      trim: true,
      default: "",
    },
    ctaUrl: {
      type: String,
      trim: true,
      default: "",
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    sections: {
      type: [exhibitionSectionSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

exhibitionArticleSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("ExhibitionArticle", exhibitionArticleSchema);
