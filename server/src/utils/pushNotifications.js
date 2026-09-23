// Sends push notifications via Firebase Cloud Messaging. Disabled (a no-op)
// until FIREBASE_SERVICE_ACCOUNT_JSON is set in the environment — matches
// the same "build the integration, ship it inert" pattern already used for
// consultation reminders and the AI assistant in this codebase. See
// PUSH_NOTIFICATIONS.md for the deployment checklist.
let firebaseApp = null;

function isPushEnabled() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

function getMessaging() {
  if (!isPushEnabled()) return null;
  const admin = require("firebase-admin");
  if (!firebaseApp) {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    firebaseApp = admin.apps.length ? admin.app() : admin.initializeApp({ credential: admin.credential.cert(credentials) });
  }
  return admin.messaging(firebaseApp);
}

const INVALID_TOKEN_ERRORS = ["messaging/invalid-registration-token", "messaging/registration-token-not-registered"];

async function sendPushToUser(userId, { title, body, link }) {
  const messaging = getMessaging();
  if (!messaging) return { sent: 0, disabled: true };
  const PushToken = require("../models/PushToken");
  const tokens = await PushToken.find({ user: userId }).select("token").lean();
  if (!tokens.length) return { sent: 0 };
  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: { title, body },
    data: link ? { link } : undefined,
  });
  const invalidTokens = response.responses
    .map((r, i) => (!r.success && INVALID_TOKEN_ERRORS.includes(r.error?.code) ? tokens[i].token : null))
    .filter(Boolean);
  if (invalidTokens.length) await PushToken.deleteMany({ token: { $in: invalidTokens } });
  return { sent: response.successCount };
}

module.exports = { sendPushToUser, isPushEnabled };
