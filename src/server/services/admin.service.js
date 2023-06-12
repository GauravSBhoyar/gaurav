const Guestreview = require("../models/userreview.model");

const { ObjectID } = require("mongodb"),
  aws = require("aws-sdk"),
  Logger = require("../utilities/logger"),
  {
    Booking,
    Activity,
    Review,
    Commission,
    Blog,
    Pricing,
    Counter,
    RoomCategory,
  } = require("../models"),
  updateFeatured = async (params, data) => {
    return Pricing.updateOne(
      { _id: params.id },
      { pricing_is_featured: data.is_featured }
    ).then((result) => {
      if (!result.modifiedCount) {
        return "ERR";
      }
      return result.modifiedCount;
    });
  },

  getFeaturedList = async (pageNo, searchText) => {
    if (!searchText) {
      searchText = null;
    } else {
      searchText = new RegExp(searchText.toLowerCase());
    }
    return RoomCategory.aggregate([
      {
        $match: {
          added_to_featured: true,
        },
      },
      {
        $lookup: {
          from: "properties",
          localField: "property_id",
          foreignField: "_id",
          as: "p",
        },
      },
      // {
      //   $set: {
      //     full_string: {
      //       $toLower: {
      //         $concat: [
      //           {
      //             $ifNull: [
      //               {
      //                 $toString: {
      //                   $arrayElemAt: [
      //                     "$p.property_basic_info.property_name",
      //                     0,
      //                   ],
      //                 },
      //               },
      //               "",
      //             ],
      //           },
                
               
      //         ],
      //       },
      //     },
      //   },
      // },
      // {
      //   $match: {
      //     $expr: {
      //       $cond: [
      //         { $eq: [searchText, null] },
      //         true,
      //         {
      //           $regexFind: {
      //             input: "$full_string",
      //             regex: searchText,
      //           },
      //         },
      //       ],
      //     },
      //   },
      // },
      {
        $project: {
          property_name: {
            $arrayElemAt: ["$p.property_basic_info.property_name", 0],
          },
          category_name: "$category_basic_info.name",
          price:"$category_base_pricing"
          // room_type: "$pricing_room_type",
          // pricing: "$individual.weekdays.room_base_price",
          // is_featured: "$pricing_is_featured",
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
          metatdata: result[0].metadata[0],
          data: result[0].data,
        };
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  },
  
  // getFeaturedList = async (pageNo, searchText) => {
  //   if (!searchText) {
  //     searchText = null;
  //   } else {
  //     searchText = new RegExp(searchText.toLowerCase());
  //   }
  //   return RoomCategory.aggregate([
  //     {
  //       $match: {
  //         added_to_featured: true,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "properties",
  //         localField: "property_id",
  //         foreignField: "_id",
  //         as: "p",
  //       },
  //     },
  //     // {
  //     //   $set: {
  //     //     full_string: {
  //     //       $toLower: {
  //     //         $concat: [
  //     //           {
  //     //             $ifNull: [
  //     //               {
  //     //                 $toString: {
  //     //                   $arrayElemAt: [
  //     //                     "$p.property_basic_info.property_name",
  //     //                     0,
  //     //                   ],
  //     //                 },
  //     //               },
  //     //               "",
  //     //             ],
  //     //           },
                
               
  //     //         ],
  //     //       },
  //     //     },
  //     //   },
  //     // },
  //     // {
  //     //   $match: {
  //     //     $expr: {
  //     //       $cond: [
  //     //         { $eq: [searchText, null] },
  //     //         true,
  //     //         {
  //     //           $regexFind: {
  //     //             input: "$full_string",
  //     //             regex: searchText,
  //     //           },
  //     //         },
  //     //       ],
  //     //     },
  //     //   },
  //     // },
  //     {
  //       $project: {
  //         property_name: {
  //           $arrayElemAt: ["$p.property_basic_info.property_name", 0],
  //         },
  //         category_name: "$category_basic_info.name",
  //         price:"$category_base_pricing"
  //         // room_type: "$pricing_room_type",
  //         // pricing: "$individual.weekdays.room_base_price",
  //         // is_featured: "$pricing_is_featured",
  //       },
  //     },
  //     {
  //       $facet: {
  //         metadata: [
  //           { $count: "total" },
  //           { $addFields: { page: parseInt(pageNo) } },
  //         ],
  //         data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
  //       },
  //     },
  //   ])
  //     .then((result) => {
  //       return {
  //         metatdata: result[0].metadata[0],
  //         data: result[0].data,
  //       };
  //     })
  //     .catch((err) => {
  //       Logger.error(err);
  //       return "ERR";
  //     });
  // },

  // getFeaturedList = async (pageNo, searchText) => {
  //   if (!searchText) {
  //     searchText = null;
  //   } else {
  //     searchText = new RegExp(searchText.toLowerCase());
  //   }
  //   return Pricing.aggregate([
  //     {
  //       $match: {
  //         added_to_featured: true,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "properties",
  //         localField: "pricing_property_id",
  //         foreignField: "_id",
  //         as: "p",
  //       },
  //     },
  //     {
  //       $set: {
  //         full_string: {
  //           $toLower: {
  //             $concat: [
  //               {
  //                 $ifNull: [
  //                   {
  //                     $toString: {
  //                       $arrayElemAt: [
  //                         "$p.property_basic_info.property_name",
  //                         0,
  //                       ],
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //               {
  //                 $ifNull: [
  //                   {
  //                     $toString: "$individual.weekdays.room_base_price",
  //                   },
  //                   "",
  //                 ],
  //               },
  //               {
  //                 $ifNull: [{ $toString: "$pricing_room_type" }, ""],
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $cond: [
  //             { $eq: [searchText, null] },
  //             true,
  //             {
  //               $regexFind: {
  //                 input: "$full_string",
  //                 regex: searchText,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         property_name: {
  //           $arrayElemAt: ["$p.property_basic_info.property_name", 0],
  //         },
  //         room_type: "$pricing_room_type",
  //         pricing: "$individual.weekdays.room_base_price",
  //         is_featured: "$pricing_is_featured",
  //       },
  //     },
  //     {
  //       $facet: {
  //         metadata: [
  //           { $count: "total" },
  //           { $addFields: { page: parseInt(pageNo) } },
  //         ],
  //         data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
  //       },
  //     },
  //   ])
  //     .then((result) => {
  //       return {
  //         metatdata: result[0].metadata[0],
  //         data: result[0].data,
  //       };
  //     })
  //     .catch((err) => {
  //       Logger.error(err);
  //       return "ERR";
  //     });
  // },
 
  getAdminDashboardInfo = async () => {
    const isoDate = new Date();
    const year = isoDate.getFullYear();
    const month = isoDate.getMonth() + 1;
    const day = isoDate.getDate();
  
    // Current date
    const currentDate =
      year +
      "-" +
      (month.toString().length === 1 ? "0" + month : month) +
      "-" +
      (day.toString().length === 1 ? "0" + day : day);
      console.log(currentDate)
  
    // First day of current month
    const firstDayOfCurrentMonth = `${year}-${(month.toString().length === 1 ? "0" + month : month)}-01`;
  
    // Last day of previous month
    const lastDayOfPreviousMonth = new Date(year, month - 1, 0);
    const lastDayOfPreviousMonthFormatted = `${lastDayOfPreviousMonth.getFullYear()}-${(lastDayOfPreviousMonth.getMonth() + 1).toString().padStart(2, '0')}-${lastDayOfPreviousMonth.getDate().toString().padStart(2, '0')}`;
  
    // End date (current date - 1 day)
    const endDate = new Date(year, month - 1, day - 1);
    const endDateFormatted = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
  
    try {
      // Update counter with today's check-ins and check-ins from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const checkInsToday = await Booking.countDocuments({ checkIn_date_time: { $gte: new Date(currentDate), $lte: new Date() } });
      const checkInsThirtyDays = await Booking.countDocuments({ checkIn_date_time: { $gte: thirtyDaysAgo, $lte: new Date() } });
      const bookingsToday = await Booking.find({ createdAt: { $gte: new Date(currentDate), $lte: new Date() } }).select('booking_amount');
      const bookingsPrevious = await Booking.find({ createdAt: { $gte: thirtyDaysAgo, $lte: new Date() } }).select('booking_amount');
  
      let amountToday = 0;
      let amountPrevious = 0;
  
      bookingsToday.forEach((booking) => {
        amountToday += parseInt(booking.booking_amount);
      });
  
      bookingsPrevious.forEach((booking) => {
        amountPrevious += parseInt(booking.booking_amount);
      });
  
      
      const counter = await Counter.findOneAndUpdate({}, {
        check_ins_today: checkInsToday,
        check_ins_previous: checkInsThirtyDays,
        amount_today: amountToday,
        amount_previous: amountPrevious
        // amount_today: bookingsToday.reduce((acc, cur) => acc + cur.booking_amount, 0),
        // amount_previous: bookingsPrevious.reduce((acc, cur) => acc + cur.booking_amount, 0)
      }, { new: true });
  
      // Get latest 10 bookings
      const latestTenBookings = await Booking.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        // {
        //   $lookup: {
        //     from: "properties",
        //     localField: "booking_property_id",
        //     foreignField: "_id",
        //     as: "p",
        //   },
        // },
        // {
        //   $project: {
        //     booking_name: "$p.property_basic_info.property_name",
        //     booking_location: {
        //       $concat: ["$p.property_location.property_address", ", ","$p.property_location.property_city",  ", ","$p.property_location.property_country"],
        //     },
        //     checkIn_date_time: "$checkIn_date_time",
        //     booking_amount: "$booking_amount",
        //   },
        // },
      ]);

      const latestBestSellers = await Guestreview.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $match: { rating: 5 } },
      ]);
  
      // Get data for today and this month
      const todaysData = {
        check_ins: counter.check_ins_today,
        bookings: counter.booking_today,
        amount: counter.amount_today,
        revenue: counter.revenue_today,
        visits: counter.visits_today,
        settlement_checkouts: counter.settlement_checkouts_today,
      };
  
      const monthlyData = {
        check_ins: counter.check_ins_previous,
        bookings: counter.booking_monthly,
        amount: counter.amount_previous,
        revenue: counter.revenue_monthly,
        visits: counter.visits_monthly,
        settlement_checkouts: counter.settlement_checkouts_monthly,
      };

      const aggregationResult = await Review.aggregate([
        {
          $facet: {
            best_sellers: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(firstDayOfCurrentMonth),
                    $lte: new Date(endDate),
                  },
                },
              },
              {
                $group: {
                  _id: "$product_id",
                  count: { $sum: "$quantity" },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  _id: 0,
                  product_id: "$_id",
                  count: 1,
                  name: { $arrayElemAt: ["$product.name", 0] },
                //   image_url: { $arrayElemAt: ["$product.image_url", 0] },
                },
              },
            ],
          },
        },
      ]);

      const bestSellers = aggregationResult[0].best_sellers;

      return {
        todays_data: todaysData,
        monthly_data: monthlyData,
        latest_ten_bookings: latestTenBookings,
        best_sellers: bestSellers,
        latest_best_sellers: latestBestSellers,
      };
    } catch (err) {
      Logger.error(err);
      return "ERR";
    }
  };

