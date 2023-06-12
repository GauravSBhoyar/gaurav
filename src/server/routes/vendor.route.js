const router = require("express").Router();

const { uploadCatImage, vendorProfile, createUpdateVendor, propertyRooms, deleteRoom, updateSingleRoom, switchRoomState, bookRoom, bookingHistory, vendorDashboard, pricingList, activityList, uploadActivityImage, uploadPropertyImage, propertyImagesList, deletePropertyImage, uploadPropertyDoc, propertyDocsList, deletePropertyDoc, uploadAmenityImage, getAmenities, getAmenitiesWholeData } = require("../controllers");
const { financeImage, bookingHistoryUp, bookingHistoryUpcoming, bookingHistoryCompleted, bookingHistoryCancelled } = require("../controllers/vendor.controller");

// Vendor profile operations
router.post("/onboarding", createUpdateVendor);
router.post("/images", uploadPropertyImage);
router.get("/images", propertyImagesList);
router.post("/images/delete", deletePropertyImage);
router.get("/profile", vendorProfile);
router.post("/profile", createUpdateVendor);
router.post("/documents", uploadPropertyDoc);
router.get("/documents", propertyDocsList);
router.post("/documents/delete",  deletePropertyDoc)
router.post("/amenities", uploadAmenityImage)
router.get("/amenities", getAmenities)
router.get("/amenity_data", getAmenitiesWholeData)
router.post("/cate_img", uploadCatImage);
router.post("/financeimg", financeImage);


// Room operations
router.get("/rooms", propertyRooms);
router.post("/rooms", switchRoomState);
router.delete("/rooms/:room_id", deleteRoom);
router.put("/rooms/:room_id", updateSingleRoom);

// Booking operations
router.post("/booking", bookRoom);
router.get("/booking", bookingHistory);
router.get("/bookingupcoming", bookingHistoryUpcoming);
router.get("/bookingcompleted", bookingHistoryCompleted);
router.get("/bookingcancelled", bookingHistoryCancelled);
// router.get("/orders", orderHistory);

// Dashboard operations
router.get("/dashboard", vendorDashboard);
router.get("/pricing", pricingList);
router.post("/pricing", pricingList);
router.get("/activity", activityList);
router.post("/activity", uploadActivityImage, activityList);

module.exports = router;
