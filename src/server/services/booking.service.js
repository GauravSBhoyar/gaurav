const { ObjectId } = require("mongodb");
const { Room, Booking, Counter, Pricing } = require("../models");
const { isBetween } = require("../utilities/dateTimeChecker");
const Logger = require("../utilities/logger");

const { checkBooking } = require("../utilities/bookingChecker");

const insertBookingNew = async (data) => {
  try {
    let rooms = await Pricing.aggregate([
      {
        $match: { _id: ObjectId(data.pricing_id) },
      },
      {
        $lookup: {
          from: "properties",
          localField: "pricing_property_id",
          foreignField: "_id",
          as: "p",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "pricing_room_type",
          foreignField: "room_basic_info.room_type",
          as: "r",
        },
      },
      {
        $addFields: {
          rooms: {
            $filter: {
              input: "$r",
              as: "rooms",
              cond: {
                $ne: ["$$rooms.room_status", "Blocked"],
              },
            },
          },
        },
      },
      {
        $project: {
          room_ids: "$rooms._id",
        },
      },
    ]);
    data.booking_room_id = await checkBooking(
      rooms[0].room_ids,
      data.checkIn_date_time,
      data.checkOut_date_time
    );
    if (!data.booking_room_id) {
      return "All rooms are booked";
    }
    let newBooking = await new Booking(data).save();
    return !newBooking._id ? "Something went wrong" : 1;
  } catch (err) {
    Logger.error(err);
    return "System Error";
  }
};

// const getBookingList = async (pageNo, searchText, filter) => {
//     if (!searchText) {
//         searchText = null;
//     } else {
//         searchText = new RegExp(searchText.toLowerCase());
//     }
//     if (!filter) {
//         filter = null;
//     } else {
//         filter = new RegExp(filter.toLowerCase());
//     }
//     return await Booking.aggregate([
//         {
//             $sort: { createdAt: -1 },
//         },
//         {
//             $lookup: {
//                 from: "rooms",
//                 localField: "booking_room_id",
//                 foreignField: "_id",
//                 as: "room_details",
//             },
//         },
//         {
//             $lookup: {
//                 from: "properties",
//                 localField: "room_details.property_id",
//                 foreignField: "_id",
//                 as: "prop_details",
//             },
//         },
//         {
//             $set: {
//                 full_string: {
//                     $toLower: {
//                         $concat: [
//                             {
//                                 $ifNull: [
//                                     {
//                                         $toString: {
//                                             $arrayElemAt: [
//                                                 "$room_details.room_basic_info.room_type",
//                                                 0,
//                                             ],
//                                         },
//                                     },
//                                     "",
//                                 ],
//                             },
//                             {
//                                 $ifNull: [
//                                     {
//                                         $toString: {
//                                             $arrayElemAt: [
//                                                 "$prop_details.property_basic_info.property_name",
//                                                 0,
//                                             ],
//                                         },
//                                     },
//                                     "",
//                                 ],
//                             },
//                             {
//                                 $ifNull: [
//                                     { $toString: "$booking_full_name" },
//                                     "",
//                                 ],
//                             },
//                             { $ifNull: [{ $toString: "$booking_amount" }, ""] },
//                             { $ifNull: [{ $toString: "$booking_status" }, ""] },
//                             { $ifNull: [{ $toString: "$booking_type" }, ""] },
//                             {
//                                 $ifNull: [
//                                     { $toString: "$checkOut_date_time" },
//                                     "",
//                                 ],
//                             },
//                             {
//                                 $ifNull: [
//                                     { $toString: "$checkIn_date_time" },
//                                     "",
//                                 ],
//                             },
//                             {
//                                 $dateToString: {
//                                     format: "%Y-%m-%d",
//                                     date: "$createdAt",
//                                     timezone: "Asia/Kolkata",
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             },
//         },
//         // {
//         //     $match: {
//         //         $and: [
//         //             {
//         //                 $expr: {
//         //                     $cond: [
//         //                         { $eq: [searchText, null] },
//         //                         true,
//         //                         {
//         //                             $regexFind: {
//         //                                 input: "$full_string",
//         //                                 regex: searchText,
//         //                             },
//         //                         },
//         //                     ],
//         //                 },
//         //             },
//         //             {
//         //                 $expr: {
//         //                     $cond: [
//         //                         { $eq: [filter, null] },
//         //                         true,
//         //                         {
//         //                             $regexFind: {
//         //                                 input: { $toLower: "$booking_status" },
//         //                                 regex: filter,
//         //                             },
//         //                         },
//         //                     ],
//         //                 },
//         //             },
//         //         ],
//         //     },
//         // },
//         // {
//         //     $addFields: {
//         //         no_of_nights: {
//         //             $cond: [
//         //                 {
//         //                     $and: [
//         //                         {
//         //                             $eq: ["$checkOut_date_time", ""],
//         //                         },
//         //                         {
//         //                             $eq: ["$checkIn_date_time", ""],
//         //                         },
//         //                     ],
//         //                 },
//         //                 -1,
//         //                 {
//         //                     $divide: [
//         //                         {
//         //                             $subtract: [
//         //                                 { $toDate: "$checkOut_date_time" },
//         //                                 { $toDate: "$checkIn_date_time" },
//         //                             ],
//         //                         },
//         //                         1000 * 60 * 60 * 24,
//         //                     ],
//         //                 },
//         //             ],
//         //         },
//         //     },
//         // },
//         // {
//         //     $project: {
//         //         full_string: "$full_string",
//         //         booking_full_name: "$booking_full_name",
//         //         booking_room_type: {
//         //             $arrayElemAt: [
//         //                 "$room_details.room_basic_info.room_type",
//         //                 0,
//         //             ],
//         //         },
//         //         property_name: {
//         //             $arrayElemAt: [
//         //                 "$prop_details.property_basic_info.property_name",
//         //                 0,
//         //             ],
//         //         },
//         //         no_of_adult: "$no_of_adult",
//         //         no_of_child: "$no_of_child",
//         //         no_of_nights: "$no_of_nights",
//         //         booking_amount: "$booking_amount",
//         //         booking_status: "$booking_status",
//         //         booking_type: "$booking_type",
//         //         checkIn_date_time: "$checkIn_date_time",
//         //         checkOut_date_time: "$checkOut_date_time",
//         //         added_on: {
//         //             $dateToString: {
//         //                 format: "%Y-%m-%d",
//         //                 date: "$createdAt",
//         //                 timezone: "Asia/Kolkata",
//         //             },
//         //         },
//         //     },
//         // },
//         {
//             $facet: {
//                 metadata: [
//                     { $count: "total" },
//                     { $addFields: { page: parseInt(pageNo) } },
//                 ],
//                 data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
//             },
//         },
//     ])
// .then((result) => {
//             return {
//                 metadata: result[0].metadata[0],
//                 data: result[0].data,
//             };
//         })
//         .catch((err) => {
//             Logger.error(err);
//             return "error";
//         });
// };

