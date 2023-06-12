const router = require("express").Router();
const { registerCustomer,verifyOtp, updateCustumer, getcustomers } = require("../controllers");
router.post("/register_customer", registerCustomer);
router.post("/verify_customer", verifyOtp);
router.post("/register_booking_customer", updateCustumer);
router.get("/getcustomer", getcustomers);
module.exports = router;
