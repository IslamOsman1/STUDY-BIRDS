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
    dateOfBirth: Date,
    nationality: String,
    currentEducation: String,
    gpa: String,
    englishTest: {
      exam: String,
      score: String,
    },
    targetCountries: [String],
    intake: String,
    bio: String,
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
