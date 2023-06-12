const jwt = require("jsonwebtoken");
const { validatePassword } = require("../utilities/passwordUtilities");
const Logger = require("../utilities/logger");
const { User } = require("../models");

const logIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        let token = jwt.sign(
            { _id: req.user._id, role: req.user.user_role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.message = "Logged in successfully";
        res.data = {
            bearer_token: token,
        };
        return next(200);
    }
    User.findOne({
        user_email: req.body.email.toLowerCase(),
        user_status: "Verified",
    })
        .then((user) => {
            if (!user) {
                res.error = "Incorrect email/password.";
                return next(401);
            }
            const isValid = validatePassword(
                req.body.password,
                user.user_hash,
                user.user_salt
            );
            if (isValid) {
                let token = jwt.sign(
                    { _id: user._id, role: user.user_role },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );
                res.message = "Logged in successfully";
                res.data = {
                    bearer_token: token,
                };
                return next(200);
            } else {
                res.error = "Incorrect email/password.";
                return next(401);
            }
        })
        .catch((err) => {
            Logger.error(err);
            res.error = "Login failed. Please try again later";
            return next(500);
        });
};

module.exports = {
    logIn,
};
