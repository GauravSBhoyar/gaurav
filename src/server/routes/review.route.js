const router = require("express").Router();

const { propertyReviewController } = require("../controllers");

router.route("/").get(propertyReviewController).post(propertyReviewController);
router.route("/:_id").put(propertyReviewController).delete(propertyReviewController);
router.route("/reply/:_id").put(propertyReviewController);

module.exports = router;
