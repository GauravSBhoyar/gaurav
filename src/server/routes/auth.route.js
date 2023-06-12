const router = require("express").Router();
const passport = require("passport");

const { logIn } = require("../middlewares");
const { registerRole, userProfile, userInfo, sendPasswdResetLink, resetPassword } = require("../controllers");

router.post("/register", registerRole);
router.post("/login", logIn);
router.post("/update", userProfile);
router.get("/get-user", userProfile);
router.post("/forgot-password", sendPasswdResetLink);
router.post("/reset-password", resetPassword);
router.get("/google", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));
router.get("/google/callback", passport.authenticate("google"), logIn);
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook"), logIn);

module.exports = router;
