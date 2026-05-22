const User = require("../models/User");
const Application = require("../models/Application");
const University = require("../models/University");
const Program = require("../models/Program");
const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const SiteSettings = require("../models/SiteSettings");
const Testimonial = require("../models/Testimonial");
const Recognition = require("../models/Recognition");
const OurService = require("../models/OurService");
const Faq = require("../models/Faq");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");
const {
  hydrateApplicationsWithStudentProfiles,
} = require("../utils/hydrateApplications");

const normalizeArticlePairs = (headings = [], bodies = []) => {
  const maxLength = Math.max(headings.length, bodies.length);

  return Array.from({ length: maxLength }, (_, index) => ({
    heading: String(headings[index] || "").trim(),
    body: String(bodies[index] || "").trim(),
  })).filter((item) => item.heading || item.body);
};

const buildExhibitionSections = (body) => {
  const articleItems = normalizeArticlePairs(body.articleHeadings, body.articleBodies);

  if (articleItems.length) {
    return articleItems.map((item) => ({
      title: item.heading,
      summary: "",
      body: item.body,
      titleColor: body.articleHeadingColor || "#0f172a",
      youtubeUrl: "",
    }));
  }

  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    return [
      {
        title: body.title,
        summary: body.summary || "",
        body: body.body,
        titleColor: body.titleColor || "#0f172a",
        youtubeUrl: body.youtubeUrl,
      },
    ];
  }

  return body.sections
    .map((section) => ({
      title: section.title,
      summary: section.summary || "",
      body: section.body,
      titleColor: section.titleColor || "#0f172a",
      youtubeUrl: section.youtubeUrl || "",
    }))
    .filter((section) => section.title && section.body);
};

const buildExhibitionPayload = (body) => {
  const sections = buildExhibitionSections(body);
  const firstSection = sections[0] || {};
  const normalizedArticleItems = normalizeArticlePairs(body.articleHeadings, body.articleBodies);
  const fallbackArticleItems = sections
    .map((section) => ({
      heading: String(section.title || "").trim(),
      body: String(section.body || "").trim(),
    }))
    .filter((item) => item.heading || item.body);
  const articleItems = normalizedArticleItems.length ? normalizedArticleItems : fallbackArticleItems;

  return {
    title: body.title || firstSection.title,
    summary: body.summary || firstSection.summary || "",
    image: body.image || "",
    body: body.body || firstSection.body,
    articleTitle: body.articleTitle || body.title || firstSection.title || "",
    articleTitleColor: body.articleTitleColor || body.titleColor || "#0f172a",
    articleHeadingColor: body.articleHeadingColor || "#0f172a",
    articleBodyColor: body.articleBodyColor || "#475569",
    articleHeadings: articleItems.map((item) => item.heading),
    articleBodies: articleItems.map((item) => item.body),
    titleColor: body.titleColor || firstSection.titleColor || "#0f172a",
    ctaText: body.ctaText || "",
    ctaUrl: body.ctaUrl || "",
    youtubeUrl: body.youtubeUrl || firstSection.youtubeUrl,
    sections,
    featured: typeof body.featured === "boolean" ? body.featured : true,
    published: typeof body.published === "boolean" ? body.published : true,
  };
};

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

const buildCountryPayload = (body) => ({
  name: body.name,
  code: body.code,
  description: body.description || "",
  visaNotes: body.visaNotes || "",
  heroImage: body.heroImage || "",
  universityCount: Number.isFinite(Number(body.universityCount)) ? Number(body.universityCount) : 0,
  specialtyCount: Number.isFinite(Number(body.specialtyCount)) ? Number(body.specialtyCount) : 0,
  averageTuition: Number.isFinite(Number(body.averageTuition)) ? Number(body.averageTuition) : 0,
  articleTitle: body.articleTitle || "",
  articleTitleColor: body.articleTitleColor || "#0f172a",
  articleHeadingColor: body.articleHeadingColor || "#0f172a",
  articleBodyColor: body.articleBodyColor || "#475569",
  articleHeadings: Array.isArray(body.articleHeadings) ? body.articleHeadings : [],
  articleBodies: Array.isArray(body.articleBodies) ? body.articleBodies : [],
  featured: Boolean(body.featured),
});

