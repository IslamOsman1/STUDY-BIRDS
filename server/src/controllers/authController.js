const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { OAuth2Client } = require("google-auth-library");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client();

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  authProvider: user.authProvider,
  emailVerified: user.emailVerified,
});

const ensureStudentProfile = async (userId) => {
  const existingProfile = await StudentProfile.findOne({ user: userId });
  if (!existingProfile) {
    await StudentProfile.create({ user: userId });
  }
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (!String(name || "").trim() || !normalizedEmail || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const user = await User.create({
    name: String(name || "").trim(),
    email: normalizedEmail,
    password,
    role: "student",
    authProvider: "local",
  });

  await ensureStudentProfile(user._id);

  res.status(201).json({
    token: generateToken(user._id),
    user: serializeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated by an administrator");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    token: generateToken(user._id),
    user: serializeUser(user),
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const googleClientIds = String(process.env.GOOGLE_CLIENT_ID || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!googleClientIds.length) {
    res.status(503);
    throw new Error("Google sign-in is not configured");
  }

  if (!credential) {
    res.status(400);
    throw new Error("Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleClientIds,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    res.status(401);
    throw new Error("Unable to verify Google account");
  }

  const normalizedEmail = payload.email.toLowerCase().trim();
  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
  });

  if (!user) {
    user = await User.create({
      name: payload.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId: payload.sub,
      authProvider: "google",
      emailVerified: true,
      avatar: payload.picture,
      role: "student",
    });

    await ensureStudentProfile(user._id);
  } else {
    if (!user.isActive) {
      res.status(403);
      throw new Error("This account has been deactivated by an administrator");
    }

    user.googleId = user.googleId || payload.sub;
    user.emailVerified = true;

    if (!user.avatar && payload.picture) {
      user.avatar = payload.picture;
    }

    if (!user.authProvider) {
      user.authProvider = user.password ? "local" : "google";
    }
  }

  user.lastLoginAt = new Date();
  await user.save();

  if (user.role === "student") {
    await ensureStudentProfile(user._id);
  }

  res.json({
    token: generateToken(user._id),
    user: serializeUser(user),
  });
});

const me = asyncHandler(async (req, res) => {
  const profile =
    req.user.role === "student"
      ? await StudentProfile.findOne({ user: req.user._id })
      : null;

  res.json({
    user: req.user,
    profile,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    res.status(400);
    throw new Error("New password is required");
  }

  if (String(newPassword).length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.password && !currentPassword) {
    res.status(400);
    throw new Error("Current password is required");
  }

  if (user.password && !(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

module.exports = {
  register,
  login,
  googleLogin,
  me,
  changePassword,
};
