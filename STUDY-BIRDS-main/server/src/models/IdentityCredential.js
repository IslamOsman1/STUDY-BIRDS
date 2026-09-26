const mongoose = require("mongoose");
const credential = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    credentialID: { type: String, unique: true, required: true },
    publicKey: { type: Buffer, required: true },
    counter: { type: Number, default: 0 },
    transports: [String],
    name: { type: String, maxlength: 80, default: "Passkey" },
  },
  { timestamps: true },
);
const challenge = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    purpose: { type: String, required: true },
    value: String,
    phone: String,
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true },
);
module.exports = {
  Credential: mongoose.model("IdentityCredential", credential),
  Challenge: mongoose.model("IdentityChallenge", challenge),
};