const getBookingList = async (pageNo, searchText, filter) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  if (!filter) {
    filter = null;
  } else {
    filter = new RegExp(filter.toLowerCase());
  }
  return await Booking.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "room_details",
      },
    },
    {
      $lookup: {
        from: "properties",
        localField: "booking_property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "booking_user_id",
        foreignField: "_id",
        as: "c",
      },
    },
    {
      $lookup: {
        from: "roomcategories",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "r",
      },
    },
    {
      $unwind: "$p",
    },
    {
      $unwind: "$r",
    },
    {
      $unwind: "$c",
    },

    {
      $project: {
        booking_user_id: "$booking_user_id",
        booking_vendor_id: "$booking_vendor_id",
        booking_property_id: "$booking_property_id",
        booking_room_id: "$booking_room_id",
        booking_type: "$booking_type",
        booking_status: "$booking_status",
        payment_status: "$payment_status",
        booking_amount: "$booking_amount",
        no_of_adult: "$no_of_adult",
        no_of_child: "$no_of_child",
        no_of_bigchild: "$no_of_bigchild",
        group_child: "$group_child",
        group_adult: "$group_adult",
        total_guest: "$total_guest",
        total_room: "$total_room",
        checkIn_date_time: "$checkIn_date_time",
        checkOut_date_time: "$checkOut_date_time",
        property_name: "$p.property_basic_info.property_name",
        custumer: "$c",
        roomcatname: "$r.category_basic_info.name",
        roomcatname: "$r.category_basic_info.name",
        bookingtime: "$createdAt",
      },
    },
    {
      $set: {
        full_string: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$room_details.room_basic_info.room_type",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$p.property_basic_info.property_name",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [{ $toString: "$booking_full_name" }, ""],
              },
              { $ifNull: [{ $toString: "$booking_amount" }, ""] },
              { $ifNull: [{ $toString: "$booking_status" }, ""] },
              { $ifNull: [{ $toString: "$booking_type" }, ""] },
              {
                $ifNull: [{ $toString: "$checkOut_date_time" }, ""],
              },
              {
                $ifNull: [{ $toString: "$checkIn_date_time" }, ""],
              },
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
            ],
          },
        },
      },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(pageNo) } },
        ],
        data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
      },
    },
  ])
    .then((result) => {
      return {
        metadata: result[0].metadata[0],
        data: result[0].data,
      };
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

const getBookingListFilter = async (pageNo, searchText, filter, booking_filter) => {
  let currentDate = new Date();
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  if (!filter) {
    filter = null;
  } else {
    filter = new RegExp(filter.toLowerCase());
  }

  let matchQuery = {}; // Define an empty match query object

  if(!booking_filter){
    booking_filter = ""
    console.log("booking filter empty 2")
  }else if(booking_filter === "Upcoming") {
    matchQuery = {
      booking_status: "Success",
      checkIn_date_time: {$gt: currentDate},
    }
  }else if(booking_filter === "Completed") {
    matchQuery = {
      booking_status: "Success",
      checkIn_date_time: {$lte: currentDate},
    }
  }else if(booking_filter === "Cancelled") {
    matchQuery = {
      booking_status: "Cancelled",
    }
  }
 


  return await Booking.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "room_details",
      },
    },
    {
      $lookup: {
        from: "properties",
        localField: "booking_property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "booking_user_id",
        foreignField: "_id",
        as: "c",
      },
    },
    {
      $lookup: {
        from: "roomcategories",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "r",
      },
    },
    {
      $unwind: "$p",
    },
    {
      $unwind: "$r",
    },
    {
      $unwind: "$c",
    },

    {
      $project: {
        booking_user_id: "$booking_user_id",
        booking_vendor_id: "$booking_vendor_id",
        booking_property_id: "$booking_property_id",
        booking_room_id: "$booking_room_id",
        booking_type: "$booking_type",
        booking_status: "$booking_status",
        payment_status: "$payment_status",
        booking_amount: "$booking_amount",
        no_of_adult: "$no_of_adult",
        no_of_child: "$no_of_child",
        no_of_bigchild: "$no_of_bigchild",
        group_child: "$group_child",
        group_adult: "$group_adult",
        total_guest: "$total_guest",
        total_room: "$total_room",
        checkIn_date_time: "$checkIn_date_time",
        checkOut_date_time: "$checkOut_date_time",
        property_name: "$p.property_basic_info.property_name",
        custumer: "$c",
        roomcatname: "$r.category_basic_info.name",
        roomcatname: "$r.category_basic_info.name",
        bookingtime: "$createdAt",
      },
    },
    {
      $set: {
        full_string: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$room_details.room_basic_info.room_type",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$p.property_basic_info.property_name",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [{ $toString: "$booking_full_name" }, ""],
              },
              { $ifNull: [{ $toString: "$booking_amount" }, ""] },
              { $ifNull: [{ $toString: "$booking_status" }, ""] },
              { $ifNull: [{ $toString: "$booking_type" }, ""] },
              {
                $ifNull: [{ $toString: "$checkOut_date_time" }, ""],
              },
              {
                $ifNull: [{ $toString: "$checkIn_date_time" }, ""],
              },
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
            ],
          },
        },
      },
    },
    // {
    //   $match: {
    //     booking_status: "Success",
    //     checkIn_date_time: {$gt: currentDate},
    //   },
    // },
    {
      $match: matchQuery,
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(pageNo) } },
        ],
        data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
      },
    },
  ])
    .then((result) => {
      return {
        metadata: result[0].metadata[0],
        data: result[0].data,
      };
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

const getVendorSettlement = async (pageNo, searchText, filter) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  if (!filter) {
    filter = null;
  } else {
    filter = new RegExp(filter.toLowerCase());
  }
  return await Booking.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "room_details",
      },
    },
    {
      $lookup: {
        from: "properties",
        localField: "booking_property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "booking_user_id",
        foreignField: "_id",
        as: "c",
      },
    },
    {
      $lookup: {
        from: "roomcategories",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "r",
      },
    },
    {
      $unwind: "$p",
    },
    {
      $unwind: "$r",
    },
    {
      $unwind: "$c",
    },

    {
      $project: {
        booking_user_id: "$booking_user_id",
        booking_vendor_id: "$booking_vendor_id",
        booking_property_id: "$booking_property_id",
        booking_room_id: "$booking_room_id",
        booking_type: "$booking_type",
        booking_status: "$booking_status",
        payment_status: "$payment_status",
        booking_amount: "$booking_amount",
        no_of_adult: "$no_of_adult",
        no_of_child: "$no_of_child",
        no_of_bigchild: "$no_of_bigchild",
        group_child: "$group_child",
        group_adult: "$group_adult",
        total_guest: "$total_guest",
        total_room: "$total_room",
        vendor_payble: "$vendor_payble",
        commission: "$commission",
        checkIn_date_time: "$checkIn_date_time",
        checkOut_date_time: "$checkOut_date_time",
        property_name: "$p.property_basic_info.property_name",
        customer: "$c",
        roomcatname: "$r.category_basic_info.name",
        bookingtime: "$createdAt",
      },
    },
    {
      $set: {
        full_string: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$room_details.room_basic_info.room_type",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: [
                        "$p.property_basic_info.property_name",
                        0,
                      ],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [{ $toString: "$booking_room_id" }, ""],
              },
              { $ifNull: [{ $toString: "$booking_vendor_id" }, ""] },
              { $ifNull: [{ $toString: "$vendor_payble" }, ""] },
              { $ifNull: [{ $toString: "$commission" }, ""] },
              { $ifNull: [{ $toString: "$booking_amount" }, ""] },
              {
                $ifNull: [{ $toString: "$checkOut_date_time" }, ""],
              },
              {
                $ifNull: [{ $toString: "$checkIn_date_time" }, ""],
              },
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
            ],
          },
        },
      },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(pageNo) } },
        ],
        data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
      },
    },
  ])
    .then((result) => {
      return {
        metadata: result[0].metadata[0],
        data: result[0].data,
      };
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};




const getDashboardInfo = (vendorId, propertyId) => {
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
  console.log(previousDate, currentDate)
  return Promise.resolve(
    Booking.aggregate([
      {
        $facet: {
          total_count: [
            {
              $match: {
                booking_status: {
                  $ne: "Cancelled",
                },
                // booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
              },
            },
            {
              $count: "total_count",
            },
          ],
          current_count: [
            {
              $match: {
                booking_status: {
                  $ne: "Cancelled",
                },
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                createdAt: {
                  $gt: new Date(
                    currentDate.getTime() -
                    1000 * 60 * 60 * 24 * 30
                  ),
                },
              },
            },
            {
              $count: "current_count",
            },
          ],
          previous_count: [
            {
              $match: {
                booking_status: {
                  $ne: "Cancelled",
                },
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                createdAt: {
                  $gt: new Date(
                    previousDate.getTime() -
                    1000 * 60 * 60 * 24 * 30
                  ),
                  $lt: previousDate,
                },
              },
            },
            {
              $count: "previous_count",
            },
          ],
          upcoming_booking: [
            {
              $match: {
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                // booking_status: "Scheduled",
                checkIn_date_time: { $gte: localDate },
              },
            },
            // {
            //     $sort: { checkIn_date_time: 1 },
            // },
            {
              $count: "upcoming_booking",
            },
            // {
            //     $limit: 2,
            // },
          ],
          room_ids: [
            {
              $match: {
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
              }
            },
            {
              $project: { booking_room_id: 1 }
            }
          ],
          upcoming_bookings_list: [
            {
              $match: {
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                booking_status: "Success",
                checkIn_date_time: { $gt: currentDate },
              },
            },
            {
                $sort: { createdAt: -1 },
            },
            // {
            //   $count: "upcoming_booking",
            // },
            {
                $limit: 3,
            },
          ],
          total_earning: [
            {
              $match: {
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                booking_amount: {
                  $ne: ''
                },
                createdAt: {
                  $gt: new Date(
                    currentDate.getTime() -
                    1000 * 60 * 60 * 24 * 30
                  ),
                },
              }
            }, {
              $group: {
                _id: null,
                total_earning: {
                  $sum: {
                    $toInt: '$booking_amount'
                  }
                }
              }
            }
          ],
          previous_earning: [
            {
              $match: {
                booking_vendor_id: new ObjectId(vendorId),
                booking_property_id: new ObjectId(propertyId),
                booking_amount: {
                  $ne: ''
                },
                createdAt: {
                  $gt: new Date(
                    previousDate.getTime() -
                    1000 * 60 * 60 * 24 * 30
                  ),
                  $lt: previousDate,
                },
              }
            }, {
              $group: {
                _id: null,
                previous_earning: {
                  $sum: {
                    $toInt: '$booking_amount'
                  }
                }
              }
            }

          ]
        },
      },
      {
        $project: {
          total_count: {
            $arrayElemAt: ["$total_count.total_count", 0],
          },
          current_count: {
            $arrayElemAt: ["$current_count.current_count", 0],
          },
          previous_count: {
            $arrayElemAt: ["$previous_count.previous_count", 0],
          },
          upcoming_booking: {
            $arrayElemAt: ["$upcoming_booking.upcoming_booking", 0],
          },
          // upcoming_booking: "$upcoming_booking",
          total_earning: {
            $arrayElemAt: ["$total_earning.total_earning", 0]
          },
          previous_earning: {
            $arrayElemAt: ["$previous_earning.previous_earning", 0]
          },
          room_ids: "$room_ids",
          upcoming_bookings_list: "$upcoming_bookings_list",
        },
      },
    ])
      .then((result) => {
        return {
          total_booking: result[0].total_count,
          booking_increase: `${(
            ((result[0].current_count - result[0].previous_count) /
              result[0].previous_count) *
            100
          ).toFixed(2)}%`,
          total_earning: result[0].total_earning,
          earning_increase: `${(
            ((result[0].total_earning - result[0].previous_earning) /
              result[0].total_earning) *
            100
          ).toFixed(2)}%`,
          upcoming_booking: result[0].upcoming_booking,
          upcoming_bookings_list: result[0].upcoming_bookings_list,
          room_ids: result[0].room_ids,
        };
      })
      .catch((err) => {
        Logger.error(err);
        return "error";
      })
  ).catch((err) => {
    Logger.error(err);
    return "error";
  });
};



const getBookingListByVendorId = (vendorId) => {
  return Promise.resolve(
    Booking.find({ booking_vendor_id: vendorId }).sort({ createdAt: -1 })
      .then((booking) => booking)
      .catch((err) => {
        Logger.error(err);
        return "error";
      })
  ).catch((err) => {
    Logger.error(err);
    return "error";
  });
};

const getBookingListByVendorIdUpcoming = (vendorId) => {
  let currentDate = new Date();
  return Booking.find({ 
      booking_vendor_id: vendorId,
      booking_status: "Success",
      checkIn_date_time: { $gt: currentDate }
    })
    .sort({ createdAt: -1 })
    .then((booking) => {
      return booking;
    })
    .catch((err) => {
      console.error(err);
      return "error";
    });
};

const getBookingListByVendorIdCompleted = (vendorId) => {
  let currentDate = new Date();
  return Booking.find({ 
      booking_vendor_id: vendorId,
      booking_status: "Success",
      checkIn_date_time: { $lte: currentDate }
    })
    .sort({ createdAt: -1 })
    .then((booking) => {
      return booking;
    })
    .catch((err) => {
      console.error(err);
      return "error";
    });
};

const getBookingListByVendorIdCancelled = (vendorId) => {
  return Booking.find({ 
      booking_vendor_id: vendorId,
      booking_status: "Cancelled",
    })
    .sort({ createdAt: -1 })
    .then((booking) => {
      return booking;
    })
    .catch((err) => {
      console.error(err);
      return "error";
    });
};



const getbookingbyuserInfo = (userId) => {
  let currentDate = new Date();

  // let localDate = currentDate
  //   .toLocaleString("en-US", {
  //     timeZone: process.env.LOCAL_TZ,
  //     hour12: false,
  //   })
  // .split(",")[0];
  console.log(currentDate)
  // console.log(localDate)
  return Booking.aggregate([
    {
      $match: {
        booking_user_id: ObjectId(userId),
        //   checkIn_date_time: { $lte: localDate }, // Modified this line
      },
    },
    
    {
      $lookup: {
        from: "roomcategories",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "r",
      }
    },
    {
      $lookup: {
        from: "properties",
        localField: "booking_property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $unwind: "$r"
    },
    {
      $unwind: "$p"
    },

    {
      $facet: {
        cancelled_booking: [
          {
            $match: {
              booking_status: "Cancelled",
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: {

              booking_user_id: "$booking_user_id",
              booking_vendor_id: "$booking_vendor_id",
              booking_property_id: "$booking_property_id",
              booking_room_id: "$booking_room_id",
              booking_type: "$booking_type",
              booking_status: "$booking_status",
              payment_status: "$payment_status",
              booking_amount: "$booking_amount",
              no_of_adult: "$no_of_adult",
              no_of_child: "$no_of_child",
              no_of_bigchild: "$no_of_bigchild",
              vendor_payble: "$vendor_payble",
              commission: "$commission",

              total_guest: "$total_guest",
              total_room: "$total_room",
              checkIn_date_time: "$checkIn_date_time",
              checkOut_date_time: "$checkOut_date_time",
              property_name: "$p.property_basic_info.property_name",
              category_naME: "$r.category_basic_info.name",
              property_locality: "$r.property_location",
              bookingtime: "$createdAt",
            },
          },
        ],
        completed_booking: [
          {
            $match: {
              booking_status: "Success",
              checkIn_date_time: { $lte: currentDate },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: {

              booking_user_id: "$booking_user_id",
              booking_vendor_id: "$booking_vendor_id",
              booking_property_id: "$booking_property_id",
              booking_room_id: "$booking_room_id",
              booking_type: "$booking_type",
              booking_status: "$booking_status",
              payment_status: "$payment_status",
              booking_amount: "$booking_amount",
              no_of_adult: "$no_of_adult",
              no_of_child: "$no_of_child",
              no_of_bigchild: "$no_of_bigchild",
              vendor_payble: "$vendor_payble",
              commission: "$commission",

              total_guest: "$total_guest",
              total_room: "$total_room",
              checkIn_date_time: "$checkIn_date_time",
              checkOut_date_time: "$checkOut_date_time",
              property_name: "$p.property_basic_info.property_name",
              category_naME: "$r.category_basic_info.name",
              property_locality: "$r.property_location",
              bookingtime: "$createdAt",
              property_locality: "$r.property_location",
            },
          },
        ],
        upcoming_booking: [
          {
            $match: {
              booking_status: "Success",
              checkIn_date_time: { $gt: currentDate },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: {

              booking_user_id: "$booking_user_id",
              booking_vendor_id: "$booking_vendor_id",
              booking_property_id: "$booking_property_id",
              booking_room_id: "$booking_room_id",
              booking_type: "$booking_type",
              booking_status: "$booking_status",
              payment_status: "$payment_status",
              booking_amount: "$booking_amount",
              no_of_adult: "$no_of_adult",
              no_of_child: "$no_of_child",
              no_of_bigchild: "$no_of_bigchild",
              vendor_payble: "$vendor_payble",
              commission: "$commission",

              total_guest: "$total_guest",
              total_room: "$total_room",
              checkIn_date_time: "$checkIn_date_time",
              checkOut_date_time: "$checkOut_date_time",
              property_name: "$p.property_basic_info.property_name",
              category_naME: "$r.category_basic_info.name",
              property_locality: "$r.property_location",
              bookingtime: "$createdAt",
              property_locality: "$r.property_location",
            },
          },
        ],
      },
    },
    {
      $project: {
        cancelled_booking: "$cancelled_booking",
        completed_booking: "$completed_booking",
        upcoming_booking: "$upcoming_booking",

      },
    },
  ])
    .then((result) => {
      return {
        cancelled_booking: result[0].cancelled_booking,
        completed_booking: result[0].completed_booking,
        upcoming_booking: result[0].upcoming_booking,


      };
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

// const getbookingbyuserInfo = (userId) => {
//   let currentDate = new Date();

//   // let localDate = currentDate
//   //   .toLocaleString("en-US", {
//   //     timeZone: process.env.LOCAL_TZ,
//   //     hour12: false,
//   //   })
//     // .split(",")[0];
//   console.log(currentDate)
//   // console.log(localDate)
//   return Booking.aggregate([
//     {
//       $match: {
//         booking_user_id: ObjectId(userId),
//         //   checkIn_date_time: { $lte: localDate }, // Modified this line
//       },
//     },
//     {
//       $sort: { checkIn_date_time: 1 },
//     },
//     {
//       $lookup:{
//         from: "roomcategories",
//         localField: "booking_room_id",
//         foreignField: "_id",
//         as: "r.property_location",
//       }
//     },
//     {
//       $facet: {
//         cancelled_booking: [
//           {
//             $match: {
//               booking_status: "Cancelled",
//             },
//           },
//         ],
//         completed_booking: [
//           {
//             $match: {
//               booking_status: "Success",
//               checkIn_date_time: { $lte: currentDate },
//             },
//           },
//         ],
//         upcoming_booking: [
//           {
//             $match: {
//               booking_status: "Success",
//               checkIn_date_time: { $gt: currentDate },
//             },
//           },
//         ],
//       },
//     },
//     {
//       $project: {
//         cancelled_booking: "$cancelled_booking",
//         completed_booking: "$completed_booking",
//         upcoming_booking: "$upcoming_booking",
//       },
//     },
//   ])
//     .then((result) => {
//       return {
//         cancelled_booking: result[0].cancelled_booking,
//         completed_booking: result[0].completed_booking,
//         upcoming_booking: result[0].upcoming_booking,
//       };
//     })
//     .catch((err) => {
//       Logger.error(err);
//       return "error";
//     });
// };


const doBooking = (
  bookingPropertyId,
  bookingRoomId,
  vendorId,
  bookingUserId,
  bookingFullName,
  bookingAddress,
  bookingCountry,
  bookingEmail,
  bookingPhoneNo,
  bookingAmount,
  bookingStatus,
  bookingType,
  checkInDateTime,
  checkOutDateTime,
  orderId,
  paymentStatus,
  group_adult,
  total_guest,
  total_group_num,
  group_child,
  total_room_price,
  tax_fees,
  coupon_discount,
  booking_full_name,
) => {
  return Promise.resolve(
    Room.findOne({ _id: bookingRoomId }, "room_status")
      .then((room) => {
        if (room.room_status !== "Blocked") {
          return Booking.find(
            {
              booking_room_id: bookingRoomId,
              booking_status: { $in: ["Scheduled", "Ongoing"] },
            },
            "checkIn_date_time checkOut_date_time"
          ).then((result) => {
            if (result.length != 0) {
              for (const {
                checkIn_date_time,
                checkOut_date_time,
              } of result) {
                if (
                  isBetween(
                    checkInDateTime,
                    checkOutDateTime,
                    checkIn_date_time,
                    checkOut_date_time
                  )
                ) {
                  return "Room already booked for given date";
                }
              }
            }
            if (bookingType == "Online") {
              paymentStatus = "Success";
            }
            return new Booking({
              booking_property_id: bookingPropertyId,
              booking_room_id: bookingRoomId,
              booking_vendor_id: vendorId,
              booking_user_id: bookingUserId,
              booking_full_name: bookingFullName,
              booking_country: bookingCountry,
              booking_address: bookingAddress,
              booking_email: bookingEmail,
              booking_phone_no: bookingPhoneNo,
              booking_amount: bookingAmount,
              booking_type: bookingType,
              booking_status: bookingStatus,
              checkIn_date_time: checkInDateTime,
              checkOut_date_time: checkOutDateTime,
              order_id: orderId,
              payment_status: paymentStatus,
              group_adult: group_adult,
              total_group_num: total_group_num,
              group_adult: group_adult,
              total_guest: total_guest,
              group_child: group_child,
              total_room_price: total_room_price,
              tax_fees: tax_fees,
              coupon_discount: coupon_discount,
              booking_full_name: booking_full_name,
              vendor_payble: vendor_payble,
              commission: commission,
            })
              .save()
              .then((result) => {
                if (!result) {
                  return "error";
                }
                Counter.updateOne(
                  { counter_type: "Admin" },
                  { $inc: { booking_today: 1 } },
                  { upsert: true }
                );
                return "success";
              })
              .catch((err) => {
                Logger.error(err);
                return "error";
              });
          });
        } else {
          return "Room is blocked";
        }
      })
      .catch((err) => {
        Logger.error(err);
        return "error";
      })
  ).catch((err) => {
    Logger.error(err);
    return "error";
  });
};

const getBookingInfoByBookingId = (bookingId) => {
  return Promise.resolve(Booking.findOne({ _id: bookingId }))
    .then((result) => result)
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

const getbookingbybook = async (_id) => {
  return await Booking.aggregate([
    {
      $match: {
        _id: new ObjectId(_id),
        // booking_property_id: new ObjectId(propertyId),
      },
    },
    {
      $lookup: {
        from: "properties",
        localField: "booking_property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "booking_user_id",
        foreignField: "_id",
        as: "c",
      },
    },
    {
      $lookup: {
        from: "roomcategories",
        localField: "booking_room_id",
        foreignField: "_id",
        as: "r",
      },
    },
    {
      $lookup: {
        from: "categoryimages",
        localField: "booking_room_id",
        foreignField: "category_id",
        as: "pi",
      },
    },
    {
      $unwind: "$p",
    },
    {
      $unwind: "$r",
    },
    {
      $unwind: "$c",
    },

    {
      $project: {
        booking_user_id: "$booking_user_id",
        booking_vendor_id: "$booking_vendor_id",
        booking_property_id: "$booking_property_id",
        booking_room_id: "$booking_room_id",
        booking_type: "$booking_type",
        booking_status: "$booking_status",
        payment_status: "$payment_status",
        booking_amount: "$booking_amount",
        no_of_adult: "$no_of_adult",
        no_of_child: "$no_of_child",
        no_of_bigchild: "$no_of_bigchild", 
        vendor_payble: "$vendor_payble",
        commission: "$commission",

        total_guest: "$total_guest",
        total_room: "$total_room",
        checkIn_date_time: "$checkIn_date_time",
        checkOut_date_time: "$checkOut_date_time",
        property_name: "$p.property_basic_info",
        property_locality: "$p.property_location",
        property_policy: "$p.property_policies",
        custumer: "$c",
        roomcatname: "$r.category_basic_info.name",
        roomcatname: "$r.category_basic_info.name",
        bookingtime: "$createdAt",
        group_adult: "$group_adult",
        total_room: "$total_room",
        total_group_num: "total_group_num",
        total_guest: "$total_guest",
        group_child: "$group_child",
        total_room_price: "$total_room_price",
        tax_fees: "$tax_fees",
        coupon_discount: "$coupon_discount",
        booking_full_name: "$booking_full_name",
        images: {
          $concatArrays: [
            {
              $ifNull: ["$pi.file_paths.path", []],
            },
          ],
        },
      },
    },
  ]);
};


// const getbookingbybook = async ( 
//     _id) => {
//     return await Booking.aggregate([

//         {
//             $match: {

//                 _id: new ObjectId(_id),
//                 // booking_property_id: new ObjectId(propertyId),
//             },
//         },
//         {

//             $lookup: {
//               from: "properties",
//               localField: "booking_property_id",
//               foreignField: "_id",
//               as: "p",
//               },

//         },
//         {

//             $lookup: {
//               from: "customers",
//               localField: "booking_user_id",
//               foreignField: "_id",
//               as: "c",
//               },

//         },
//         {

//             $lookup: {
//               from: "roomcategories",
//               localField: "booking_room_id",
//               foreignField: "_id",
//               as: "r",
//               },

//         },
//         {
//             $unwind: "$p"
//           },
//           {
//             $unwind: "$r"
//           },
//           {
//             $unwind: "$c"
//           },

//       {
//         $project: {
//             booking_user_id:  "$booking_user_id",
//             booking_vendor_id: "$booking_vendor_id", 
//             booking_property_id: "$booking_property_id", 
//             booking_room_id: "$booking_room_id",
//             booking_type:  "$booking_type",
//             booking_status: "$booking_status", 
//             payment_status: "$payment_status", 
//             booking_amount: "$booking_amount",
//             no_of_adult:"$no_of_adult",
//             no_of_child:"$no_of_child",
//             no_of_bigchild:"$no_of_bigchild",
//             total_guest:"$total_guest",
//             total_room:"$total_room",
//             checkIn_date_time: "$checkIn_date_time",
//             checkOut_date_time: "$checkOut_date_time",
//             property_name: "$p.property_basic_info",
//             property_locality: "$p.property_location",
//             property_policy: "$p.property_policies",
//             custumer: "$c",
//             roomcatname:"$r.category_basic_info.name",
//             roomcatname:"$r.category_basic_info.name",
//             bookingtime:"$createdAt"


//         },
//       },
//     ]);
//   };

module.exports = {
  getBookingInfoByBookingId,
  doBooking,
  getBookingListByVendorId,
  getBookingListByVendorIdUpcoming,
  getBookingListByVendorIdCompleted,
  getBookingListByVendorIdCancelled,
  getDashboardInfo,
  getBookingList,
  getBookingListFilter,
  getVendorSettlement,
  insertBookingNew,
  getbookingbyuserInfo,
  getbookingbybook,
};