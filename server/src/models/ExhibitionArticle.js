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
      trim: true,
    },
    customSlug: {
      type: String,
      default: "",
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    articleTitle: {
      type: String,
      trim: true,
      default: "",
    },
    articleTitleColor: {
      type: String,
      trim: true,
      default: "#0f172a",
    },
    articleHeadingColor: {
      type: String,
      trim: true,
      default: "#0f172a",
    },
    articleBodyColor: {
      type: String,
      trim: true,
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
      default: "",
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
    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
    focusKeyword: {
      type: String,
      default: "",
      trim: true,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    ogTitle: {
      type: String,
      default: "",
      trim: true,
    },
    ogDescription: {
      type: String,
      default: "",
      trim: true,
    },
    ogImage: {
      type: String,
      default: "",
      trim: true,
    },
    twitterTitle: {
      type: String,
      default: "",
      trim: true,
    },
    twitterDescription: {
      type: String,
      default: "",
      trim: true,
    },
    twitterImage: {
      type: String,
      default: "",
      trim: true,
    },
    imageAltText: {
      type: String,
      default: "",
      trim: true,
    },
    robotsIndex: {
      type: String,
      enum: ["index", "noindex"],
      default: "index",
    },
    robotsFollow: {
      type: String,
      enum: ["follow", "nofollow"],
      default: "follow",
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      default: null,
    },
    authorName: {
      type: String,
      default: "",
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    seoUpdatedAt: {
      type: Date,
      default: null,
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

exhibitionArticleSchema.index({ published: 1, featured: -1, createdAt: -1 });
exhibitionArticleSchema.index({ category: 1, published: 1, createdAt: -1 });
exhibitionArticleSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ExhibitionArticle", exhibitionArticleSchema);
