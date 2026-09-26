const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning"],
      default: "info",
    },
    link: String,
    reminderApplication: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    reminderDueAt: Date,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Push send-on-create: post('save') runs on every save, but a document's
// isNew flag has already flipped to false by then, so a pre('save') hook
// stashes it in $locals for the post hook to read. Never blocks or fails
// the notification write itself — push delivery is best-effort.
notificationSchema.pre("save", function captureIsNew(next) {
  this.$locals.wasNew = this.isNew;
  next();
});
notificationSchema.post("save", function sendPush(doc) {
  if (!doc.$locals.wasNew) return;
  const { sendPushToUser, isPushEnabled } = require("../utils/pushNotifications");
  if (!isPushEnabled()) return;
  sendPushToUser(doc.user, { title: doc.title, body: doc.message, link: doc.link })
    .catch((error) => console.error("Push notification send failed", error.message));
});

module.exports = mongoose.model("Notification", notificationSchema);
