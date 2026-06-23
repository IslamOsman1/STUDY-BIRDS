const StudentProfile = require("../models/StudentProfile");
const Document = require("../models/Document");
const Application = require("../models/Application");
const AgencyRequest = require("../models/AgencyRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");
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

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/documents");

  const document = await Document.create({
    student: req.user._id,
    type: req.body.type || "general",
    fileName: req.file.originalname,
    filePath: uploadResult.url,
    mimeType: req.file.mimetype,
    size: uploadResult.bytes || req.file.size,
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

const getAgencyRequest = asyncHandler(async (req, res) => {
  const agencyRequest = await AgencyRequest.findOne({ student: req.user._id })
    .populate("student", "name email role")
    .populate("reviewedBy", "name email role");

  res.json(agencyRequest);
});

const createAgencyRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "partner") {
    res.status(400);
    throw new Error("You are already a partner");
  }

  const studentNote = String(req.body.studentNote || "").trim();
  const existingRequest = await AgencyRequest.findOne({ student: req.user._id });

  if (existingRequest?.status === "pending") {
    res.status(400);
    throw new Error("Agency request already submitted");
  }

  if (existingRequest) {
    existingRequest.status = "pending";
    existingRequest.studentNote = studentNote;
    existingRequest.adminNote = "";
    existingRequest.submittedAt = new Date();
    existingRequest.reviewedAt = undefined;
    existingRequest.reviewedBy = undefined;
    await existingRequest.save();

    res.status(201).json(
      await AgencyRequest.findById(existingRequest._id)
        .populate("student", "name email role")
        .populate("reviewedBy", "name email role")
    );
    return;
  }

  const agencyRequest = await AgencyRequest.create({
    student: req.user._id,
    studentNote,
  });

  res.status(201).json(
    await AgencyRequest.findById(agencyRequest._id)
      .populate("student", "name email role")
      .populate("reviewedBy", "name email role")
  );
});

module.exports = {
  getProfile,
  updateProfile,
  uploadDocument,
  getDocuments,
  getApplications,
  getAgencyRequest,
  createAgencyRequest,
};
