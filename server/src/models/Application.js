const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicantEnglishTestSchema = new mongoose.Schema(
  {
    exam: String,
    score: String,
  },
  { _id: false }
);

const applicantProfileSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    nationality: String,
    currentEducation: String,
    gpa: String,
    intake: String,
    address: String,
    englishTest: applicantEnglishTestSchema,
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    applicantProfile: applicantProfileSchema,
    notes: String,
    status: {
      type: String,
      enum: ["draft", "submitted", "under-review", "accepted", "rejected"],
      default: "submitted",
    },
    statusTimeline: [timelineSchema],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
