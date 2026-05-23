const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const Testimonial = require("../models/Testimonial");
const Notification = require("../models/Notification");
const SiteSettings = require("../models/SiteSettings");
const StudyField = require("../models/StudyField");
const Recognition = require("../models/Recognition");
const OurService = require("../models/OurService");
const OurStory = require("../models/OurStory");
const Faq = require("../models/Faq");
const UpcomingEvent = require("../models/UpcomingEvent");
const PastEvent = require("../models/PastEvent");
const EventRegistration = require("../models/EventRegistration");
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

const getOurServiceBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const service = await OurService.findOne({
    $or: [
      { slug },
      ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : []),
    ],
  }).lean();

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json(service);
});

const getOurStory = asyncHandler(async (req, res) => {
  const story = await OurStory.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();

  res.json(
    story || {
      heroEyebrow: "",
      heroTitle: "",
      heroBody: "",
      heroImage: "",
      heroCtaText: "",
      heroCtaLink: "",
      storyEyebrow: "",
      storyTitle: "",
      storyBody: "",
      storyImage: "",
      missionTitle: "",
      missionBody: "",
      visionTitle: "",
      visionBody: "",
      foundersTitle: "",
      foundersBody: "",
      founders: [],
      timelineTitle: "",
      timelineBody: "",
      timelineItems: [],
      impactTitle: "",
      impactBody: "",
      impactStats: [],
      isPublished: false,
    }
  );
});

const getUpcomingEvent = asyncHandler(async (req, res) => {
  const upcomingEvent = await UpcomingEvent.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();
  res.json(
    upcomingEvent || {
      title: "",
      subtitle: "",
      eventType: "",
      eventDate: null,
      ctaText: "",
      backgroundImage: "",
      isPublished: false,
    }
  );
});

const getPastEvents = asyncHandler(async (req, res) => {
  const events = await PastEvent.find()
    .sort({ sortOrder: 1, eventDate: -1, createdAt: -1 })
    .lean();
  res.json(events);
});

const createEventRegistration = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const fieldOfInterest = String(req.body.fieldOfInterest || "").trim();
  const currentCountry = String(req.body.currentCountry || "").trim();

  if (!name || !phone || !fieldOfInterest || !currentCountry) {
    res.status(400);
    throw new Error("All registration fields are required");
  }

  const upcomingEvent = await UpcomingEvent.findOne().sort({ updatedAt: -1, createdAt: -1 }).select("_id").lean();
  const registration = await EventRegistration.create({
    name,
    phone,
    fieldOfInterest,
    currentCountry,
    upcomingEvent: upcomingEvent?._id || null,
  });

  res.status(201).json({
    message: "Registration submitted successfully",
    registration,
  });
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
  getOurServiceBySlug,
  getOurStory,
  getUpcomingEvent,
  getPastEvents,
  createEventRegistration,
  getFaqs,
  getExhibitionArticles,
  getExhibitionArticleBySlug,
  getNotifications,
  getSiteSettings,
  getStudyFields,
};
