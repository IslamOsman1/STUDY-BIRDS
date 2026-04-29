const mongoose = require("mongoose");
const slugify = require("slugify");

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
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
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
