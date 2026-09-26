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
    // Staff review. reviewNote is shown to the student as the reason
    // (mandatory for rejected / needs-revision / needs-translation).
    reviewNote: { type: String, default: "", trim: true, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    // Optional validity end (passport, language certificate...). Past it the
    // document is moved to "expired" — see utils/documentExpiry.js.
    expiresAt: Date,
    reviewHistory: [{
      _id: false,
      detailedStatus: String,
      note: String,
      expiresAt: Date,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedAt: { type: Date, default: Date.now },
    }],
    // Version history (PRD 29): a re-upload points at the file it replaces,
    // and the replaced file points forward. Old versions are never deleted.
    replaces: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    supersededBy: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    // A certified translation uploaded for another document of the student.
    translationOf: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  },
  { timestamps: true }
);

documentSchema.index({ expiresAt: 1, detailedStatus: 1 });
documentSchema.index({ student: 1, translationOf: 1 });

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
