
const bookingSchema = new (require("mongoose").Schema)(
  {
    booking_user_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    booking_vendor_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
    },
    booking_property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    booking_room_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Room",
    },
    booking_type: {
      // 1 - online, 2 - offline
      type: String,
      required: false,
    },
    booking_full_name: {
      type: String,
      required: false,
    },
    booking_country: {
      type: String,
      required: false,
    },
    booking_address: {
      type: String,
      required: false,
    },
    booking_email: {
      // 1 - online, 2 - offline
      type: String,
      required: false,
    },
    booking_phone_no: {
      type: String,
      required: false,
    },
    booking_amount: { type: String, required: false },

    booking_status: {
      // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
      type: String,
      required: false,
    },
    booking_prop: {
      // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
      type: String,
      required: false,
    },
    booking_prop_star: {
      // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
      type: String,
      required: false,
    },
    booking_room:{
      type: String,
      required: false,

    },
    booking_user_fullname:{
      type: String,
      required: false,

    },
    booking_user_mobile:{
      type: String,
      required: false,
    },
    
    booking_user_email:{
      type: String,
      required: false,

    },
    payment_status: {
      type: String,
      required: false,
    },
    checkIn_date_time: {
      type: Date,
      required: true,
    },
    checkOut_date_time: {
      type: Date,
      required: true,
    },
    no_of_adult: {
      type: String,
      required: false,
    },
    no_of_child: {
      type: String,
      required: false,
    },
    no_of_bigchild: {
      type: String,
      required: false,
    },
    total_guest: {
      type: String,
      required: false,
    },
    total_room: {
      type: String,
      required: false,
    },
    total_group_num: {
      type: String,
      required: false,
    },
    group_adult: {
      type: String,
      required: false,
    },
    group_child: {
      type: String,
      required: false,
    },
    total_room_price: {
      type: String,
      required: false,
    },
    tax_fees: {
      type: String,
      required: false,
    },
    coupon_discount: {
      type: String,
      required: false,
    },
    booking_full_name: {
      type: String,
      required: false,
    },
    vendor_payble: {
      type: String,
      required: false,
    },
    commission:{
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = require("mongoose").model("Booking", bookingSchema);

module.exports = Booking;





// // old booking model

// const bookingSchema = new (require("mongoose").Schema)(
//   {
//     booking_user_id: {
//       type: require("mongoose").Schema.Types.ObjectId,
//       ref: "User",
//       required: false,
//     },
//     booking_vendor_id: {
//       type: require("mongoose").Schema.Types.ObjectId,
//       ref: "User",
//     },
//     booking_property_id: {
//       type: require("mongoose").Schema.Types.ObjectId,
//       ref: "Property",
//     },
//     booking_room_id: {
//       type: require("mongoose").Schema.Types.ObjectId,
//       ref: "Room",
//     },
//     booking_type: {
//       // 1 - online, 2 - offline
//       type: String,
//       required: false,
//     },
//     booking_full_name: {
//       type: String,
//       required: false,
//     },
//     booking_country: {
//       type: String,
//       required: false,
//     },
//     booking_address: {
//       type: String,
//       required: false,
//     },
//     booking_email: {
//       // 1 - online, 2 - offline
//       type: String,
//       required: false,
//     },
//     booking_phone_no: {
//       type: String,
//       required: false,
//     },
//     booking_amount: { type: String, required: false },

//     booking_status: {
//       // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
//       type: String,
//       required: false,
//     },
//     booking_prop: {
//       // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
//       type: String,
//       required: false,
//     },
//     booking_prop_star: {
//       // 1 - completed, 2 - ongoing, 3 - booked, 4 - cancelled, 5 - Scheduled
//       type: String,
//       required: false,
//     },
//     booking_room:{
//       type: String,
//       required: false,

//     },
//     booking_room_price:{
//       type: String,
//       required: false,

//     },
//     payment_status: {
//       type: String,
//       required: false,
//     },
//     checkIn_date_time: {
//       type: String,
//       required: true,
//     },
//     checkOut_date_time: {
//       type: String,
//       required: true,
//     },
//     no_of_adult: {
//       type: String,
//       required: false,
//     },
//     no_of_child: {
//       type: String,
//       required: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Booking = require("mongoose").model("Booking", bookingSchema);

// module.exports = Booking;







