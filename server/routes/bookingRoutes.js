const express = require("express");
const router = express.Router();
const Booking = require("../controllers/bookingController");

router.post("/", Booking.createBooking);
router.get("/", Booking.getAllBookings);
router.get("/:id", Booking.getBookingById);
router.put("/:id", Booking.updateBooking);
router.delete("/:id", Booking.deleteBooking);

module.exports = router;
