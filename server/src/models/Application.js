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
    // NEW — granular 12-value lifecycle used by the mobile app. `status`
    // above is untouched and kept in sync automatically (see pre-save hook
    // below), so the existing website admin table keeps filtering/rendering
    // exactly as before with zero code changes there.
    detailedStatus: {
      type: String,
      enum: [
        "draft",
        "documents-missing",
        "ready-to-apply",
        "submitted",
        "under-review",
        "additional-documents-required",
        "conditional-admission",
        "payment-required",
        "payment-verification",
        "final-admission",
        "visa-preparation",
        "completed",
        "accepted",
        "rejected",
      ],
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

applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ detailedStatus: 1, createdAt: -1 });
applicationSchema.index({ reviewedBy: 1, updatedAt: -1 });
applicationSchema.index({ university: 1, createdAt: -1 });
applicationSchema.index({ program: 1, createdAt: -1 });

const { APPLICATION_DETAILED_TO_LEGACY_STATUS } = require("../constants/roles");

applicationSchema.pre("save", function syncLegacyStatus(next) {
  if (this.isModified("detailedStatus")) {
    const legacyStatus = APPLICATION_DETAILED_TO_LEGACY_STATUS[this.detailedStatus];
    if (legacyStatus) {
      this.status = legacyStatus;
    }
  }
  next();
});

module.exports = mongoose.model("Application", applicationSchema);
