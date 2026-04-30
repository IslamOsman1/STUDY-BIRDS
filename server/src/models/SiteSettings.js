const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    contactEmail: String,
    whatsappUrl: String,
    facebookUrl: String,
    instagramUrl: String,
    tiktokUrl: String,
    supportHours: String,
    officeLocations: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
