const nodemailer = require("nodemailer");

const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
const SMTP_FROM = String(process.env.SMTP_FROM || SMTP_USER || "").trim();
const DEFAULT_CONTACT_TO = String(
  process.env.CONTACT_FORM_TO || process.env.VITE_CONTACT_EMAIL || process.env.CONTACT_EMAIL || ""
).trim();

let transporterPromise = null;

const isMailerConfigured = () => Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);

const getTransporter = async () => {
  if (!isMailerConfigured()) {
    throw new Error("Email delivery is not configured on the server");
  }

  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    );
  }

  return transporterPromise;
};

const sendContactEmail = async ({ to, replyTo, subject, text, html }) => {
  const transporter = await getTransporter();

  return transporter.sendMail({
    from: SMTP_FROM,
    to: to || DEFAULT_CONTACT_TO,
    replyTo,
    subject,
    text,
    html,
  });
};

module.exports = {
  DEFAULT_CONTACT_TO,
  isMailerConfigured,
  sendContactEmail,
};
