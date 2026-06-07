const Country = require("../models/Country");
const ExhibitionArticle = require("../models/ExhibitionArticle");
const University = require("../models/University");
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
const { buildPaginationMeta, parsePagination } = require("../utils/queryUtils");
const { timedOperation } = require("../utils/perf");
const {
  attachResolvedSeo,
  buildRobotsTxt,
  buildSitemapXml,
} = require("../utils/exhibitionSeo");

const defaultSiteSettingsPayload = {
  contactEmail: "",
  whatsappUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  supportHours: "",
  officeLocations: "",
};

const defaultStoryPayload = {
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
};

const defaultUpcomingEventPayload = {
  title: "",
  subtitle: "",
  eventType: "",
  eventDate: null,
  ctaText: "",
  backgroundImage: "",
  isPublished: false,
};

const paginateResponse = async ({ req, res, model, query, select, sort, transform, defaultLimit = 12 }) => {
  const { page, limit, skip } = parsePagination(req.query, defaultLimit);
  const shouldPaginate = "page" in req.query || "limit" in req.query || req.query.paginate === "true";

  const listQuery = model.find(query).select(select).sort(sort);

  if (shouldPaginate) {
    listQuery.skip(skip).limit(limit);
  }

  const [items, total] = await Promise.all([
    timedOperation(`${model.modelName}.list`, () => listQuery.lean()),
    shouldPaginate ? timedOperation(`${model.modelName}.count`, () => model.countDocuments(query)) : Promise.resolve(0),
  ]);

  const resolvedItems = transform ? items.map(transform) : items;

  if (shouldPaginate) {
    res.json({
      items: resolvedItems,
      pagination: buildPaginationMeta({ page, limit, total }),
    });
    return;
  }

  res.json(resolvedItems);
};

const getCountries = asyncHandler(async (req, res) => {
  await paginateResponse({
    req,
    res,
    model: Country,
    query: {},
    select: "name slug code description visaNotes heroImage universityCount specialtyCount averageTuition featured articleTitle articleTitleColor articleHeadingColor articleBodyColor articleHeadings articleBodies createdAt updatedAt",
    sort: { featured: -1, name: 1 },
  });
});

const getTestimonials = asyncHandler(async (req, res) => {
  await paginateResponse({
    req,
    res,
    model: Testimonial,
    query: {},
    select: "studentName destination quote rating featured createdAt",
    sort: { featured: -1, createdAt: -1 },
    defaultLimit: 6,
  });
});

const getRecognitions = asyncHandler(async (req, res) => {
  const query = req.query.featuredOnly === "true" ? { featured: true } : {};
  await paginateResponse({
    req,
    res,
    model: Recognition,
    query,
    select: "slug title image link detailTitle detailBody detailImage featured sortOrder createdAt updatedAt",
    sort: { featured: -1, sortOrder: 1, createdAt: -1 },
    defaultLimit: 12,
  });
});

const getRecognitionBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const recognition = await timedOperation("Recognition.bySlug", () =>
    Recognition.findOne({
      $or: [{ slug }, ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])],
    })
      .select("slug title image link detailTitle detailBody detailImage featured sortOrder createdAt updatedAt")
      .lean()
  );

  if (!recognition) {
    res.status(404);
    throw new Error("Recognition not found");
  }

  res.json(recognition);
});

const getFaqs = asyncHandler(async (req, res) => {
  await paginateResponse({
    req,
    res,
    model: Faq,
    query: {},
    select: "question answer featured sortOrder createdAt",
    sort: { featured: -1, sortOrder: 1, createdAt: -1 },
    defaultLimit: 12,
  });
});

const getOurServices = asyncHandler(async (req, res) => {
  const query = req.query.featuredOnly === "true" ? { featured: true } : {};
  await paginateResponse({
    req,
    res,
    model: OurService,
    query,
    select: "slug title image detailTitle detailBody detailImage featured sortOrder createdAt updatedAt",
    sort: { featured: -1, sortOrder: 1, createdAt: -1 },
    defaultLimit: 12,
  });
});

const getOurServiceBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const service = await timedOperation("OurService.bySlug", () =>
    OurService.findOne({
      $or: [{ slug }, ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])],
    })
      .select("slug title image detailTitle detailBody detailImage featured sortOrder createdAt updatedAt")
      .lean()
  );

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json(service);
});

const getOurStory = asyncHandler(async (req, res) => {
  const story = await timedOperation("OurStory.latest", () =>
    OurStory.findOne()
      .sort({ updatedAt: -1, createdAt: -1 })
      .select("heroEyebrow heroTitle heroBody heroImage heroCtaText heroCtaLink storyEyebrow storyTitle storyBody storyImage missionTitle missionBody visionTitle visionBody foundersTitle foundersBody founders timelineTitle timelineBody timelineItems impactTitle impactBody impactStats isPublished updatedAt")
      .lean()
  );

  res.json(story || defaultStoryPayload);
});

const getUpcomingEvent = asyncHandler(async (req, res) => {
  const upcomingEvent = await timedOperation("UpcomingEvent.latest", () =>
    UpcomingEvent.findOne()
      .sort({ updatedAt: -1, createdAt: -1 })
      .select("title subtitle eventType eventDate ctaText backgroundImage isPublished updatedAt")
      .lean()
  );

  res.json(upcomingEvent || defaultUpcomingEventPayload);
});

const getPastEvents = asyncHandler(async (req, res) => {
  const query = req.query.featuredOnly === "true" ? { featured: true } : {};
  await paginateResponse({
    req,
    res,
    model: PastEvent,
    query,
    select: "title slug category eventDate countryCode summary coverImage mediaItems featured sortOrder createdAt updatedAt",
    sort: { sortOrder: 1, eventDate: -1, createdAt: -1 },
    defaultLimit: 9,
  });
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

  const upcomingEvent = await timedOperation("EventRegistration.upcomingLookup", () =>
    UpcomingEvent.findOne().sort({ updatedAt: -1, createdAt: -1 }).select("_id").lean()
  );

  const registration = await timedOperation("EventRegistration.create", () =>
    EventRegistration.create({
      name,
      phone,
      fieldOfInterest,
      currentCountry,
      upcomingEvent: upcomingEvent?._id || null,
    })
  );

  res.status(201).json({
    message: "Registration submitted successfully",
    registration,
  });
});

const getExhibitionArticles = asyncHandler(async (req, res) => {
  await paginateResponse({
    req,
    res,
    model: ExhibitionArticle,
    query: { published: true },
    select: "title slug customSlug image summary body articleTitle articleTitleColor articleHeadingColor articleBodyColor articleHeadings articleBodies titleColor ctaText ctaUrl youtubeUrl featured published seoTitle metaDescription focusKeyword seoKeywords canonicalUrl ogTitle ogDescription ogImage twitterTitle twitterDescription twitterImage imageAltText robotsIndex robotsFollow category authorName publishedAt seoUpdatedAt sections createdAt updatedAt",
    sort: { featured: -1, createdAt: -1 },
    transform: attachResolvedSeo,
    defaultLimit: 12,
  });
});

const getExhibitionArticleBySlug = asyncHandler(async (req, res) => {
  const article = await timedOperation("ExhibitionArticle.bySlug", () =>
    ExhibitionArticle.findOne({
      slug: req.params.slug,
      published: true,
    })
      .select("title slug customSlug image summary body articleTitle articleTitleColor articleHeadingColor articleBodyColor articleHeadings articleBodies titleColor ctaText ctaUrl youtubeUrl featured published seoTitle metaDescription focusKeyword seoKeywords canonicalUrl ogTitle ogDescription ogImage twitterTitle twitterDescription twitterImage imageAltText robotsIndex robotsFollow category authorName publishedAt seoUpdatedAt sections createdAt updatedAt")
      .lean()
  );

  if (!article) {
    res.status(404);
    throw new Error("Exhibition article not found");
  }

  res.json(attachResolvedSeo(article));
});

