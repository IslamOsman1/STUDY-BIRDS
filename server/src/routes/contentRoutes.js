const express = require("express");
const {
  getCountries,
  getExhibitionArticles,
  getSiteSettings,
  getTestimonials,
  getNotifications,
} = require("../controllers/contentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/countries", getCountries);
router.get("/testimonials", getTestimonials);
router.get("/exhibitions", getExhibitionArticles);
router.get("/site-settings", getSiteSettings);
router.get("/notifications", protect, getNotifications);

module.exports = router;
