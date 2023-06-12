const router = require("express").Router();

const { featureController, adminDashboard, adminTodoList, propertyList, propertyFinanceLegal, vendorList, commissionList, blogController, uploadBlogImage, bookingList, couponController, getcustomers } = require("../controllers");
const { bookingListFilter, vendorSettlement } = require("../controllers/admin.controller");

router.get("/dashboard", adminDashboard);
router.route("/todo").get(adminTodoList).post(adminTodoList).put(adminTodoList);
router.delete("/todo/:id", adminTodoList);
router.get("/property", propertyList);
router.get("/finance", propertyFinanceLegal);
router.get("/vendor", vendorList);
router.put("/property/:id/:status", vendorList);
router.route("/commission").get(commissionList).put(commissionList).post(commissionList);
router.delete("/commission/:id", commissionList);
router.route("/blog").get(blogController).post(uploadBlogImage, blogController).put(uploadBlogImage, blogController);
router.delete("/blog/:id", blogController);
router.route("/booking").get(bookingList).post(bookingList);
router.route("/bookingfilters").get(bookingListFilter);
router.get("/settlement", vendorSettlement); 
router.route("/featured").get(featureController);
router.route("/featured/:id").post(featureController).put(featureController).delete(featureController);
router.route("/coupon").get(couponController).post(couponController);
router.route("/coupon/:id").put(couponController).delete(couponController);
router.get("/getcustomer", getcustomers);

module.exports = router;
