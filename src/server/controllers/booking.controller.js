const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const Logger = require("../utilities/logger");
const cron = require('node-cron');
const moment = require('moment');
const axios = require('axios');

const ProjectUrl = process.env.ProjectUrl
const PaymentGateway =process.env.PaymentGateway


const { getBookingList, getbookingbyuserInfo, getbookingbybook } = require("../services");
const {
  Property,
  Room,
  RoomCategory,
  Customer,
  Booking,
} = require("../models");
const { updateOne } = require("../models/user.model");

// const { response } = require("express");

// const getbooking = async (req, res) => {
//   try {
//     const bookId = req.query._id;
//     if (req.method === "GET" && req.originalUrl) {
//       response = await Booking.findOne({ _id: bookId });
//       res.status(200).send(response);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const getbooking = async (req, res) => {
  try {
    const bookId = req.query._id;
    if (req.method === "GET" && req.originalUrl) {
      // response = await Booking.findOne({ _id: bookId });
      response = await getbookingbybook(req.query._id);
      if (response) {
        res.status(200).send(response);
      }
    }
    res.error = "book again"

  } catch (error) {
    console.log(error);
  }
};

// const createbooking = async (req, res) => {
//   const {
//     booking_user_id,
//     booking_vendor_id,
//     booking_property_id,
//     booking_room_id,
//     booking_type,
//     booking_full_name,
//     booking_country,
//     booking_address,
//     booking_email,
//     booking_phone_no,
//     booking_amount,
//     booking_user_fullname,

//     booking_user_email,
//     booking_status,
//     payment_status,
//     checkIn_date_time,
//     checkOut_date_time,
//     no_of_adult,
//     no_of_child,
//     total_room,
//     total_guest,
//   } = req.body;

//   try {
//     const room = await Room.findOneAndUpdate(
//       { category_id: booking_room_id, room_status: "Available" },
//       { room_status: "Booked", room_booking_id: null },
//       { new: true }
//     );

//     if (!room) {
//       return res.status(200).json({ message: "Room is not available" });
//     }

//     const roomCategory = await RoomCategory.findOne({ _id: room.category_id });
//     const otherRooms = await Room.find({
//       category_id: room.category_id,
//       _id: { $ne: room._id },
//     });

//     const allBooked = otherRooms.every((otherRoom) => {
//       return otherRoom.room_status === "Booked";
//     });

//     if (allBooked) {
//       roomCategory.category_status = "Sold Out";
//       await roomCategory.save();
//     }

//     setTimeout(async () => {
//       room.room_status = "Available";
//       room.room_booking_id = null;
//       await room.save();
//       if (roomCategory.category_status === "Sold Out") {
//         roomCategory.category_status = "Available";
//         await roomCategory.save();
//       }
//     }, 86400000);

//     const propertyDetail = await Property.findOne({
//       _id: booking_property_id,
//     });

//     const propertyName = propertyDetail.property_basic_info.property_name;
//     const propertyRating = propertyDetail.property_basic_info.property_star_rating;
//     const propemail = propertyDetail.property_contact_details.email;
//     const propmobile = propertyDetail.property_contact_details.phone_no;

//     const roomCategoryDetail = await RoomCategory.findOne({
//       _id: booking_room_id,
//     });

//     const roomName = roomCategoryDetail.category_basic_info.name;
//     const roomPrice = roomCategoryDetail.category_base_pricing.base_price;

//     const newBooking = new Booking({
//       booking_user_id: booking_user_id,
//       booking_vendor_id: booking_vendor_id,
//       booking_property_id: booking_property_id,
//       booking_room_id: booking_room_id,
//       booking_type: booking_type,
//       booking_amount: booking_amount,
//       booking_prop: propertyName,
//       booking_prop_star: propertyRating,
//       booking_room: roomName,
//       booking_room_price: roomPrice,
//       booking_status: booking_status,
//       payment_status: payment_status,
//       checkIn_date_time: checkIn_date_time,
//       checkOut_date_time: checkOut_date_time,
//       no_of_adult: no_of_adult,
//      no_of_child: no_of_child,
//      total_room: total_room,
//      total_guest: total_guest,
//      });
//      const savedBooking = await newBooking.save();

//      res.status(201).json({
//        message: "Booking created successfully",
//        booking: savedBooking,
//      });

