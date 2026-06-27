const express = require("express");
const {
  getPartnerProfile,
  updatePartnerProfile,
  getPartnerOverview,
  getAgentStudents,
  createAgentStudent,
  uploadAgentStudentDocument,
  getPartnerWallet,
  requestPayout,
  getReferralSummary,
  getMarketingAssets,
  getVerificationDocuments,
  uploadVerificationDocument,
  getSupportTickets,
  createSupportTicket,
  getPartnerNotifications,
  markNotificationAsRead,
  getPartnerActivityLog,
  getKnowledgeBase,
} = require("../controllers/partnerController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, authorize("partner"));
router.get("/overview", getPartnerOverview);
router.get("/profile", getPartnerProfile);
router.put("/profile", updatePartnerProfile);
router.get("/students", getAgentStudents);
router.post("/students", createAgentStudent);
router.post("/students/:id/documents", upload.single("file"), uploadAgentStudentDocument);
router.get("/wallet", getPartnerWallet);
router.post("/wallet/payout-requests", requestPayout);
router.get("/referral", getReferralSummary);
router.get("/marketing-assets", getMarketingAssets);
router.get("/verification", getVerificationDocuments);
router.post("/verification/documents", upload.single("file"), uploadVerificationDocument);
router.get("/tickets", getSupportTickets);
router.post("/tickets", upload.single("file"), createSupportTicket);
router.get("/notifications", getPartnerNotifications);
router.patch("/notifications/:id/read", markNotificationAsRead);
router.get("/activity-log", getPartnerActivityLog);
router.get("/knowledge-base", getKnowledgeBase);

module.exports = router;
