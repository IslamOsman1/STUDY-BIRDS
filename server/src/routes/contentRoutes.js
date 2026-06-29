const express = require("express");
const {
  getCountries,
  getHomePageContent,
  getExhibitionArticles,
  getExhibitionArticleBySlug,
  getBlogCategories,
  getFaqs,
  getRecognitions,
  getRecognitionBySlug,
  getOurServices,
  getOurServiceBySlug,
  getOurStory,
  getUpcomingEvent,
  getPastEvents,
  createEventRegistration,
  createContactMessage,
  getSiteSettings,
  getStudyFields,
  getTestimonials,
  getNotifications,
  openCloudinaryDocument,
  getRobotsTxt,
  getSitemapXml,
} = require("../controllers/contentController");
const { protect } = require("../middleware/authMiddleware");
const { cacheRoute } = require("../utils/responseCache");

const router = express.Router();

router.get("/home", cacheRoute(60_000), getHomePageContent);
router.get("/countries", cacheRoute(60_000), getCountries);
router.get("/testimonials", cacheRoute(60_000), getTestimonials);
router.get("/recognitions", cacheRoute(60_000), getRecognitions);
router.get("/recognitions/:slug", getRecognitionBySlug);
router.get("/our-services", cacheRoute(60_000), getOurServices);
router.get("/our-services/:slug", getOurServiceBySlug);
router.get("/our-story", cacheRoute(120_000), getOurStory);
router.get("/upcoming-event", cacheRoute(60_000), getUpcomingEvent);
router.get("/past-events", cacheRoute(60_000), getPastEvents);
router.post("/event-registrations", createEventRegistration);
router.post("/contact-messages", createContactMessage);
router.get("/faqs", cacheRoute(60_000), getFaqs);
router.get("/blog/categories", cacheRoute(60_000), getBlogCategories);
router.get("/blog", cacheRoute(60_000), getExhibitionArticles);
router.get("/blog/:slug", getExhibitionArticleBySlug);
router.get("/exhibitions", cacheRoute(60_000), getExhibitionArticles);
router.get("/exhibitions/:slug", getExhibitionArticleBySlug);
router.get("/site-settings", cacheRoute(300_000), getSiteSettings);
router.get("/study-fields", cacheRoute(120_000), getStudyFields);
router.get("/notifications", protect, getNotifications);
router.get("/file-open", openCloudinaryDocument);
router.get("/seo/sitemap.xml", cacheRoute(120_000), getSitemapXml);
router.get("/seo/robots.txt", cacheRoute(300_000), getRobotsTxt);

module.exports = router;