const createCountry = asyncHandler(async (req, res) => {
  const country = await Country.create(buildCountryPayload(req.body));
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
  const country = await Country.findByIdAndUpdate(req.params.id, buildCountryPayload(req.body), { new: true, runValidators: true });

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

const getRecognitionsAdmin = asyncHandler(async (req, res) => {
  const recognitions = await Recognition.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 });
  res.json(recognitions);
});

const getFaqsAdmin = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 });
  res.json(faqs);
});

const getOurServicesAdmin = asyncHandler(async (req, res) => {
  const services = await OurService.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 });
  res.json(services);
});

const getExhibitionArticlesAdmin = asyncHandler(async (req, res) => {
  const articles = await ExhibitionArticle.find().sort({ featured: -1, createdAt: -1 });
  res.json(articles);
});

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json(testimonial);
});

const createRecognition = asyncHandler(async (req, res) => {
  const recognition = await Recognition.create({
    title: req.body.title,
    image: req.body.image || "",
    link: req.body.link || "",
    featured: typeof req.body.featured === "boolean" ? req.body.featured : true,
    sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
  });

  res.status(201).json(recognition);
});

const createFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.create({
    question: req.body.question,
    answer: req.body.answer,
    featured: typeof req.body.featured === "boolean" ? req.body.featured : true,
    sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
  });

  res.status(201).json(faq);
});

const createOurService = asyncHandler(async (req, res) => {
  const service = await OurService.create({
    title: req.body.title,
    image: req.body.image || "",
    featured: typeof req.body.featured === "boolean" ? req.body.featured : true,
    sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
  });

  res.status(201).json(service);
});

const createExhibitionArticle = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.create(buildExhibitionPayload(req.body));
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

const updateRecognition = asyncHandler(async (req, res) => {
  const recognition = await Recognition.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      image: req.body.image || "",
      link: req.body.link || "",
      featured: Boolean(req.body.featured),
      sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
    },
    { new: true, runValidators: true }
  );

  if (!recognition) {
    res.status(404);
    throw new Error("Recognition not found");
  }

  res.json(recognition);
});

const updateFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndUpdate(
    req.params.id,
    {
      question: req.body.question,
      answer: req.body.answer,
      featured: Boolean(req.body.featured),
      sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
    },
    { new: true, runValidators: true }
  );

  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  res.json(faq);
});

const updateOurService = asyncHandler(async (req, res) => {
  const service = await OurService.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      image: req.body.image || "",
      featured: Boolean(req.body.featured),
      sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
    },
    { new: true, runValidators: true }
  );

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json(service);
});

const updateExhibitionArticle = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.findByIdAndUpdate(req.params.id, buildExhibitionPayload(req.body), { new: true, runValidators: true });

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

const deleteRecognition = asyncHandler(async (req, res) => {
  const recognition = await Recognition.findByIdAndDelete(req.params.id);

  if (!recognition) {
    res.status(404);
    throw new Error("Recognition not found");
  }

  res.json({ message: "Recognition deleted" });
});

const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndDelete(req.params.id);

  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  res.json({ message: "FAQ deleted" });
});

const deleteOurService = asyncHandler(async (req, res) => {
  const service = await OurService.findByIdAndDelete(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json({ message: "Service deleted" });
});

const uploadRecognitionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Recognition image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/recognitions");
  res.status(201).json({ url: uploadResult.url });
});

const uploadOurServiceImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Service image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/services");
  res.status(201).json({ url: uploadResult.url });
});

const uploadExhibitionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Exhibition image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/exhibitions");
  res.status(201).json({ url: uploadResult.url });
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
  getRecognitionsAdmin,
  getOurServicesAdmin,
  getFaqsAdmin,
  getExhibitionArticlesAdmin,
  createTestimonial,
  createRecognition,
  createOurService,
  createFaq,
  createExhibitionArticle,
  updateTestimonial,
  updateRecognition,
  updateOurService,
  updateFaq,
  updateExhibitionArticle,
  deleteTestimonial,
  deleteRecognition,
  deleteOurService,
  deleteFaq,
  deleteExhibitionArticle,
  uploadRecognitionImage,
  uploadOurServiceImage,
  uploadExhibitionImage,
};
