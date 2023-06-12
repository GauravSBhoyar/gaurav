const passport = require("passport"),
    catchAsync = require("../utilities/catchAsync"),
    {
        insertReview,
        getReviewsByPropertyId,
        updateReview,
        deleteReview,
        updateReviewReply,
    } = require("../services");

module.exports.propertyReviewController = catchAsync(async (req, res, next) => {
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
            if (req.method == "PUT" && req.originalUrl.includes("reply")) {
                let data = { ...req.params, ...req.body };
                let response = await updateReviewReply(data, user);
                if (response) {
                    res.message = "Review reply updated successfully";
                    return next(200);
                }
                res.error = "Failed to updated review reply";
                return next(500);
            }
            if (req.method == "DELETE") {
                let data = { ...req.params, ...req.body };
                let response = await deleteReview(data, user);
                if (response) {
                    res.message = "Review deleted successfully";
                    return next(200);
                }
                res.error = "Failed to delete review";
                return next(500);
            }
            if (req.method == "PUT") {
                let data = { ...req.params, ...req.body };
                let response = await updateReview(data, user);
                if (response) {
                    res.message = "Review updated successfully";
                    return next(200);
                }
                res.error = "Failed to updated review";
                return next(500);
            }
            if (req.method == "POST") {
                let data = { ...req.body };
                let response = await insertReview(data, user);
                if (response) {
                    res.message = "Review inserted successfully";
                    return next(200);
                }
                res.error = "Failed to insert review";
                return next(500);
            }
            if (req.method == "GET") {
                let query = { ...req.query };
                let searchText = !query.search ? null : query.search;
                let pageNo = parseInt(query.pageNo);
                let pageLimit = parseInt(query.pageLimit);
                delete query.pageNo;
                delete query.pageLimit;
                delete query.search;
                for (const key in query) {
                    if (query[key] === "true") query[key] = true;
                    if (query[key] === "false") query[key] = false;
                }
                let response = await getReviewsByPropertyId(
                    query,
                    searchText,
                    pageNo,
                    pageLimit
                );
                if (response) {
                    res.message = response;
                    return next(200);
                }
                res.error = "Failed to get reviews";
                return next(500);
            }
        }
    )(req, res, next);
});