//     //  cron.schedule('0 12 * * *', async () => {
//     //   // find all bookings that have ended before the current date
//     //   const pastBookings = await Booking.find({
//     //     checkOut_date_time: { $lt: moment().startOf('day').toDate() },
//     //     booking_status: { $ne: 'Cancelled' }
//     //   });

//     //   // loop through all past bookings and set the room status to "Available"
//     //   for (const booking of pastBookings) {
//     //     const room = await Room.findById(booking.booking_room_id);
//     //     if (room) {
//     //       room.room_status = 'Available';
//     //       await room.save();
//     //     }
//     //   }
//     // });  

//        cron.schedule('* * * * *', async () => {
//       // find all bookings that have ended before the current date
//       const pastBookings = await Booking.find({
//         // checkOut_date_time: { $lt: moment.utc() },
//         booking_room_id:"63f88c8a079896fd0f36d6da",
//       });

//       // loop through all past bookings and set the room status to "Available"
//       for (const booking of pastBookings) {
//         const update = await Room.findByIdAndUpdate(
//           booking.booking_room_id,
//           { $set: { room_status: 'Available' } },
//           { new: true }
//         );
//         if (update) {
//           console.log(`Room ${booking.booking_room_id} is now available.`);
//         }
//       }
//     });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Booking failed, please try again" });
//       }
//  };


// const createbooking = async (req, res) => {
//   const {
//     booking_user_id,
//     booking_vendor_id,
//     booking_property_id,
//     booking_room_id,
//     booking_type,
//     booking_full_name,
//     booking_country,
//     booking_address,
//     booking_email,
//     booking_phone_no,
//     booking_amount,
//     booking_user_fullname,
//     no_of_bigchild,
//     booking_user_email,
//     booking_status,
//     payment_status,
//     checkIn_date_time,
//     checkOut_date_time,
//     no_of_adult,
//     no_of_child,
//     total_room,
//     total_guest,
//   } = req.body;

//   try {
//     // find n number of available rooms with category_id equal to booking_room_id
//     const rooms = await Room.find({
//       category_id: booking_room_id,
//       room_status: "Available"
//     }).limit(total_room);
//     console.log(rooms)

//     if (rooms.length < total_room) {
//       return res.status(200).json({ message: "Rooms are not available" });
//     }

//     // update the room_status of all booked rooms to "Booked"
//     const roomIds = rooms.map(room => room._id);
//     await Room.updateMany(
//       { _id: { $in: roomIds } },
//       { room_status: "Booked", room_booking_id: null }
//     );

//     // set category_status to "Sold Out" if all rooms of the same category are booked
//     const roomCategory = await RoomCategory.findOne({ _id: booking_room_id });
//     const otherRooms = await Room.find({
//       category_id: booking_room_id,
//       _id: { $nin: roomIds }
//     });

//     const allBooked = otherRooms.every(otherRoom => {
//       return otherRoom.room_status === "Booked";
//     });

//     if (allBooked) {
//       roomCategory.category_status = "Sold Out";
//       await roomCategory.save();
//     }

//     setTimeout(async () => {
//       // set the room_status of all booked rooms to "Available" after 24 hours
//       await Room.updateMany(
//         { _id: { $in: roomIds } },
//         { room_status: "Available", room_booking_id: null }
//       );

//       if (roomCategory.category_status === "Sold Out") {
//         roomCategory.category_status = "Available";
//         await roomCategory.save();
//       }
//     }, 86400000);


//     const propertyDetail = await Property.findOne({
//       _id: booking_property_id,
//     });

//     const propertyName = propertyDetail.property_basic_info.property_name;
//     const propertyRating = propertyDetail.property_basic_info.property_star_rating;
//     const propemail = propertyDetail.property_contact_details.email;
//     const propmobile = propertyDetail.property_contact_details.phone_no;

//     const roomCategoryDetail = await RoomCategory.findOne({
//       _id: booking_room_id,
//     });

//     const roomName = roomCategoryDetail.category_basic_info.name;
//     const roomPrice = roomCategoryDetail.category_base_pricing.base_price;


//     const checkIn_date_time1 = moment(checkIn_date_time, 'DD/MM/YYYY').format('YYYY-MM-DD');
//     const checkOut_date_time1 = moment(checkOut_date_time, 'DD/MM/YYYY').format('YYYY-MM-DD');

