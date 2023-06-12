const couponSchema = new (require("mongoose").Schema)(
  {
    coupon_redeemed_by: { type: require("mongoose").Schema.Types.ObjectId, ref: "User" },
    coupon_title: { type: String, required: false },
    coupone_code: { type: String, required: false },
    coupone_discount: { type: String, required: false },
    coupone_discount_type: { type: String, required: false },
    coupone_is_one_time: { type: String, required: false },
    coupon_uses_count:{type:Number,  required: false },
    coupon_max_uses:{type:Number, required: false },
    coupon_valid_from: { type: String, required: false },
    coupon_valid_till: { type: String, required: false },
    coupon_status: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Coupon = require("mongoose").model("Coupon", couponSchema);

module.exports = Coupon;





// const couponSchema = new (require("mongoose").Schema)(
//   {
//     coupon_redeemed_by: { type: require("mongoose").Schema.Types.ObjectId, ref: "User" },
//     coupon_title: { type: String, required: false },
//     coupone_code: { type: String, required: false },
//     coupone_discount: { type: String, required: false },
//     coupone_discount_type: { type: String, required: false },
//     coupone_is_one_time: { type: String, required: false },
//     coupon_valid_from: { type: String, required: false },
//     coupon_valid_till: { type: String, required: false },
//     coupon_status: { type: String, required: false },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Coupon = require("mongoose").model("Coupon", couponSchema);

// module.exports = Coupon;
