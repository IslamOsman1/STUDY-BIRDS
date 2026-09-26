const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    storage: { type: new mongoose.Schema({
      publicId: String, resourceType: String, deliveryType: String, format: String,
    }, { _id: false }), select: false },
    mimeType: String,
    size: Number,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    // NEW — granular 8-value lifecycle used by the mobile app (Missing,
    // Uploaded, Under Review, Approved, Rejected, Needs Revision, Needs
    // Translation, Expired). `status` above is untouched and kept in sync
    // automatically, so the website's existing document views are
    // unaffected.
    detailedStatus: {
      type: String,
      enum: [
        "missing",
        "uploaded",
        "under-review",
        "approved",
        "rejected",
        "needs-revision",
        "needs-translation",
        "expired",
      ],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

const { DOCUMENT_DETAILED_TO_LEGACY_STATUS } = require("../constants/roles");

documentSchema.pre("save", function syncLegacyStatus(next) {
  if (this.isModified("detailedStatus")) {
    const legacyStatus = DOCUMENT_DETAILED_TO_LEGACY_STATUS[this.detailedStatus];
    if (legacyStatus) {
      this.status = legacyStatus;
    }
  }
  if (this.isModified("status") && !this.isModified("detailedStatus")) {
    const detailByLegacy = {"pending": "uploaded", "verified": "approved", "rejected": "rejected"};
    if (detailByLegacy[this.status]) this.detailedStatus = detailByLegacy[this.status];
  }
  next();
});

module.exports = mongoose.model("Document", documentSchema);
