const mongoose = require("mongoose");

// One row per physical device token (FCM tokens are device-scoped, not
// account-scoped) — re-registering an existing token just moves it to
// whichever account is currently logged in on that device.
const pushTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["ios", "android", "web"], default: "android" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PushToken", pushTokenSchema);
