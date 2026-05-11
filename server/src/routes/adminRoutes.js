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
} = require("../controllers/adminController");
const {
  getStudyFields,
  createStudyField,
  updateStudyField,
  deleteStudyField,
  uploadStudyFieldImage,
} = require("../controllers/studyFieldController");
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
router.get("/study-fields", getStudyFields);
router.post("/study-fields/upload-image", upload.single("file"), uploadStudyFieldImage);
router.post("/study-fields", createStudyField);
router.put("/study-fields/:id", updateStudyField);
router.delete("/study-fields/:id", deleteStudyField);
router.get("/testimonials", getTestimonialsAdmin);
router.post("/testimonials", createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);
router.get("/recognitions", getRecognitionsAdmin);
router.post("/recognitions/upload-image", upload.single("file"), uploadRecognitionImage);
router.post("/recognitions", createRecognition);
router.put("/recognitions/:id", updateRecognition);
router.delete("/recognitions/:id", deleteRecognition);
router.get("/our-services", getOurServicesAdmin);
router.post("/our-services/upload-image", upload.single("file"), uploadOurServiceImage);
router.post("/our-services", createOurService);
router.put("/our-services/:id", updateOurService);
router.delete("/our-services/:id", deleteOurService);
router.get("/faqs", getFaqsAdmin);
router.post("/faqs", createFaq);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);
router.get("/exhibitions", getExhibitionArticlesAdmin);
router.post("/exhibitions", createExhibitionArticle);
router.put("/exhibitions/:id", updateExhibitionArticle);
router.delete("/exhibitions/:id", deleteExhibitionArticle);

module.exports = router;
