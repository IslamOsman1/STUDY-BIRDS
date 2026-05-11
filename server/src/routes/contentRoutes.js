const express = require("express");
const {
  getCountries,
  getExhibitionArticles,
  getFaqs,
  getRecognitions,
  getOurServices,
  getSiteSettings,
  getStudyFields,
  getTestimonials,
  getNotifications,
} = require("../controllers/contentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/countries", getCountries);
router.get("/testimonials", getTestimonials);
router.get("/recognitions", getRecognitions);
router.get("/our-services", getOurServices);
router.get("/faqs", getFaqs);
router.get("/exhibitions", getExhibitionArticles);
router.get("/site-settings", getSiteSettings);
router.get("/study-fields", getStudyFields);
router.get("/notifications", protect, getNotifications);

module.exports = router;