(getAdminTodoList = async () => {
  return await Activity.aggregate([
    {
      $match: {
        activity_category: { $ne: null },
      },
    },
    {
      $sort: { createdAt: -1, _id: 1 },
    },
    // {
    //   $group: {
    //     _id: "$activity_category",
    //     activity_category: { $first: "$activity_category" },
    //     activities: {
    //       $push: "$$ROOT",
    //     },
    //   },
    // },
    // {
    //   $sort: { createdAt: -1, _id: 1 },
    // },
  ])
    .then((result) => result)
    .catch((err) => {
      Logger.error(err);
      return "ERR";
    });
}),
  (insertAdminTodo = async (data) => {
    return await new Activity(data)
      .save()
      .then((result) => {
        if (!result) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (updateAdminTodo = async (data) => {
    return await Activity.updateOne({ _id: data._id }, data)
      .then((result) => {
        if (!result.modifiedCount) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (deleteAdminTodo = async (id) => {
    return await Activity.deleteOne({ _id: id })
      .then((result) => {
        if (!result.deletedCount) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (getPricingAndTaxCommission = async () => {
    return await Commission.findOne({})
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (createPricingAndTaxCommission = async (data) => {
    try {
      let result;
      if (Object.keys(data)[0] == "tax") {
        result = await Commission.updateOne(
          { access_type: "Admin" },
          { $push: { tax: data.tax } },
          { upsert: true }
        );
      } else {
        result = await Commission.updateOne(
          { access_type: "Admin" },
          { $push: { pricing: data.pricing } },
          { upsert: true }
        );
      }
      if (!result.modifiedCount && !result.upserted[0]._id) {
        return "ERR";
      }
      return result;
    } catch (err) {
      Logger.error(err);
      return "ERR";
    }
  }),
  (updatePricingAndTaxCommission = async (data) => {
    try {
      let result;
      if (Object.keys(data)[0] == "tax") {
        result = await Commission.updateOne(
          { access_type: "Admin" },
          { $pull: { tax: { _id: ObjectID(data.tax._id) } } }
        );
        result = await Commission.updateOne(
          { access_type: "Admin" },
          {
            $push: { tax: data.tax },
          }
        );
      } else {
        result = await Commission.updateOne(
          { access_type: "Admin" },
          { $pull: { pricing: { _id: ObjectID(data.pricing._id) } } }
        );
        result = await Commission.updateOne(
          { access_type: "Admin" },
          {
            $push: { pricing: data.pricing },
          }
        );
      }
      if (!result.modifiedCount && !result.upserted[0]._id) {
        return "ERR";
      }
      return result;
    } catch (err) {
      Logger.error(err);
      return "ERR";
    }
  }),
  (deletePricingAndTaxCommission = async (commissionId) => {
    return await Commission.updateOne(
      { access_type: "Admin" },
      {
        $pull: {
          pricing: { _id: ObjectID(commissionId) },
          tax: { _id: ObjectID(commissionId) },
        },
      }
    )
      .then((result) => {
        if (!result.modifiedCount) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (insertBlog = async (data) => {
    return await new Blog(data)
      .save()
      .then((result) => {
        if (!result) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),

  (getBlog = async () => {
    let s3 = new aws.S3();
    return await Blog.find()
      .then((result) => {
        return Promise.all(
          result.map(async (v, i, a) => {
            let x = Object.assign({}, v._doc);
            if (x.blog_image_id) {
              let imageBody = await s3
                .getObject({
                  Bucket: process.env.AWS_BUCKET,
                  Key: x.blog_image_id,
                })
                .promise();
              if (imageBody) {
                x.property_image = imageBody.Body;
              }
            }
            delete x.blog_image_id;
            return x;
          })
        );
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),

  // (getBlog = async () => {
  //   let s3 = new aws.S3();
  //   return await Blog.find()
  //     .then((result) => {
  //       return Promise.all(
  //         result.map(async (v, i, a) => {
  //           let x = Object.assign({}, v._doc);
  //           if (x.blog_image_id) {
  //             let imageBody = await s3
  //               .getObject({
  //                 Bucket: process.env.AWS_BUCKET,
  //                 Key: x.blog_image_id,
  //               })
  //               .promise();
  //             if (imageBody) {
  //               x.property_image = imageBody.Body;
  //             }
  //           }
  //           delete x.blog_image_id;
  //           return x;
  //         })
  //       );
  //     })
  //     .catch((err) => {
  //       Logger.error(err);
  //       return "ERR";
  //     });
  // }),
  (updateBlog = async (data) => {
    return await Blog.updateOne({ _id: data._id }, data)
      .then((result) => {
        if (!result.modifiedCount) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  }),
  (deleteBlog = async (id) => {
    return await Blog.deleteOne({ _id: id })
      .then((result) => {
        if (!result.deletedCount) {
          return "ERR";
        }
        return result;
      })
      .catch((err) => {
        Logger.error(err);
        return "ERR";
      });
  });

  

module.exports = {
  createPricingAndTaxCommission,
  updateFeatured,
  getFeaturedList,
  getAdminDashboardInfo,
  getAdminTodoList,
  insertAdminTodo,
  updateAdminTodo,
  deleteAdminTodo,
  getPricingAndTaxCommission,
  updatePricingAndTaxCommission,
  deletePricingAndTaxCommission,
  insertBlog,
  getBlog,
  updateBlog,
  deleteBlog,
};

