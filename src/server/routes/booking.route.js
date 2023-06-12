const router = require("express").Router();
const { createbooking, getbooking, updatebooking, getBookingByUserId, getbookbycat } = require("../controllers");
const { cancelbooking, createSessionId, getPaymentStatus } = require("../controllers/booking.controller");

router.get("/book_resort", getbooking);
router.get("/user_booking", getBookingByUserId);
router.get("/booking_by_cat", getbookbycat);
router.post("/create_booking", createbooking);
router.post("/create_session_id", createSessionId);
router.get("/get_payment_status", getPaymentStatus);
router.post("/update_booking", updatebooking);
router.post("/cancel_booking", cancelbooking);


module.exports = router;