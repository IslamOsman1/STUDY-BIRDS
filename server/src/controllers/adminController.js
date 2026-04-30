const User = require("../models/User");
const Application = require("../models/Application");
const University = require("../models/University");
const Program = require("../models/Program");
const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const SiteSettings = require("../models/SiteSettings");
const Testimonial = require("../models/Testimonial");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");
const {
  hydrateApplicationsWithStudentProfiles,
} = require("../utils/hydrateApplications");

const getStats = asyncHandler(async (req, res) => {
  const [students, universities, programs, applications] = await Promise.all([
    User.countDocuments({ role: "student" }),
    University.countDocuments(),
    Program.countDocuments(),
    Application.countDocuments(),
  ]);

  res.json({
    students,
    universities,
    programs,
    applications,
  });
});

const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
  res.json(students);
});

const getAdminApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate("student", "-password")
    .populate({
      path: "program",
      populate: { path: "university", populate: { path: "country" } },
    })
    .populate("documents")
    .populate("statusTimeline.changedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(await hydrateApplicationsWithStudentProfiles(applications));
});

const getOverview = asyncHandler(async (req, res) => {
  const [stats, recentApplications, recentUsers, statusBuckets] = await Promise.all([
    Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "partner" }),
      User.countDocuments({ isActive: false }),
      University.countDocuments(),
      Program.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: "submitted" }),
      Application.countDocuments({ status: "under-review" }),
    ]),
    Application.find()
      .populate("student", "-password")
      .populate({
        path: "program",
        populate: { path: "university", populate: { path: "country" } },
      })
      .populate("documents")
      .sort({ createdAt: -1 })
      .limit(6),
    User.find().select("-password").sort({ createdAt: -1 }).limit(6),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const [
    users,
    students,
    admins,
    partners,
    inactiveUsers,
    universities,
    programs,
    applications,
    submittedApplications,
    underReviewApplications,
  ] = stats;

  res.json({
    stats: {
      users,
      students,
      admins,
      partners,
      inactiveUsers,
      universities,
      programs,
      applications,
      submittedApplications,
      underReviewApplications,
    },
    recentApplications: await hydrateApplicationsWithStudentProfiles(
      recentApplications
    ),
    recentUsers,
    applicationsByStatus: statusBuckets.reduce((accumulator, item) => {
      accumulator[item._id] = item.count;
      return accumulator;
    }, {}),
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, role, isActive } = req.body;

  if (typeof name === "string") {
    user.name = name;
  }

  if (typeof email === "string") {
    user.email = email.toLowerCase().trim();
  }

  if (typeof role === "string") {
    user.role = role;
  }

  if (typeof isActive === "boolean") {
    user.isActive = isActive;
  }

  await user.save();

  res.json(await User.findById(user._id).select("-password"));
});

const getCountriesAdmin = asyncHandler(async (req, res) => {
  const countries = await Country.find().sort({ featured: -1, name: 1 });
  res.json(countries);
});

const createCountry = asyncHandler(async (req, res) => {
  const country = await Country.create(req.body);
  res.status(201).json(country);
});

const uploadCountryHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Country cover image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/countries");
  res.status(201).json({ url: uploadResult.url });
});

const updateCountry = asyncHandler(async (req, res) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!country) {
    res.status(404);
    throw new Error("Country not found");
  }

  res.json(country);
});

const deleteCountry = asyncHandler(async (req, res) => {
  const country = await Country.findByIdAndDelete(req.params.id);

  if (!country) {
    res.status(404);
    throw new Error("Country not found");
  }

  res.json({ message: "Country deleted" });
});

const getSiteSettingsAdmin = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOne().sort({ createdAt: -1 });
  res.json(
    settings || {
      contactEmail: "",
      whatsappUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      supportHours: "",
      officeLocations: "",
    }
  );
});

const updateSiteSettings = asyncHandler(async (req, res) => {
  const payload = {
    contactEmail: req.body.contactEmail || "",
    whatsappUrl: req.body.whatsappUrl || "",
    facebookUrl: req.body.facebookUrl || "",
    instagramUrl: req.body.instagramUrl || "",
    tiktokUrl: req.body.tiktokUrl || "",
    supportHours: req.body.supportHours || "",
    officeLocations: req.body.officeLocations || "",
  };

  const existingSettings = await SiteSettings.findOne().sort({ createdAt: -1 });
  const settings = existingSettings
    ? await SiteSettings.findByIdAndUpdate(existingSettings._id, payload, {
        new: true,
        runValidators: true,
      })
    : await SiteSettings.create(payload);

  res.json(settings);
});

const getTestimonialsAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ featured: -1, createdAt: -1 });
  res.json(testimonials);
});

const getExhibitionArticlesAdmin = asyncHandler(async (req, res) => {
  const articles = await ExhibitionArticle.find().sort({ featured: -1, createdAt: -1 });
  res.json(articles);
});

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json(testimonial);
});

const createExhibitionArticle = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.create(req.body);
  res.status(201).json(article);
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }

  res.json(testimonial);
});

const updateExhibitionArticle = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!article) {
    res.status(404);
    throw new Error("Exhibition article not found");
  }

  res.json(article);
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }

  res.json({ message: "Testimonial deleted" });
});

const deleteExhibitionArticle = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.findByIdAndDelete(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error("Exhibition article not found");
  }

  res.json({ message: "Exhibition article deleted" });
});

module.exports = {
  getOverview,
  getStats,
  getStudents,
  getAdminApplications,
  getUsers,
  updateUser,
  getCountriesAdmin,
  createCountry,
  uploadCountryHeroImage,
  updateCountry,
  deleteCountry,
  getSiteSettingsAdmin,
  updateSiteSettings,
  getTestimonialsAdmin,
  getExhibitionArticlesAdmin,
  createTestimonial,
  createExhibitionArticle,
  updateTestimonial,
  updateExhibitionArticle,
  deleteTestimonial,
  deleteExhibitionArticle,
};
