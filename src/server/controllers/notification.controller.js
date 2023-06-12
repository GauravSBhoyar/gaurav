const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const Logger = require("../utilities/logger");

const { Notification } = require('../models');

const getNotifications = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let result = await Notification.find(
                {
                    notification_user_id: user._id,
                    "createdAt": {"$gt":new Date(Date.now() - 24*60*60 * 1000)}
                },
                null,
                {
                    sort: { createdAt: -1 }
                }
            );
            if (result.length)
                res.data = result;
            else
                res.data = "no notifications";
            return next(200)
        }
    )(req, res, next);
});

const updateNotifications = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let match = req.body.match;
            match.notification_user_id = user._id;
            let data = req.body.data;
            Notification.updateMany(
                match,
                data
            )
                .then((result) => {
                    if (result.modifiedCount > 0)
                    next(200);
                })
                .catch((err) => {
                    Logger.error(err);
                    next(500);
                });
                next(200);
        }
    )(req, res, next);
});

module.exports = {
    getNotifications,
    updateNotifications,
}