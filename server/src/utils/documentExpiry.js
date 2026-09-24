const Document = require("../models/Document");

// Documents that can lapse: anything still counted as valid or pending.
const EXPIRABLE_STATES = ["uploaded", "under-review", "approved"];

// Moves documents whose expiresAt has passed to "expired" (legacy status
// "pending", matching DOCUMENT_DETAILED_TO_LEGACY_STATUS). Run before reading
// documents so every screen and requirement check sees the same state.
// updateMany skips the save hook, so both fields are written explicitly.
async function expireDueDocuments(filter = {}) {
  const now = new Date();
  await Document.updateMany(
    { ...filter, expiresAt: { $lte: now }, detailedStatus: { $in: EXPIRABLE_STATES } },
    {
      $set: { detailedStatus: "expired", status: "pending" },
      $push: { reviewHistory: { detailedStatus: "expired", note: "انتهت الصلاحية تلقائيًا", changedAt: now } },
    }
  );
}

module.exports = { expireDueDocuments };
