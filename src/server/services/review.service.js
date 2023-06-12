const Logger = require("../utilities/logger"),
    { ObjectId } = require("mongoose").Types,
    { Review, Property } = require("../models");

module.exports.updateReviewReply = async (data, user) => {
    try {
        let response = await Review.updateOne({ _id: data._id }, data);
        return response.modifiedCount ? 1 : 0;
    } catch (err) {
        Logger.error(err);
        return;
    }
};

module.exports.deleteReview = async (data, user) => {
    try {
        data.review_user_id = new ObjectId(user._id);
        let response = await Review.findOneAndRemove({ _id: data._id });
        let propertyId = response.review_property_id;
        if (response._id) {
            response = await Property.updateOne(
                { _id: new ObjectId(propertyId) },
                {
                    $inc: {
                        property_review_count: -1,
                        property_review_sum: -response.review_star_rating,
                    },
                }
            );
            return response.acknowledged ? 1 : 0;
        }
        return;
    } catch (err) {
        Logger.error(err);
        return;
    }
};

module.exports.updateReview = async (data, user) => {
    try {
        data.review_user_id = new ObjectId(user._id);
        let response = await Review.findOneAndUpdate({ _id: data._id }, data);
        let propertyId = response.review_property_id;
        if (response._id) {
            response = await Property.updateOne(
                { _id: new ObjectId(propertyId) },
                {
                    $inc: {
                        property_review_sum: -response.review_star_rating,
                    },
                }
            );
            if (response.acknowledged) {
                response = await Property.updateOne(
                    { _id: new ObjectId(propertyId) },
                    {
                        $inc: {
                            property_review_sum: +data.review_star_rating,
                        },
                    }
                );
                return response.acknowledged ? 1 : 0;
            }
        }
        return;
    } catch (err) {
        Logger.error(err);
        return;
    }
};

module.exports.insertReview = async (data, user) => {
    try {
        data.review_user_id = new ObjectId(user._id);
        let response = await new Review(data).save();
        if (response._id) {
            response = await Property.updateOne(
                { _id: new ObjectId(response.review_property_id) },
                {
                    $inc: {
                        property_review_count: 1,
                        property_review_sum: +data.review_star_rating,
                    },
                }
            );
            return response.modifiedCount ? 1 : 0;
        }
        return;
    } catch (err) {
        Logger.error(err);
        return;
    }
};

module.exports.getReviewsByPropertyId = async (
    filter,
    searchText,
    pageNo,
    pageLimit
) => {
    try {
        let sortCond = "";
        switch (filter.sort) {
            case "Top Rated":
                sortCond = { review_star_rating: -1 };
                break;
            case "Latest":
                sortCond = { createdAt: -1 };
                break;
            case "Oldest":
                sortCond = { createdAt: 1 };
                break;
        }
        return await Review.aggregate([
            {
                $match: {
                    review_property_id: new ObjectId(filter.property_id),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "review_user_id",
                    foreignField: "_id",
                    as: "u",
                },
            },
            {
                $project: {
                    review_content: "$review_content",
                    review_star_rating: "$review_star_rating",
                    user_first_name: {
                        $arrayElemAt: ["$u.user_first_name", 0],
                    },
                    user_last_name: { $arrayElemAt: ["$u.user_last_name", 0] },
                    user_email: { $arrayElemAt: ["$u.user_email", 0] },
                    review_property_content: "$review_property_content",
                },
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" },
                        { $addFields: { page: pageNo } },
                    ],
                    data: [
                        { $skip: pageNo * pageLimit },
                        { $limit: pageLimit },
                    ],
                },
            },
        ]).then(async (result) => {
            if (result[0].metadata) {
                const stats = await Property.findOne(
                    { _id: new ObjectId(filter.property_id) },
                    { property_review_count: 1, property_review_sum: 1 }
                );
                result[0].metadata[0].property_review_count =
                    stats.property_review_count;
                result[0].metadata[0].property_review_sum =
                    stats.property_review_sum;
                result[0].metadata[0].property_review_avg =
                    stats.property_review_sum / stats.property_review_count;
                return result;
            }
        });
    } catch (err) {
        Logger.error(err);
        return;
    }
};
