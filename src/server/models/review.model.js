const reviewSchema = new (require("mongoose").Schema)(
  {
    review_user_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
    },
    review_property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    review_content: {
      type: String,
      required: false,
    },
    review_star_rating: {
      type: Number,
      required: false,
    },
    review_property_content: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Review = require("mongoose").model("Review", reviewSchema);

module.exports = Review;