const getBlogCategories = asyncHandler(async (req, res) => {
  const articles = await timedOperation("ExhibitionArticle.categories", () =>
    ExhibitionArticle.find({
      published: true,
      category: { $exists: true, $ne: "" },
    })
      .select("category")
      .lean()
  );

  const categories = [...new Set(articles.map((article) => String(article.category || "").trim()).filter(Boolean))];
  res.json(categories);
});

const getHomePageContent = asyncHandler(async (req, res) => {
  const [countries, studyFields, universities, testimonials, recognitions, services, faqs] = await Promise.all([
    timedOperation("home.countries", () =>
      Country.find()
        .select("name slug code description visaNotes heroImage universityCount specialtyCount averageTuition featured createdAt")
        .sort({ featured: -1, name: 1 })
        .limit(7)
        .lean()
    ),
    timedOperation("home.studyFields", () =>
      StudyField.find()
        .select("name slug description image featured sortOrder createdAt")
        .sort({ featured: -1, sortOrder: 1, createdAt: -1, name: 1 })
        .limit(6)
        .lean()
    ),
    timedOperation("home.universities", () =>
      University.find()
        .select("name slug city language studentCount specialtyCount overview ranking tuitionRange logo featured isPartnerInstitution country createdAt")
        .populate("country", "name slug code heroImage featured")
        .sort({ featured: -1, name: 1 })
        .limit(12)
        .lean()
    ),
    timedOperation("home.testimonials", () =>
      Testimonial.find().select("studentName destination quote rating featured createdAt").sort({ featured: -1, createdAt: -1 }).limit(3).lean()
    ),
    timedOperation("home.recognitions", () =>
      Recognition.find({ featured: true }).select("slug title image featured sortOrder createdAt").sort({ sortOrder: 1, createdAt: -1 }).limit(6).lean()
    ),
    timedOperation("home.services", () =>
      OurService.find({ featured: true }).select("slug title image featured sortOrder createdAt").sort({ sortOrder: 1, createdAt: -1 }).limit(6).lean()
    ),
    timedOperation("home.faqs", () =>
      Faq.find({ featured: true }).select("question answer featured sortOrder createdAt").sort({ sortOrder: 1, createdAt: -1 }).limit(8).lean()
    ),
  ]);

  res.json({
    countries,
    studyFields,
    universities,
    testimonials,
    recognitions,
    services,
    faqs,
  });
});

const getSitemapXml = asyncHandler(async (req, res) => {
  const articles = await timedOperation("sitemap.articles", () => ExhibitionArticle.find({ published: true }).lean());
  res.type("application/xml");
  res.send(buildSitemapXml(articles));
});

const getRobotsTxt = asyncHandler(async (req, res) => {
  res.type("text/plain");
  res.send(buildRobotsTxt());
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await timedOperation("Notification.userList", () =>
    Notification.find({ user: req.user._id })
      .select("title message type isRead createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()
  );
  res.json(notifications);
});

const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await timedOperation("SiteSettings.latest", () =>
    SiteSettings.findOne()
      .sort({ createdAt: -1 })
      .select("contactEmail whatsappUrl facebookUrl instagramUrl tiktokUrl supportHours officeLocations createdAt")
      .lean()
  );
  res.json(settings || defaultSiteSettingsPayload);
});

const getStudyFields = asyncHandler(async (req, res) => {
  await paginateResponse({
    req,
    res,
    model: StudyField,
    query: {},
    select: "name slug description image featured sortOrder createdAt updatedAt",
    sort: { featured: -1, sortOrder: 1, createdAt: -1, name: 1 },
    defaultLimit: 12,
  });
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
  getBlogCategories,
  getHomePageContent,
  getNotifications,
  getRobotsTxt,
  getSitemapXml,
  getSiteSettings,
  getStudyFields,
};
