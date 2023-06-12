const router = require("express").Router();

const { userPropertyController, uploadProfilePic, getProfilePic,getRoomDetails,getPropertyDetails, getRoomCategories, userCategoryController, getRoomcategoriesByLocation, getUserCoupon, getSimilarroom, Join_Our_Community, uploadThoughtImage, getThought, getRoomGroupCard, getBloger } = require("../controllers");
const { faqQuestions,createFaq, getBlogLimit, blogCommentForm, createAboutus, getAboutus, UserReview, getUserReview, getTouchWithUs, getTouchWith, getBlogComment, updateTouchWithUs, updateAboutUs, getBlogerdetails, updatefaq, deleteFaq, deleteBlogComment, deleteReview, uploadUserImage, getAmenitiesWithTravelMood } = require("../controllers/user.controller");

router.get("/location", userPropertyController);
router.get("/property", userPropertyController);
router.get("/mostPopularProperty", userPropertyController);
router.get("/property_detail", getPropertyDetails);
router.get("/rooms", getRoomDetails);
router.get("/room_cat", getRoomCategories);
router.get("/roomcategory", userCategoryController);
// router.get("/bookRoom", userPropertyController);

router.get("/profilepic", getProfilePic)
router.post("/profilepic", uploadProfilePic);

//To Register Users
router.get("/user", getProfilePic)
router.get("/coupon", getUserCoupon);
router.get("/similar_room", getSimilarroom);

router.get("/roomgroupcategory", getRoomGroupCard);

router.get("/blog", getBloger);
router.get("/bloglimit", getBlogLimit);
router.post("/blogcomment",blogCommentForm);
router.get("/getblog",getBlogComment);
router.get("/blogdetails", getBlogerdetails);
router.delete("/deletecomment", deleteBlogComment);


router.get("/profile_thought", getThought)
router.post("/profile_thought", uploadThoughtImage);
router.post("/subscribe", Join_Our_Community);
router.post("/postfaqs", createFaq);
router.get("/faqs", faqQuestions);
router.put("/updatefaqs",updatefaq);
router.delete("/deletefaqs", deleteFaq);

router.post("/postabout",createAboutus);
router.get("/aboutus", getAboutus);
router.put("/updateabout", updateAboutUs);

router.post("/postreview",UserReview);
router.get("/getreview",getUserReview);
router.delete("/reviewdelete", deleteReview);

router.post("/contacts",getTouchWithUs);
router.get("/getcontact",getTouchWith);
router.put("/updatecontact",updateTouchWithUs)

router.post("/user_img", uploadUserImage);

router.get("/travel_mood", getAmenitiesWithTravelMood);

module.exports = router;