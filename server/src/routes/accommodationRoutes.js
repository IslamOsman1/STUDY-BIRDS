const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAccommodationListingsPublic, createAccommodationBooking, getMyAccommodationBookings, cancelAccommodationBooking,
} = require("../controllers/accommodationController");

const router = express.Router();
router.use(protect);
router.get("/listings", getAccommodationListingsPublic);
router.post("/bookings", authorize("student"), createAccommodationBooking);
router.get("/bookings/mine", authorize("student"), getMyAccommodationBookings);
router.post("/bookings/:id/cancel", authorize("student"), cancelAccommodationBooking);

module.exports = router;
