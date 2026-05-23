const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const Testimonial = require("../models/Testimonial");
const Notification = require("../models/Notification");
const SiteSettings = require("../models/SiteSettings");
const StudyField = require("../models/StudyField");
const Recognition = require("../models/Recognition");
const OurService = require("../models/OurService");
const Faq = require("../models/Faq");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const getCountries = asyncHandler(async (req, res) => {
  const countries = await Country.find().sort({ featured: -1, name: 1 }).lean();
  res.json(countries);
});

const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ featured: -1, createdAt: -1 }).lean();
  res.json(testimonials);
});

const getRecognitions = asyncHandler(async (req, res) => {
  const recognitions = await Recognition.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 }).lean();
  res.json(recognitions);
});

const getRecognitionBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const recognition = await Recognition.findOne({
    $or: [
      { slug },
      ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : []),
    ],
  }).lean();

  if (!recognition) {
    res.status(404);
    throw new Error("Recognition not found");
  }

  res.json(recognition);
});

const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 }).lean();
  res.json(faqs);
});

const getOurServices = asyncHandler(async (req, res) => {
  const services = await OurService.find().sort({ featured: -1, sortOrder: 1, createdAt: -1 }).lean();
  res.json(services);
});

const getExhibitionArticles = asyncHandler(async (req, res) => {
  const articles = await ExhibitionArticle.find({ published: true }).sort({ featured: -1, createdAt: -1 }).lean();
  res.json(articles);
});

const getExhibitionArticleBySlug = asyncHandler(async (req, res) => {
  const article = await ExhibitionArticle.findOne({
    slug: req.params.slug,
    published: true,
  }).lean();

  if (!article) {
    res.status(404);
    throw new Error("Exhibition article not found");
  }

  res.json(article);
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(notifications);
});

const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOne().sort({ createdAt: -1 }).lean();
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

const getStudyFields = asyncHandler(async (req, res) => {
  const studyFields = await StudyField.find().sort({
    featured: -1,
    sortOrder: 1,
    createdAt: -1,
    name: 1,
  }).lean();
  res.json(studyFields);
});

module.exports = {
  getCountries,
  getTestimonials,
  getRecognitions,
  getRecognitionBySlug,
  getOurServices,
  getFaqs,
  getExhibitionArticles,
  getExhibitionArticleBySlug,
  getNotifications,
  getSiteSettings,
  getStudyFields,
};
