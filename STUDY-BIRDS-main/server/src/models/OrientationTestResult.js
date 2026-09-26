const mongoose = require("mongoose");

const orientationTestResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    answers: {
      favoriteSubjects: [String],
      interestedFields: [String],
      studyStyle: String,
      preferredLanguage: String,
      preferredCountry: String,
      approximateBudget: String,
      desiredDegreeLevel: String,
      avoidFields: [String],
    },
    recommendationSummary: String,
    suggestedFields: [String],
    suggestedCountries: [String],
    adminNote: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrientationTestResult", orientationTestResultSchema);
