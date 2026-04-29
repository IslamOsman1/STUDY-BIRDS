const Application = require("../models/Application");
const Program = require("../models/Program");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const {
  hydrateApplicationsWithStudentProfiles,
} = require("../utils/hydrateApplications");

const createApplication = asyncHandler(async (req, res) => {
  const { programId, documentIds = [], notes, applicantProfile } = req.body;

  const program = await Program.findById(programId).populate("university");
  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }

  const documents = await Document.find({
    _id: { $in: documentIds },
    student: req.user._id,
  });

  const existingApplication = await Application.findOne({
    student: req.user._id,
    program: program._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error("An application for this program already exists");
  }

  const requiredDocumentTypes = ["passport", "biometric-photo", "latest-qualification"];
  const documentTypes = new Set(documents.map((document) => document.type));
  const missingRequiredDocument = requiredDocumentTypes.some((type) => !documentTypes.has(type));

  if (missingRequiredDocument) {
    res.status(400);
    throw new Error("Biometric photo, passport file, and latest qualification are required");
  }

  const application = await Application.create({
    student: req.user._id,
    program: program._id,
    university: program.university._id,
    documents: documents.map((document) => document._id),
    applicantProfile,
    notes,
    status: "submitted",
    statusTimeline: [
      {
        status: "submitted",
        note: "Application submitted",
        changedBy: req.user._id,
      },
    ],
  });

  await Notification.create({
    user: req.user._id,
    title: "Application submitted",
    message: `Your application for ${program.title} has been submitted.`,
    type: "success",
    link: `/student/applications`,
  });

  const populated = await Application.findById(application._id)
    .populate("student", "-password")
    .populate({
      path: "program",
      populate: { path: "university", populate: { path: "country" } },
    })
    .populate("documents")
    .populate("statusTimeline.changedBy", "name role");

  res.status(201).json(await hydrateApplicationsWithStudentProfiles(populated));
});

const getApplications = asyncHandler(async (req, res) => {
  const query = req.user.role === "student" ? { student: req.user._id } : {};

  const applications = await Application.find(query)
    .populate("student", "-password")
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

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("student", "-password")
    .populate({
      path: "program",
      populate: {
        path: "university",
        populate: { path: "country" },
      },
    })
    .populate("documents")
    .populate("statusTimeline.changedBy", "name role");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (req.user.role === "student" && String(application.student._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  res.json(await hydrateApplicationsWithStudentProfiles(application));
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const application = await Application.findById(req.params.id).populate("program");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  application.status = status;
  application.reviewedBy = req.user._id;
  application.statusTimeline.push({
    status,
    note,
    changedBy: req.user._id,
  });

  await application.save();

  await Notification.create({
    user: application.student,
    title: "Application updated",
    message: `Your application status is now ${status} for ${application.program.title}.`,
    type: status === "accepted" ? "success" : "info",
    link: "/student/applications",
  });

  const populated = await Application.findById(application._id)
    .populate("student", "-password")
    .populate({
      path: "program",
      populate: { path: "university", populate: { path: "country" } },
    })
    .populate("documents")
    .populate("statusTimeline.changedBy", "name role");

  res.json(await hydrateApplicationsWithStudentProfiles(populated));
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};
