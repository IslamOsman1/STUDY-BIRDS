const mongoose = require("mongoose");

const storyFounderSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
  },
  { _id: true }
);

const storyTimelineItemSchema = new mongoose.Schema(
  {
    year: { type: String, default: "", trim: true },
    dateLabel: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const storyImpactStatSchema = new mongoose.Schema(
  {
    value: { type: String, default: "", trim: true },
    label: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const ourStorySchema = new mongoose.Schema(
  {
    heroEyebrow: { type: String, default: "", trim: true },
    heroTitle: { type: String, default: "", trim: true },
    heroBody: { type: String, default: "", trim: true },
    heroImage: { type: String, default: "" },
    heroCtaText: { type: String, default: "", trim: true },
    heroCtaLink: { type: String, default: "", trim: true },
    storyEyebrow: { type: String, default: "", trim: true },
    storyTitle: { type: String, default: "", trim: true },
    storyBody: { type: String, default: "", trim: true },
    storyImage: { type: String, default: "" },
    missionTitle: { type: String, default: "", trim: true },
    missionBody: { type: String, default: "", trim: true },
    visionTitle: { type: String, default: "", trim: true },
    visionBody: { type: String, default: "", trim: true },
    foundersTitle: { type: String, default: "", trim: true },
    foundersBody: { type: String, default: "", trim: true },
    founders: { type: [storyFounderSchema], default: [] },
    timelineTitle: { type: String, default: "", trim: true },
    timelineBody: { type: String, default: "", trim: true },
    timelineItems: { type: [storyTimelineItemSchema], default: [] },
    impactTitle: { type: String, default: "", trim: true },
    impactBody: { type: String, default: "", trim: true },
    impactStats: { type: [storyImpactStatSchema], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OurStory", ourStorySchema);
