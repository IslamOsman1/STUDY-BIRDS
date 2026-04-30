const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const Testimonial = require("../models/Testimonial");
const Notification = require("../models/Notification");
const SiteSettings = require("../models/SiteSettings");
const StudyField = require("../models/StudyField");
const asyncHandler = require("../utils/asyncHandler");

const getCountries = asyncHandler(async (req, res) => {
  const countries = await Country.find().sort({ featured: -1, name: 1 });
  res.json(countries);
});

const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ featured: -1, createdAt: -1 });
  res.json(testimonials);
});

const getExhibitionArticles = asyncHandler(async (req, res) => {
  const articles = await ExhibitionArticle.find({ published: true }).sort({ featured: -1, createdAt: -1 });
  res.json(articles);
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

const getSiteSettings = asyncHandler(async (req, res) => {
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

const getStudyFields = asyncHandler(async (req, res) => {
  const studyFields = await StudyField.find().sort({
    featured: -1,
    sortOrder: 1,
    createdAt: -1,
    name: 1,
  });
  res.json(studyFields);
});

module.exports = {
  getCountries,
  getTestimonials,
  getExhibitionArticles,
  getNotifications,
  getSiteSettings,
  getStudyFields,
};
