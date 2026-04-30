const express = require("express");
const {
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
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/overview", getOverview);
router.get("/stats", getStats);
router.get("/students", getStudents);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.get("/applications", getAdminApplications);
router.get("/countries", getCountriesAdmin);
router.post("/countries/upload-image", upload.single("file"), uploadCountryHeroImage);
router.post("/countries", createCountry);
router.put("/countries/:id", updateCountry);
router.delete("/countries/:id", deleteCountry);
router.get("/site-settings", getSiteSettingsAdmin);
router.put("/site-settings", updateSiteSettings);
router.get("/testimonials", getTestimonialsAdmin);
router.post("/testimonials", createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);
router.get("/exhibitions", getExhibitionArticlesAdmin);
router.post("/exhibitions", createExhibitionArticle);
router.put("/exhibitions/:id", updateExhibitionArticle);
router.delete("/exhibitions/:id", deleteExhibitionArticle);

module.exports = router;