//     const newBooking = new Booking({
//       booking_user_id: booking_user_id,
//       booking_vendor_id: booking_vendor_id,
//       booking_property_id: booking_property_id,
//       booking_room_id: booking_room_id,
//       booking_type: booking_type,
//       booking_amount: booking_amount,
//       booking_prop: propertyName,
//       booking_prop_star: propertyRating,
//       booking_room: roomName,
//       booking_room_price: roomPrice,
//       booking_status: booking_status,
//       payment_status: payment_status,
//       checkIn_date_time: checkIn_date_time1,
//       checkOut_date_time: checkOut_date_time1,
//       no_of_adult: no_of_adult,
//      no_of_child: no_of_child,
//      no_of_bigchild:no_of_bigchild,
//      total_room: total_room,
//      total_guest: total_guest,
//      });
//      const savedBooking = await newBooking.save();



//      res.status(201).json({
//        message: "Booking created successfully",
//        booking: savedBooking,
//      });
//     //  cron.schedule('* * * * *', async () => {
//     //   // find all bookings that have ended before the current date
//     //   const pastBookings = await Booking.find({
//     //     checkOut_date_time: { $lt: moment().startOf('day').toDate() },
//     //     // booking_room_id:"63f88c8a079896fd0f36d6da",
//     //   }).sort({ checkOut_date_time: 1 }); // sort by checkOut_date_time in ascending order

//     //   // loop through all past bookings and set the room status to "Available"
//     //   for (const booking of pastBookings) {
//     //     const room = await Room.findById(booking.booking_room_id);
//     //     if (room) {
//     //       room.room_status = 'Available';
//     //       await room.save();
//     //       console.log("dost na rahee");
//     //     }
//     //   }
//     // });
//     // cron.schedule('* * * * *', async () => {
//     //   // find all bookings that have ended before the current date
//     //   const pastBookings = await Booking.find({
//     //     // checkOut_date_time: { $lt: moment.utc() },
//     //     booking_room_id:"63f88c8a079896fd0f36d6da",
//     //   });

//     //   // loop through all past bookings and set the room status to "Available"
//     //   for (const booking of pastBookings) {
//     //     const update = await Room.findByIdAndUpdate(
//     //       booking.booking_room_id,
//     //       { $set: { room_status: 'Available' } },
//     //       { new: true }
//     //     );
//     //     if (update) {
//     //       console.log(`Room ${booking.booking_room_id} is now available.`);
//     //     }
//     //   }
//     // });


// // Run the cron job every hour
// cron.schedule('0 12 * * *', async () => {
//   console.log("dlavdaaneeeeeeeeee")

//   try {
//     // find all bookings that have ended before the current date
//     const pastBookings = await Booking.find({
//       checkOut_date_time: { $lt: moment().startOf('hour').toDate() }
//       // booking_room_id:"63f88c8a079896fd0f36d6da",
//     });
//     console.log(pastBookings)


//     // loop through all past bookings and set the room status to "Available"
//     for (const booking of pastBookings) {
//       const updatedRoom = await Room.updateMany(
//         { category_id: booking.booking_room_id, room_status: 'Booked' },
//         { $set: { room_status: 'Available' } }
//       );     
//       if (updatedRoom) {
//         console.log("Room is Available know")
//         // room.room_status = 'Available';
//         // room.room_booking_id = null;
//         // await room.save();
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// });


//     //  cron.schedule('* * * * *', async () => {
//     //    // find all bookings that have ended before the current date
//     //    const pastBookings = await Booking.find({
//     //      checkOut_date_time: { $lt: moment().startOf('day').toDate() },
//     //     //  booking_room_id:"63f88c8a079896fd0f36d6da",
//     //     });

//     //     // loop through all past bookings and set the room status to "Available"
//     //     for (const booking of pastBookings) {
//     //       const room = await Room.findById(booking.booking_room_id);
//     //       if (room) {
//     //         room.room_status = 'Available';
//     //         await room.save();
//     //         console.log("dost na rahee");
//     //       }
//     //     }


//     // });


//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Booking failed, please try again" });
//       }
//  };


