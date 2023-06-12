const router = require("express").Router();

const authRoute = require("./auth.route");
const vendorRoute = require("./vendor.route");
const adminRoute = require("./admin.route");
const userRoute = require("./user.route");
const reviewRoute = require("./review.route");
const { verifyUserMail } = require("../controllers");
const notificationRoute = require("./notification.route");
const customerRoute = require("./customer.route");
const bookingRoute = require("./booking.route");
const contactRoute = require("./contact.route");

router.use("/auth", authRoute);
router.get("/verify", verifyUserMail);
router.use("/vendor", vendorRoute);
router.use("/admin", adminRoute);
router.use("/reviews", reviewRoute);
router.use("/user", userRoute);
router.use("/book", bookingRoute);
router.use("/customer", customerRoute);
router.use("/contact", contactRoute);
router.get("/def", (req, res) => {
    res.send("done");
});
router.use("/notifications",notificationRoute);

module.exports = router;
