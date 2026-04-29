const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const Testimonial = require("../models/Testimonial");
const Notification = require("../models/Notification");
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

module.exports = {
  getCountries,
  getTestimonials,
  getExhibitionArticles,
  getNotifications,
};
