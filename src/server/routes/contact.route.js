const router = require("express").Router();
const { contactDetails  } = require("../controllers");
router.post("/contact_us", contactDetails);



module.exports = router;