const createbooking = async (req, res) => {
  const {
    booking_user_id,
    booking_vendor_id,
    booking_property_id,
    booking_room_id,
    booking_type,
    booking_country,
    booking_address,
    booking_email,
    booking_phone_no,
    booking_amount,
    booking_user_fullname,
    no_of_bigchild,
    booking_user_email,
    booking_status,
    payment_status,
    checkIn_date_time,
    checkOut_date_time,
    no_of_adult,
    no_of_child,
    total_room,
    total_guest,
    total_group_num,
    group_adult,
    group_child,
    total_room_price,
    tax_fees,
    coupon_discount,
    booking_full_name,
    vendor_payble,
    commission,
  } = req.body;

  try {
    // find n number of available rooms with category_id equal to booking_room_id
    const rooms = await Room.find({
      category_id: booking_room_id,
      room_status: "Available"
    }).limit(total_room);
    console.log(rooms)

    if (rooms.length < total_room) {
      return res.status(200).json({ message: "Rooms are not available" });
    }

    // update the room_status of all booked rooms to "Booked"
    const roomIds = rooms.map(room => room._id);
    await Room.updateMany(
      { _id: { $in: roomIds } },
      { room_status: "Booked", room_booking_id: null }
    );

    // set category_status to "Sold Out" if all rooms of the same category are booked
    const roomCategory = await RoomCategory.findOne({ _id: booking_room_id });
    const otherRooms = await Room.find({
      category_id: booking_room_id,
      _id: { $nin: roomIds }
    });

    const allBooked = otherRooms.every(otherRoom => {
      return otherRoom.room_status === "Booked";
    });

    if (allBooked) {
      roomCategory.category_status = "Sold Out";
      await roomCategory.save();
    }

    setTimeout(async () => {
      // set the room_status of all booked rooms to "Available" after 24 hours
      await Room.updateMany(
        { _id: { $in: roomIds } },
        { room_status: "Available", room_booking_id: null }
      );

      if (roomCategory.category_status === "Sold Out") {
        roomCategory.category_status = "Available";
        await roomCategory.save();
      }
    }, 86400000);


    const propertyDetail = await Property.findOne({
      _id: booking_property_id,
    });

    const propertyName = propertyDetail.property_basic_info.property_name;
    const propertyRating = propertyDetail.property_basic_info.property_star_rating;
    const propemail = propertyDetail.property_contact_details.email;
    const propmobile = propertyDetail.property_contact_details.phone_no;

    const roomCategoryDetail = await RoomCategory.findOne({
      _id: booking_room_id,
    });

    const roomName = roomCategoryDetail.category_basic_info.name;
    const roomPrice = roomCategoryDetail.category_base_pricing.base_price;


    const checkIn_date_time1 = moment(checkIn_date_time, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const checkOut_date_time1 = moment(checkOut_date_time, 'DD/MM/YYYY').format('YYYY-MM-DD');

    const newBooking = new Booking({
      booking_user_id: booking_user_id,
      booking_vendor_id: booking_vendor_id,
      booking_property_id: booking_property_id,
      booking_room_id: booking_room_id,
      booking_type: booking_type,
      booking_amount: booking_amount,
      booking_prop: propertyName,
      booking_prop_star: propertyRating,
      booking_room: roomName,
      booking_room_price: roomPrice,
      booking_status: booking_status,
      payment_status: payment_status,
      checkIn_date_time: checkIn_date_time1,
      checkOut_date_time: checkOut_date_time1,
      no_of_adult: no_of_adult,
      no_of_child: no_of_child,
      no_of_bigchild: no_of_bigchild,
      total_room: total_room,
      total_guest: total_guest,
      total_group_num: total_group_num,
      group_adult: group_adult,
      group_child: group_child,
      total_room_price: total_room_price,
      tax_fees: tax_fees,
      coupon_discount: coupon_discount,
      booking_full_name: booking_full_name,
      vendor_payble: vendor_payble,
      commission: commission,
    });
    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
    });
    //  cron.schedule('* * * * *', async () => {
    //   // find all bookings that have ended before the current date
    //   const pastBookings = await Booking.find({
    //     checkOut_date_time: { $lt: moment().startOf('day').toDate() },
    //     // booking_room_id:"63f88c8a079896fd0f36d6da",
    //   }).sort({ checkOut_date_time: 1 }); // sort by checkOut_date_time in ascending order

    //   // loop through all past bookings and set the room status to "Available"
    //   for (const booking of pastBookings) {
    //     const room = await Room.findById(booking.booking_room_id);
    //     if (room) {
    //       room.room_status = 'Available';
    //       await room.save();
    //       console.log("dost na rahee");
    //     }
    //   }
    // });
    // cron.schedule('* * * * *', async () => {
    //   // find all bookings that have ended before the current date
    //   const pastBookings = await Booking.find({
    //     // checkOut_date_time: { $lt: moment.utc() },
    //     booking_room_id:"63f88c8a079896fd0f36d6da",
    //   });

    //   // loop through all past bookings and set the room status to "Available"
    //   for (const booking of pastBookings) {
    //     const update = await Room.findByIdAndUpdate(
    //       booking.booking_room_id,
    //       { $set: { room_status: 'Available' } },
    //       { new: true }
    //     );
    //     if (update) {
    //       console.log(`Room ${booking.booking_room_id} is now available.`);
    //     }
    //   }
    // });


    // Run the cron job every hour
    cron.schedule('0 12 * * *', async () => {
      console.log("room avaialbe nodd")

      try {
        // find all bookings that have ended before the current date
        const pastBookings = await Booking.find({
          checkOut_date_time: { $lt: moment().startOf('hour').toDate() }
          // booking_room_id:"63f88c8a079896fd0f36d6da",
        });
        console.log(pastBookings)


        // loop through all past bookings and set the room status to "Available"
        for (const booking of pastBookings) {
          const updatedRoom = await Room.updateMany(
            { category_id: booking.booking_room_id, room_status: 'Booked' },
            { $set: { room_status: 'Available' } }
          );
          if (updatedRoom) {
            console.log("Room is Available know")
            // room.room_status = 'Available';
            // room.room_booking_id = null;
            // await room.save();
          }
        }
      } catch (error) {
        console.error(error);
      }
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Booking failed, please try again" });
  }
};

const createSessionId = async (req, res) => {

  const { booking_id, user_id, number, amount } = req.body;

  const options = {
    method: 'POST',
    url: `${PaymentGateway}/orders`,
    // url: '${PaymentGateway}',
    headers: {
      accept: 'application/json',
      'x-client-id': process.env.AppIdCashfree,
      'x-client-secret': process.env.SecretKeyCashfree,
      'x-api-version': '2022-09-01',
      'content-type': 'application/json'
    },
    data: {
      order_id: booking_id,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user_id,
        // customer_email: 'john@cashfree.com',
        customer_phone: number,
        // customer_bank_account_number: '1518121112',
        // customer_bank_ifsc: 'CITI0000001',
        // customer_bank_code: 3333
      },
      "order_meta": {
        "return_url": `${ProjectUrl}/paymentconfirm?confirmation_id={order_id}`
        // "return_url": `http://localhost:3000/paymentconfirm?confirmation_id={order_id}`
      },
    }
  };

  axios
    .request(options)
    .then(function (response) {
      let Payment_Session_Id = response.data.payment_session_id;

      if (Payment_Session_Id) {
        res.status(200).send({
          message: "Success",
          session_Id: Payment_Session_Id,
          booking_id: booking_id,
          user_id: user_id,
        });
      }

    })
    .catch(function (error) {
      res.status(200).send({
        message: "Failure",
        error: error.response.data.message,
        booking_id: booking_id,
        user_id: user_id,
      });
    });

}

