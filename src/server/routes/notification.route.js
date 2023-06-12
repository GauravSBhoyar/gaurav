const router = require("express").Router();

const { getNotifications, updateNotifications } = require('../controllers');

router.get("/", getNotifications);
router.post("/", updateNotifications);

module.exports = router;

