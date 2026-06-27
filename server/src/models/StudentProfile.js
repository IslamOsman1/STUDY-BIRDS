const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: String,
    englishFullName: String,
    passportNumber: String,
    dateOfBirth: Date,
    nationality: String,
    currentEducation: String,
    currentEducationLevel: {
      type: String,
      enum: ["high-school", "bachelor", "master", "phd", ""],
      default: "",
    },
    currentResidenceCountry: String,
    gpa: String,
    englishTest: {
      exam: String,
      score: String,
    },
    targetCountries: [String],
    intake: String,
    bio: String,
    address: String,
    companyName: String,
    website: String,
    location: String,
    taxId: String,
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationReason: String,
    referralCode: {
      type: String,
      index: true,
      sparse: true,
    },
    applicationStage: {
      type: String,
      enum: [
        "file-received",
        "applying",
        "preliminary-accepted",
        "first-payment",
        "final-accepted",
        "travel-and-settlement",
      ],
      default: "file-received",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