const getPaymentStatus = async (req, res) => {

  const booking_id = req.query.booking_id;

  const options = {
    method: 'GET',
    url: `${PaymentGateway}/orders/${booking_id}`,
    // url: `https://api.cashfree.com/pg/orders/${booking_id}`,
    headers: {
      accept: 'application/json',
      'x-client-id': process.env.AppIdCashfree,
      'x-client-secret': process.env.SecretKeyCashfree,
      'x-api-version': '2022-09-01'
    }
  };
  
  axios
    .request(options)
    .then(function (response) {
      let Payment_Session_Id = response.data.payment_session_id;
      if (Payment_Session_Id) {
        res.status(200).send({
          message: "Success",
          data: response.data
        });
      }

    })
    .catch(function (error) {
      res.status(200).send({
        message: "Failure",
        error: error.response.data.message,
        booking_id: booking_id,
      });
    });
}

const updatebooking = async (req, res) => {
  const now = new Date();
  // const value = date.format(now, 'YYYY/MM/DD HH:mm:ss');
  let bookingStatus = req.body.booking_status;

  if (req.body.payment_status === 'Success') {
    bookingStatus = 'Success';
  } else {
    bookingStatus = 'Cancelled';
  }

  Booking.updateOne(
    { _id: req.body._id },
    {
      payment_status: req.body.payment_status,
      booking_status: bookingStatus,
      booking_date: now,
    }
  ).then((result) => {
    res.status(200).send(result);
  });

};

