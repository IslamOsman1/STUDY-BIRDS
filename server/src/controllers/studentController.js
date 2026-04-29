const StudentProfile = require("../models/StudentProfile");
const Document = require("../models/Document");
const Application = require("../models/Application");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const {
  hydrateApplicationsWithStudentProfiles,
} = require("../utils/hydrateApplications");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
    "user",
    "-password"
  );

  res.json(profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    dateOfBirth,
    nationality,
    currentEducation,
    gpa,
    englishTest,
    targetCountries,
    intake,
    bio,
    address,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  if (typeof email === "string" && email.trim()) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = normalizedEmail;
  }

  await user.save();

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      phone,
      dateOfBirth,
      nationality,
      currentEducation,
      gpa,
      englishTest,
      targetCountries,
      intake,
      bio,
      address,
    },
    { new: true, upsert: true }
  ).populate("user", "-password");

  res.json(profile);
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("File is required");
  }

const document = await Document.create({
    student: req.user._id,
    type: req.body.type || "general",
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  res.status(201).json(document);
});

const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json(documents);
});

const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate({
      path: "program",
      populate: {
        path: "university",
        populate: { path: "country" },
      },
    })
    .populate("documents")
    .populate("statusTimeline.changedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(await hydrateApplicationsWithStudentProfiles(applications));
});

module.exports = {
  getProfile,
  updateProfile,
  uploadDocument,
  getDocuments,
  getApplications,
};
