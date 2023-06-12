const userReviewSchema = new (require("mongoose").Schema)(
    {
        review: {
            type: String,
            required: false,
        },
        rating: {
            type: Number,
            required: false,
        },
        username: {
            type: String,
            required: false,
        },
        mobile: {
            type: Number,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        resort_id: {
            type: String,
            required: false,
        },
        user_id: {
            type: String,
            required: false,
        },
        user_image: [{ type: String, required: false, default: "" }],
    },
    {
        timestamps: true
    }
);

const Guestreview = require("mongoose").model("Guestreview",userReviewSchema);

module.exports = Guestreview;