const cancelbooking = async (req, res) => {
  const now = new Date();
  let bookingStatus = req.body.booking_status;

  Booking.updateOne(
    { _id: req.body._id },
    {
      booking_status: bookingStatus,
      booking_date: now,
    }
  ).then(() => {
    res.status(200).send({
      message: "Updated",
      _id: req.body._id,
      booking_status: bookingStatus,
      booking_date: now,
    });
  });
};

// const updatebooking = async (req, res) => {
//   const now = new Date();
//   // const value = date.format(now, 'YYYY/MM/DD HH:mm:ss');
//   let bookingStatus = req.body.booking_status;

//   if (req.body.payment_status === 'Success') {
//     bookingStatus = 'Success';
//   } else {
//     bookingStatus = 'Cancelled';
//   }

//   Booking.updateOne(
//     { _id: req.body._id },
//     {
//       payment_status: req.body.payment_status,
//       booking_status: bookingStatus,
//       booking_date: now,
//     }
//   ).then((result) => {
//     res.status(200).send(result);
//   });

// }; 25 may 2023

// const updatebooking = async (req, res) => {
//  Customer.findOne({_id: req.body.user_id}).then((result)=>{
//   console.log(result);
//     const fullname = result.firstname + " " + result.lastname;
//     const email = result.email;
//      Booking.updateOne(
//     { _id: req.body._id },
//     {
//       booking_user_mobile: result.mobile,
//       booking_user_fullname:fullname,
//       booking_user_email:email,
//       payment_status: req.body.payment_status,
//       booking_status: req.body.booking_status,
//     }
//   ).then((result) => {
//     res.status(200).send();
//   });
//  })
// };

// const getBookingByUserId = async (req, res)=>{
//   try {
//     const booking_user_id = req.query._id;
//     if (req.method === "GET" && req.originalUrl) {
//      var response = await Booking.find({ booking_user_id: booking_user_id }).then((result)=>{
//       const data = result;
//         Customer.findOne({_id:booking_user_id}).then((result)=>{
//           const fullname = result.firstname + " " + result.lastname;
//           const email = result.email;
//           res.status(200).send({
//             message: "bookings is fetched successfully...",
//             data: data,
//             fullname: fullname,
//             email: email
//           });
//         })
//       }
//       );

//     }
//   } catch (error) {
//     console.log(error);
//   }
// };




const getbookbycat = async (req, res, next) => {
  let currentDate = new Date();
  let previousDate = new Date();
  previousDate.setDate(currentDate.getDate() - 1);
  let localDate = currentDate
    .toLocaleString("en-US", {
      timeZone: process.env.LOCAL_TZ,
      hour12: false,
    })
    .split(",")[0]
    .split("/");
  localDate = localDate[2] + "-" + localDate[0] + "-" + localDate[1];
  if (req.method === "GET" && req.originalUrl) {
    console.log(localDate)
    let err = "errrrror";

    var userId = req.query.userId;
    response = await getbookingbyuserInfo(userId);
    if (!response) {
      console.log("error")
    }
    const c = Customer.findOne({ _id: userId }).then((result) => {
      const userImages = result.user_image; // Assuming `user_image` is an array
  const lastUserImage = userImages[userImages.length - 1]; // Get the last element in the array

      res.status(200).send({
        message: "bookings is fetched successfully...",
        data: response,
        // fullname: fullname,
        firstname: result.firstname,
        lastname: result.lastname,
        email: result.email,
        mobile: result.mobile,
        user_image: lastUserImage
      });
    })
    // if (response) {
    //   res.data = response;
    //   // res.message = c.booking_full_name;
    //   // console.log(c)
    //    next(200);
    // }
    // res.error = response;
  }
  //  return next(500);
}


const getBookingByUserId = async (req, res) => {
  try {
    const booking_user_id = req.query._id;
    if (req.method === "GET" && req.originalUrl) {
      var response = await Booking.find({ booking_user_id: booking_user_id }).sort({ createdAt: -1 }).then((result) => {
        const data = result;

        Customer.findOne({ _id: booking_user_id }).then((result) => {
          if (!result.firstname && !result.lastname && !result.email) {
            var fullname = "guest";
            var email = "";
          } else {
            var fullname = result.firstname + " " + result.lastname;
            var email = result.email;
          }
          res.status(200).send({
            message: "bookings are fetched successfully...",
            data: data,
            fullname: fullname,
            firstname: result.firstname,
            lastname: result.lastname,
            email: email,
          });
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};



module.exports = { getbooking, createbooking, updatebooking, createSessionId, getPaymentStatus, cancelbooking, getBookingByUserId, getbookbycat };