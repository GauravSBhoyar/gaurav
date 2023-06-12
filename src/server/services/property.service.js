const { ObjectID } = require("mongodb");
const aws = require("aws-sdk");
const {
  User,
  Property,
  Room,
  Review,
  Activity,
  PropertyImage,
  RoomCategory,
} = require("../models");
const Logger = require("../utilities/logger");
const { filter } = require("compression");

const getLocation = async (filters, user) => {
  return await Property.aggregate([
    {
      $set: {
        full_string: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: "$property_basic_info.property_name",
                  },
                  "",
                ],
              },
              " ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_locality",
                  },
                  "",
                ],
              },
              " ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_address",
                  },
                  "",
                ],
              },
              " ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_city",
                  },
                  "",
                ],
              },
              " ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_state",
                  },
                  "",
                ],
              },
              " ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_zip_code",
                  },
                  "",
                ],
              },
            ],
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $regexFind: {
            input: "$full_string",
            regex: { $toLower: filters.place },
          },
        },
      },
    },
    {
      $project: {
        property_name: "$property_basic_info.property_name",
        property_locality: "$property_location.property_locality",
        property_address: "$property_location.property_address",
        property_city: "$property_location.property_city",
        property_state: "$property_location.property_state",
        property_country: "$property_location.property_country",
        property_zip_code: "$property_location.property_zip_code",
        property_coordinates: "$property_location.property_coordinates",
      },
    },
  ]);
};

const getPropertyForUserWithFilters = async (filters, user) => {
  // place, checkinDate, checkOutDate, Guests, Night, max Night Price, Service(King Beds,Welcome Drink,Bike Rental, Private Bathroom.Swimming Pool, No Smoking, Television), Extra services(Hiking Snorkelling, Rafting, Balloon air, Camping, Luxury), Star rating, Free cancellation
  //try {
    console.log(filters, "filters find resort")
  let sort;
  switch (filters.sort) {
    case "Top Rated":
      sort = {
        "property_basic_info.property_star_rating": -1,
        property_review_average: -1,
      };
      break;
    default:
      sort = {
        "property_basic_info.property_star_rating": -1,
        property_review_average: -1,
      };
      break;
  }

  return await Property.aggregate([
    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [filters.cancellation_policy, null] },
            true,
            {
              $regexFind: {
                input: "$property_policies.cancellation_policy",
                regex: filters.cancellation_policy,
              },
            },
          ],
        },
        $expr: {
          $cond: [
            { $eq: [filters.star_rating, null] },
            true,
            {
              $eq: [
                "$property_basic_info.property_star_rating",
                Number(filters.star_rating),
              ],
            },
          ],
        },
      },
    },
    {
      $set: {
        place: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: "$property_basic_info.property_name",
                  },
                  "",
                ],
              },
              ", ",
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_city",
                  },
                  "",
                ],
              },
            ],
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [filters.place, null] },
            true,
            {
              $regexFind: {
                input: "$place",
                regex: { $toLower: filters.place },
              },
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "roomcategories",
        let: { property_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$property_id", "$$property_id"],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              per_room_occupancy: {
                $sum: [
                  "$category_base_pricing.base_occupancy",
                  "$category_base_pricing.extra_adult",
                  "$category_base_pricing.extra_child",
                ],
              },
            },
          },
          {
            $match: {
              $expr: {
                $lte: [
                  "$category_base_pricing.base_price",
                  Number(filters.max_price),
                ],
              },
            },
          },
          // {
          //   $match: {
          //     $expr: {
          //       $gte: ["$total_room_occupancy", +filters.no_of_guests],
          //     },
          //   },
          // },
          {
            $lookup: {
              from: "rooms",
              let: {
                category_id: "$_id",
                per_room_occupancy: "$per_room_occupancy",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$category_id", "$$category_id"],
                        },
                      ],
                    },
                  },
                },
                {
                  $addFields: {
                    total_room_occupancy: {
                      $toInt: ["$$per_room_occupancy"],
                    },
                  },
                },
              ],
              as: "r",
            },
          },
          {
            $lookup: {
              from: "bookings",
              localField: "r._id",
              foreignField: "booking_room_id",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $and: [
                            {
                              $lte: [
                                "$checkIn_date_time",
                                filters.checkin_date,
                              ],
                            },
                            {
                              $gte: [
                                "$checkOut_date_time",
                                filters.checkin_date,
                              ],
                            },
                          ],
                        },
                        {
                          $and: [
                            {
                              $lte: [
                                "$checkIn_date_time",
                                filters.checkout_date,
                              ],
                            },
                            {
                              $gte: [
                                "$checkOut_date_time",
                                filters.checkout_date,
                              ],
                            },
                          ],
                        },
                        {
                          $and: [
                            {
                              $gt: ["$checkIn_date_time", filters.checkin_date],
                            },
                            {
                              $lt: [
                                "$checkOut_date_time",
                                filters.checkout_date,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "b",
            },
          },
          {
            $set: {
              r: {
                $filter: {
                  input: "$r",
                  as: "r",
                  cond: {
                    $not: {
                      $in: ["$$r._id", "$b.booking_room_id"],
                    },
                  },
                },
              },
            },
          },
        ],
        as: "rc",
      },
    },
    {
      $set: {
        total_property_occupancy: {
          $reduce: {
            input: "$rc.r",
            initialValue: 0,
            in: { $sum: "$$this.total_room_occupancy" },
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $gte: ["$total_property_occupancy", Number(filters.no_of_guests)],
        },
      },
    },
    /* {
            $lookup: {
                from: "activities",
                localField: "_id",
                foreignField: "activity_property_id",
                as: "a",
            },
        },
        {
            $addFields: {
                property_review_average: {
                    $divide: [
                        "$property_review_sum",
                        "$property_review_count",
                    ],
                },
            },
        },
        {
            $sort: sort,
        }, */
    {
      $project: {
        vendor_id: "$vendor_id",
        property_name: "$property_basic_info.property_name",
        property_star_rating: "$property_basic_info.property_star_rating",
        property_review_average: "$property_review_average",
        property_locality: "$property_location.property_locality",
        property_address: "$property_location.property_address",
        property_city: "$property_location.property_city",
        property_state: "$property_location.property_state",
        property_country: "$property_location.property_country",
        property_zip_code: "$property_location.property_zip_code",
        property_coordinates: "$property_location.property_coordinates",
        services: {
          $concatArrays: [
            {
              $ifNull: ["$property_amenities.basic_facilities", []],
            },
            {
              $ifNull: ["$property_amenities.general_services", []],
            },
            {
              $ifNull: ["$property_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$property_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$property_amenities.common_area", []],
            },
            { $ifNull: ["$property_amenities.food_drink", []] },
            {
              $ifNull: ["$property_amenities.health_wellness", []],
            },
            {
              $ifNull: ["$property_amenities.business_center_conference", []],
            },
            { $ifNull: ["$property_amenities.beauty_spa", []] },
            { $ifNull: ["$property_amenities.security", []] },
          ],
        },
        //extra_services: "$a",
        property_policies: "$property_policies",
        property_rules: "$property_rules",
        room_categories: "$rc",
      },
    },
  ]); /* .then(async (properties) => {
            for (let property of properties) {
                property.images = await getPropertyImages(property.vendor_id);
            }
            return properties;
        }); */
  /* } catch (err) {
        Logger.error(err);
        return null;
    } */
};

const getMostPopularProperty = async (filters, user) => {
  // get most popular property api
  return await RoomCategory.aggregate([
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
    {
      $lookup: {
        from: "categoryimages",
        localField: "_id",
        foreignField: "category_id",
        as: "pi",
      },
    },
    {
      $unwind: "$p",
    },
    {
      $project: {
        property_id: "$p._id",
        vendor_id: "$p.vendor_id",
        category_basic_info: "$category_basic_info",
        category_base_pricing: "$category_base_pricing",
        category_availability: "$category_availability",
        category_amenities: "$category_amenities",
        category_group_booking: "$category_group_booking",
        property_location: "$property_location",
        category_extra_bed: "$category_extra_bed",

        property_name: "$p.property_basic_info.property_name",
        // categories_detail: "$p.property_policies",
        property_policy: "$p",
        // property_rules: "$p.property_rules",
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

// const getMostPopularProperty = async (filters, user) => {
//   // get most popular property api
//   return await Property.aggregate([
//     {
//       $set: {
//         place: {
//           $toLower: {
//             $concat: [
//               {
//                 $ifNull: [
//                   {
//                     $toString: "$property_basic_info.property_name",
//                   },
//                   "",
//                 ],
//               },
//               ", ",
//               {
//                 $ifNull: [
//                   {
//                     $toString: "$property_location.property_city",
//                   },
//                   "",
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "roomcategories",
//         let: { property_id: "$_id" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   {
//                     $eq: ["$property_id", "$$property_id"],
//                   },
//                 ],
//               },
//             },
//           },
//           {
//             $addFields: {
//               per_room_occupancy: {
//                 $sum: [
//                   "$category_base_pricing.base_occupancy",
//                   "$category_base_pricing.extra_adult",
//                   "$category_base_pricing.extra_child",
//                 ],
//               },
//             },
//           },
//           {
//             $lookup: {
//               from: "rooms",
//               let: {
//                 category_id: "$_id",
//                 per_room_occupancy: "$per_room_occupancy",
//               },
//               pipeline: [
//                 {
//                   $match: {
//                     $expr: {
//                       $and: [
//                         {
//                           $eq: ["$category_id", "$$category_id"],
//                         },
//                       ],
//                     },
//                   },
//                 },
//                 {
//                   $addFields: {
//                     total_room_occupancy: {
//                       $toInt: ["$$per_room_occupancy"],
//                     },
//                   },
//                 },
//               ],
//               as: "r",
//             },
//           },
//           {
//             $lookup: {
//               from: "bookings",
//               localField: "r._id",
//               foreignField: "booking_room_id",
//               as: "b",
//             },
//           },
//           {
//             $set: {
//               r: {
//                 $filter: {
//                   input: "$r",
//                   as: "r",
//                   cond: {
//                     $not: {
//                       $in: ["$$r._id", "$b.booking_room_id"],
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         ],
//         as: "rc",
//       },
//     },
//     {
//       $set: {
//         total_property_occupancy: {
//           $reduce: {
//             input: "$rc.r",
//             initialValue: 0,
//             in: { $sum: "$$this.total_room_occupancy" },
//           },
//         },
//       },
//     },
//     {
//       $match: {
//         $expr: {
//           $gte: ["$total_property_occupancy", Number(filters.no_of_guests)],
//         },
//       },
//     },
//     {
//       $project: {
//         vendor_id: "$vendor_id",
//         property_name: "$property_basic_info.property_name",
//         property_star_rating: "$property_basic_info.property_star_rating",
//         property_review_average: "$property_review_average",
//         property_locality: "$property_location.property_locality",
//         property_address: "$property_location.property_address",
//         property_city: "$property_location.property_city",
//         property_state: "$property_location.property_state",
//         property_country: "$property_location.property_country",
//         property_zip_code: "$property_location.property_zip_code",
//         property_coordinates: "$property_location.property_coordinates",
//         services: {
//           $concatArrays: [
//             {
//               $ifNull: ["$property_amenities.basic_facilities", []],
//             },
//             {
//               $ifNull: ["$property_amenities.general_services", []],
//             },
//             {
//               $ifNull: ["$property_amenities.outdoor_activities_sports", []],
//             },
//             {
//               $ifNull: ["$property_amenities.outdoor_activities_sports", []],
//             },
//             {
//               $ifNull: ["$property_amenities.common_area", []],
//             },
//             { $ifNull: ["$property_amenities.food_drink", []] },
//             {
//               $ifNull: ["$property_amenities.health_wellness", []],
//             },
//             {
//               $ifNull: ["$property_amenities.business_center_conference", []],
//             },
//             { $ifNull: ["$property_amenities.beauty_spa", []] },
//             { $ifNull: ["$property_amenities.security", []] },
//           ],
//         },
//         //extra_services: "$a",
//         property_policies: "$property_policies",
//         property_rules: "$property_rules",
//         room_categories: "$rc",
//       },
//     },
//   ]);
// };

const getPropertyDocs = async (propertyId) => {
  let s3 = new aws.S3();
  let property = await Property.findOne({ _id: propertyId });
  let docIds =
    property.property_finance_legal.registration_details.registration_doc_id;

  let promises = docIds.map(async (docId) => {
    let doc = await s3
      .getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: docId,
      })
      .promise();
    return {
      doc_id: docId,
      doc_file: doc.Body,
      doc_filename: doc.Metadata.filename,
      doc_mimetype: doc.Metadata.filemimetype,
    };
  });

  return Promise.all(promises).then((result) => {
    return result;
  });
};

const getPropertyImages = async (vendorId, propertyId) => {
  let s3 = new aws.S3();
  let propertyImageIds = await PropertyImage.findOne({
    vendor_id: vendorId,
    property_id: propertyId,
  });
  let categories = [];
  let promises = propertyImageIds.file_ids.map(async (imageId) => {
    let image = await s3
      .getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: imageId.file_id,
      })
      .promise();
    return {
      image_category: imageId.file_category,
      image_file: image.Body,
      image_id: imageId._id,
    };
  });

  return Promise.all(promises).then((result) => {
    for (const propertyImage of result) {
      if (
        categories.findIndex(
          (category) => category.image_category === propertyImage.image_category
        ) === -1
      ) {
        categories.push({
          image_category: propertyImage.image_category,
          image_bodies: [],
        });
      }
      categories.findIndex((category) => {
        if (category.image_category === propertyImage.image_category) {
          category.image_bodies.push({
            image_id: propertyImage.image_id,
            image_file: propertyImage.image_file,
          });
        }
      });
    }
    return categories;
  });
};

const insertUpdateVendorActivity = async (data) => {
  let response = "ERR";
  if (data._id) {
    response = await Activity.updateOne(
      { _id: data._id },
      { $set: { ...data } }
    ).catch((err) => {
      Logger.error(err);
      return "ERR";
    });
    response = response.modifiedCount !== 1 ? "UPDERR" : "UPDSUC";
  } else {
    response = await new Activity(data).save().catch((err) => {
      Logger.error(err);
      return "ERR";
    });
    response = !response._id ? "INSERR" : "INSSUC";
  }
  return response;
};

const getActivityImages = (activities) => {
  let s3 = new aws.S3();

  let promises = activities.map(async (activity) => {
    if (!activity.activity_image_id) return activity;
    let image = await s3
      .getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: activity.activity_image_id,
      })
      .promise();
    let activityWithImage = Object.assign({}, activity._doc);
    delete activityWithImage.activity_image_id;
    activityWithImage["activity_image"] = image.Body;
    return activityWithImage;
  });
  return Promise.all(promises).then((activitiesWithImage) => {
    return activitiesWithImage;
  });
};

const getActivityByPropertyId = async (query) => {
  let response = "ERR";
  response = await Activity.find({
    activity_property_id: query.activity_property_id,
  }).sort({createdAt:-1}).catch((err) => {
    Logger.error(err);
    return "ERR";
  });
  // response = await getActivityImages(response).catch((err) => {
  //   Logger.error(err);
  //   return "ERR";
  // });
  return response;
};

const updateProperty = (data) => {
  return Promise.resolve(Property.countDocuments({ _id: data.property_id }))
    .then((result) => {
      let id = data.property_id;
      delete data._id;
      if (!result) return "error";
      return Property.updateOne({ _id: data.property_id }, data)
        .then((propertyUpdate) => {
          if (propertyUpdate.modifiedCount == 1) {
            return propertyUpdate;
          }
          return "error";
        })
        .catch((err) => {
          Logger.error(err);
          return "error";
        });
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

const getPropertyByVendorId = (vendorId) => {
  return Promise.resolve(
    User.countDocuments({ _id: vendorId })
      .then((result) => {
        if (!result) return "error";
        return Property.find({ vendor_id: vendorId })
          .then((properties) => {
            if (properties.length > 0) return properties;
            return "error";
          })
          .catch((err) => {
            Logger.error(err);
            return "error";
          });
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
const createProperty = (
  vendorId,
  propertyBasicInfo,
  propertyLocation,
  propertyContactDetails,
  propertyAmenities,
  propertyPolicies,
  propertyRules,
  propertyFinanceLegal,
  property_status,
  property_tc_agreed
) => {
  return Promise.resolve(User.countDocuments({ _id: vendorId }))
    .then((result) => {
      if (!result) return "error";
      let prop = new Property({
        vendor_id: vendorId,
        property_basic_info: {
          property_name: propertyBasicInfo.property_name,
          property_star_rating: propertyBasicInfo.property_star_rating,
          property_booking_since: propertyBasicInfo.property_booking_since,
          property_channel_manager: propertyBasicInfo.property_channel_manager,
          property_description: propertyBasicInfo.property_description,
        },
        property_location: {
          property_nearest_gate: propertyLocation.property_nearest_gate,
          property_locality: propertyLocation.property_locality,
          property_address: propertyLocation.property_address,
          property_country: propertyLocation.property_country,
          property_state: propertyLocation.property_state,
          property_city: propertyLocation.property_city,
          property_zip_code: propertyLocation.property_zip_code,
        },
        property_contact_details: {
          phone_no: propertyContactDetails.phone_no,
          email: propertyContactDetails.email,
        },
        property_amenities: {
          basic_facilities: propertyAmenities.basic_facilities,
          general_services: propertyAmenities.general_services,
          outdoor_activities_sports:
            propertyAmenities.outdoor_activities_sports,
          common_area: propertyAmenities.common_area,
          food_drink: propertyAmenities.food_drink,
          health_wellness: propertyAmenities.health_wellness,
          business_center_conference:
            propertyAmenities.business_center_conference,
          beauty_spa: propertyAmenities.beauty_spa,
          security: propertyAmenities.security,
          transfers: propertyAmenities.transfers || [],
          shopping: propertyAmenities.shopping || [],
          entertainment: propertyAmenities.entertainment || [],
          media_tech: propertyAmenities.media_tech || [],
          payment_services: propertyAmenities.payment_services || [],
          indoor_activities_sports:
            propertyAmenities.indoor_activities_sports || [],
          family_kids: propertyAmenities.family_kids || [],
          safety_hygiene: propertyAmenities.safety_hygiene || [],
          pet_essentials: propertyAmenities.pet_essentials || [],
          room_highlights: propertyAmenities.room_highlights || [],
          travel_moods: propertyAmenities.travel_moods || [],
          // transfers: propertyAmenities.transfers,
          // shopping: propertyAmenities.shopping,
          // entertainment: propertyAmenities.entertainment,
          // media_tech: propertyAmenities.media_tech,
          // payment_services: propertyAmenities.payment_services,
          // indoor_activities_sports: propertyAmenities.indoor_activities_sports,
          // family_kids: propertyAmenities.family_kids,
          // safety_hygiene: propertyAmenities.safety_hygiene,
          // pet_essentials: propertyAmenities.pet_essentials,
        },
        property_policies: {
          checkin_time: propertyPolicies.checkin_time,
          checkout_time: propertyPolicies.checkout_time,
          cancellation_policy: propertyPolicies.cancellation_policy,
        },
        property_rules: {
          guest_profile: propertyRules.guest_profile,
          id_proof: {
            acceptable_identity_proofs:
              propertyRules.id_proof.acceptable_identity_proofs,
            unacceptable_identity_proofs:
              propertyRules.id_proof.unacceptable_identity_proofs,
            allow_same_id: propertyRules.id_proof.allow_same_id,
          },
          general_safety_hygiene_guidelines:
            propertyRules.general_safety_hygiene_guidelines,
          room_safety_hygiene: propertyRules.room_safety_hygiene,
          social_distancing: propertyRules.social_distancing,
          food_drinks_hygiene: propertyRules.food_drinks_hygiene,
          property_restrictions: propertyRules.property_restrictions,
          pet_policy: propertyRules.pet_policy,
          guest_suitabilty: propertyRules.guest_suitabilty,
          checkin_checkout_policy: propertyRules.checkin_checkout_policy,
          extra_bed_policy: propertyRules.extra_bed_policy,
          custom_policy: propertyRules.custom_policy,
        },
        property_finance_legal: {
          bank_details: {
            account_no: propertyFinanceLegal.bank_details.account_no,
            ifsc_code: propertyFinanceLegal.bank_details.ifsc_code,
            bank_name: propertyFinanceLegal.bank_details.bank_name,
          },
          pan_details: {
            pan_no: propertyFinanceLegal.pan_details.pan_no,
            tan_no: propertyFinanceLegal.pan_details.tan_no,
          },
          registration_details: {
            ownership_type:
              propertyFinanceLegal.registration_details.ownership_type,
            registration_doc_id:
              propertyFinanceLegal.registration_details.registration_doc_id,
          },
          gst_details: propertyFinanceLegal.gst_details,
        },
        property_status: property_status,
        property_tc_agreed: property_tc_agreed,
      }).save();

      return prop;
    })
    .catch((err) => {
      Logger.error(err);
      return "error";
    });
};

const getPropertyThumbnail = async (vendorId) => {
  return await PropertyImage.aggregate([
    { $match: { vendor_id: vendorId } },
    {
      $project: {
        images: {
          $filter: {
            input: "$file_ids",
            as: "ids",
            cond: { $eq: ["$$ids.file_category", "property"] },
          },
        },
        _id: 0,
      },
    },
  ]).then((result) => {
    return result.length ? result[0].images[0].file_id : null;
  });
};

const getPropertyList = async (pageNo, searchText) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  return await Property.aggregate([
    {
      $match: {
        $and: [{ vendor_id: { $ne: null } }, { vendor_id: { $ne: undefined } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "vendor_id",
        foreignField: "_id",
        as: "vendor_doc",
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
                      $arrayElemAt: ["$vendor_doc.user_first_name", 0],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: ["$vendor_doc.user_last_name", 0],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: ["$vendor_doc.user_phone_no", 0],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: ["$vendor_doc.user_status", 0],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_basic_info.property_name",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_address",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_city",
                  },
                  "",
                ],
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
      $match: {
        $expr: {
          $cond: [
            { $eq: [searchText, null] },
            true,
            {
              $regexFind: {
                input: "$full_string",
                regex: searchText,
              },
            },
          ],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        property_info: {
          $arrayElemAt: [
            {
              $map: {
                input: "$vendor_doc",
                as: "u",
                in: {
                  property_id: "$_id",
                  property_status: "$property_status",
                  vendor_id: "$$u._id",
                  vendor_name: {
                    $concat: ["$$u.user_first_name", " ", "$$u.user_last_name"],
                  },
                  vendor_email: "$$u.user_email",
                  vendor_mobile_no: "$$u.user_phone_no",
                  vendor_status: "$$u.user_status",
                  property_name: "$property_basic_info.property_name",
                  property_location: {
                    $concat: [
                      "$property_location.property_address",
                      ", ",
                      "$property_location.property_city",
                    ],
                  },
                  property_added_on: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt",
                      timezone: "Asia/Kolkata",
                    },
                  },
                },
              },
            },
            0,
          ],
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
      let s3 = new aws.S3();
      return Promise.all(
        result[0].data.map(async (v, i, a) => {
          let x = Object.assign({}, v.property_info);
          x.property_image = await getPropertyThumbnail(x.vendor_id);

          if (x.property_image) {
            let imageBody = await s3
              .getObject({
                Bucket: process.env.AWS_BUCKET,
                Key: x.property_image,
              })
              .promise();
            if (imageBody) {
              x.property_image = imageBody.Body;
            }
          }
          delete x.vendor_id;
          return x;
        })
      ).then((data) => {
        return {
          metadata: result[0].metadata[0],
          data,
        };
      });
    })
    .catch((err) => {
      Logger.error(err);
      return "ERR";
    });
};

const getPropertyFinanceLegal = async (pageNo, searchText) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  return await Property.aggregate([
    {
      $match: {
        $and: [{ vendor_id: { $ne: null } }, { vendor_id: { $ne: undefined } }],
      },
    },
    {
      $sort: {createdAt: -1},
    },
    {
      $lookup: {
        from: "users",
        localField: "vendor_id",
        foreignField: "_id",
        as: "v",
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
                    $toString:
                      "$property_finance_legal.bank_details.account_no",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_finance_legal.bank_details.ifsc_code",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_finance_legal.bank_details.bank_name",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_finance_legal.pan_details.pan_no",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_finance_legal.pan_details.tan_no",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString:
                      "$property_finance_legal.registration_details.ownership_type",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_finance_legal.gst_details",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: ["$v.user_first_name", 0],
                    },
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: {
                      $arrayElemAt: ["$v.user_last_name", 0],
                    },
                  },
                  "",
                ],
              },
            ],
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [searchText, null] },
            true,
            {
              $regexFind: {
                input: "$full_string",
                regex: searchText,
              },
            },
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,
        vendor_name: {
          $concat: [
            { $arrayElemAt: ["$v.user_first_name", 0] },
            " ",
            { $arrayElemAt: ["$v.user_last_name", 0] },
          ],
        },
        property_finance_legal: "$property_finance_legal",
        final: "$full_string",
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
      return "ERR";
    });
};
const getPropertyNames = async () => {
  return Property.find({}, "property_basic_info.property_name").then(
    (result) => {
      return result.map((v, i, a) => {
        return {
          _id: v._id,
          property_name: v.property_basic_info.property_name,
        };
      });
    }
  );
};

const updatePropertyStatus = async (params, data) => {
  return await Property.updateOne(
    { _id: params.id },
    { property_status: params.status }
  )
    .then((result) => {
      if (!result.modifiedCount) {
        return "ERR";
      }
      return result.modifiedCount;
    })
    .catch((err) => {
      Logger.error(err);
      return "ERR";
    });
};

// room dtails service
const getRoomPropertyDetails = async (filters) => {
  //return await Room.findById( {_id : filters.room_id} );

  return await Room.aggregate([
    { $match: { _id: ObjectID(filters.room_id) } },
    {
      $lookup: {
        from: "rooms",
        localField: "category_id",
        foreignField: "category_id",
        as: "similar_rooms",
      },
    },
  ]);
};
const getRoomCategoryDetails = async (filters) => {
  // return await RoomCategory.findById( {_id : filters.roomcategories_id} );

  return await RoomCategory.aggregate([
    { $match: { _id: ObjectID(filters.property_id) } },
    {
      $lookup: {
        from: "roomcategories",
        localField: "category_id",
        foreignField: "property_id",
        as: "room_Cat",
      },
    },
  ]);
};

// const getPropertyDetailsService = async (filters) => {
//   //return await Property.findById( {_id : filters.property_id} );
//   return await Property.aggregate([
//     { $match: { _id: ObjectID(filters.property_id) } },
//     {
//       $lookup: {
//         from: "rooms",
//         localField: "_id",
//         foreignField: "property_id",
//         as: "rooms",
//       },
//     },
//   ]);
// };

const getPropertyDetailsService = async (filters) => {
  //return await Property.findById( {_id : filters.property_id} );
  return await Property.aggregate([
    { $match: { _id: ObjectID(filters.property_id) } },
    {
      $lookup: {
        from: "propertyimages",
        localField: "_id",
        foreignField: "property_id",
        as: "property_image",
       
      },
      
      
    },
  
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "property_id",
        as: "rooms",
      },
    },
    {
      $project: {
        property_basic_info:
            "$property_basic_info",
            property_location:
            "$property_location",
            property_contact_details:
            "$property_contact_details",
            property_amenities:
            "$property_amenities",
            property_policies:
            "$property_policies",
            property_rules:
            "$property_rules",
            property_tc_agreed:
            "$property_tc_agreed",
            images: {
              $reduce: {
                input: "$property_image.file_paths.path",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $ifNull: ["$$this", []]
                    }
                  ]
                }
              }
            },
            Rooms:
            "$rooms",
        // categories_detail: "$p.property_policies",
       
      }
    }, 
  ]);
};




// const getRoomCategoryDetailsService = async (filters) => {
//   //return await Property.findById( {_id : filters.property_id} );
//   return await Property.aggregate([
//     { $match: { _id: ObjectID(filters.room_cat_id) } },
//     {
//       $lookup: {
//         from: "roomcategories",
//         localField: "_id",
//         foreignField: "roomcategories_id",
//         as: "roomCat",
//       },
//     },
//   ]);
// };

const getRoomCategoryDetailsService = async (filters) => {
  //return await Property.findById( {_id : filters.property_id} );
  return await RoomCategory.aggregate([
    { $match: { _id: ObjectID(filters.category_id) } },
   {

    $lookup: {
      from: "properties",
      localField: "property_id",
      foreignField: "_id",
      as: "p",
      },
      
    },
    // {
    //   $lookup: {
    //     from: "pricings",
    //     let: { category_name: "$category_basic_info.name", property_id: "$property_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$pricing_property_id", "$$property_id"] },
    //               { $eq: ["$category_name", "$$category_name"] }
    //             ]
    //           }
    //         }
    //       }
    //     ],
    //     as: "paisa"
    //   }
    // },
   {

    $lookup: {
      from: "categoryimages",
      localField: "_id",
      foreignField: "category_id",
      as: "pi",
      },
      
    },
    {
      $unwind: "$p"
    },
    {
      $project: {

        property_id: "$p._id", 
        vendor_id: "$p.vendor_id", 
        category_basic_info:
            "$category_basic_info",
            category_base_pricing:
            "$category_base_pricing",
            weekend_pricing:
             "$category_weekend_base_pricing",
            // all_base_pricing:
            // "$paisa",
            category_availability:
            "$category_availability",
            category_amenities:
            "$category_amenities",
            category_group_booking:
            "$category_group_booking",
            category_weekend_group_booking:
            "$category_weekend_group_booking",
            property_location:
            "$property_location",
            category_extra_bed:
            "$category_extra_bed",
           
            property_name:
            "$p.property_basic_info.property_name",
        // categories_detail: "$p.property_policies",
        property_policy : "$p.property_policies",
        property_rules : "$p.property_rules",
        images: {
          $concatArrays: [
            {
              $ifNull: ["$pi.file_paths.path", []]
            },
          ]
          },
      }
    }
  ]);
}; //25-03-23

// const getRoomCategoryDetailsService = async (filters) => {
//   //return await Property.findById( {_id : filters.property_id} );
//   return await RoomCategory.aggregate([
//     { $match: { _id: ObjectID(filters.category_id) } },
//    {

//     $lookup: {
//       from: "properties",
//       localField: "property_id",
//       foreignField: "_id",
//       as: "p",
//       },
      
//     },
//    {

//     $lookup: {
//       from: "categoryimages",
//       localField: "_id",
//       foreignField: "category_id",
//       as: "pi",
//       },
      
//     },
//     {
//       $unwind: "$p"
//     },
   
//     {
//       $project: {

//         property_id: "$p._id", 
//         vendor_id: "$p.vendor_id", 
//         category_basic_info:
//             "$category_basic_info",
//             category_base_pricing:
//             "$category_base_pricing",
//             category_availability:
//             "$category_availability",
//             category_amenities:
//             "$category_amenities",
//             category_group_booking:
//             "$category_group_booking",
//             property_location:
//             "$property_location",
//             category_extra_bed:
//             "$category_extra_bed",
           
//             property_name:
//             "$p.property_basic_info.property_name",
//         // categories_detail: "$p.property_policies",
//         property_policy : "$p.property_policies",
//         property_rules : "$p.property_rules",
//         images: {
//           $reduce: {
//             input: "$pi.file_paths.path",
//             initialValue: [],
//             in: {
//               $concatArrays: [
//                 "$$value",
//                 {
//                   $ifNull: ["$$this", []]
//                 }
//               ]
//             }
//           }
//         }
        
//       }
//     }
//   ]);
// }; // latest without array

const getRoomCatCard = async (filters, searchText) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }

  return await RoomCategory.aggregate([
    {
      $lookup: {
        from: "properties",
        localField: "property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $set: {
        place: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: "$category_basic_info.name",
                  },
                  "",
                ],
              },
              ", ",
              {
                $ifNull: [
                  {
                    $toString: "$category_basic_info.description",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_city",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_nearest_gate",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_state",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_zip_code",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_address",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_locality",
                  },
                  "",
                ],
              },
              

            ],
          },
        },
      },
    },

    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [filters.place, null] },
            true,
            {
              $regexFind: {
                input: "$place",
                regex: { $toLower: filters.place },
              },
            },
          ],
        },
      },
    },

    {
      $set: {
        per_room_occupancy: {
          $sum: [
            "$category_base_pricing.base_occupancy",
            "$category_base_pricing.extra_adult",
            "$category_base_pricing.extra_child",
          ],
        },
      },
    },
    {
      $match: {
        $expr: {
          $lte: [
            "$category_base_pricing.base_price",
            Number(filters.max_price),
          ],
        },
      },
    },
    {
      $lookup: {
        from: "rooms",
        let: {
          category_id: "$_id",
          per_room_occupancy: "$per_room_occupancy",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$category_id", "$$category_id"],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              total_room_occupancy: {
                $toInt: ["$$per_room_occupancy"],
              },
            },
          },
        ],
        as: "r",
      },
    },

    {
      $lookup: {
        from: "categoryimages",
        localField: "_id",
        foreignField: "category_id",
        as: "pi",
      },
    },
    // {
    //   $unwind: "$p"
    // },
    {
      $lookup: {
        from: "bookings",
        localField: "r._id",
        foreignField: "booking_room_id",
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $lte: ["$checkIn_date_time", filters.checkin_date],
                      },
                      {
                        $gte: ["$checkOut_date_time", filters.checkin_date],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $lte: ["$checkIn_date_time", filters.checkout_date],
                      },
                      {
                        $gte: ["$checkOut_date_time", filters.checkout_date],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $gt: ["$checkIn_date_time", filters.checkin_date],
                      },
                      {
                        $lt: ["$checkOut_date_time", filters.checkout_date],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "b",
      },
    },
    {
      $set: {
        r: {
          $filter: {
            input: "$r",
            as: "r",
            cond: {
              $not: {
                $in: ["$$r._id", "$b.booking_room_id"],
              },
            },
          },
        },
      },
    },

    {
      $set: {
        base_occupancy: { $ifNull: ["$category_base_pricing.max_guests", 1] },
        available_room_count: {
          $size: {
            $filter: {
              input: "$r",
              as: "room",
              cond: { $eq: ["$$room.room_status", "Available"] },
            },
          },
        },
      },
    },
    {
      $set: {
        total_property_occupancy: {
          $multiply: ["$base_occupancy", "$available_room_count"],
        },
      },
    },

    {
      $addFields: {
        is_available: {
          $cond: [
            {
              $lte: [Number(filters.no_of_guests), "$total_property_occupancy"],
            },
            true,
            false,
          ],
        },
      },
    },

    {
      $set: {
        available_text: {
          $cond: ["$is_available", "", "Currently unavailable"],
        },
      },
    },
    // {
    //   $addFields: {
    //     is_available: {
    //       $or: [
    //         "$is_available",
    //         { $eq: ["$total_property_occupancy", 0] }
    //       ],
    //     },
    //   },
    // },

    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [searchText, null] },
            true,
            {
              $regexFind: {
                input: "$full_string",
                regex: searchText,
              },
            },
          ],
        },
      },
    },
    {
      $sort: {
        is_available: -1,
        total_property_occupancy: -1,
      },
    },

    {
      $project: {
        available_text: `$available_text`,
        // available_text:`$is_available`,
        occupancy_per_room: "$base_occupancy",
        available_room_count: "$available_room_count",
        total_Adults_can_occupy: "$total_property_occupancy",
        _id: "$_id",
        property_id: "$property_id",

        catdetails: "$category_basic_info",
        catPrice: "$category_base_pricing",
        weekend_pricing: "$category_weekend_base_pricing",

        services: {
          $concatArrays: [
            {
              $ifNull: ["$category_amenities.basic_facilities", []],
            },
            {
              $ifNull: ["$category_amenities.general_services", []],
            },
            {
              $ifNull: ["$category_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$category_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$category_amenities.common_area", []],
            },
            { $ifNull: ["$category_amenities.food_drink", []] },
            {
              $ifNull: ["$category_amenities.health_wellness", []],
            },
            {
              $ifNull: ["$category_amenities.business_center_conference", []],
            },
            { $ifNull: ["$category_amenities.beauty_spa", []] },
            { $ifNull: ["$category_amenities.security", []] },
          ],
        },
        extra_services: "$a",
        // property_policies: "$p.property_policies",
        // property_rules: "$p.property_rules",
        property: "$p",
        room: "$r",
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
  /* .then(async (properties) => {
            for (let property of properties) {
                property.images = await getPropertyImages(property.vendor_id);
            }
            return properties;
        }); */
  //   /* } catch (err) {
  //         Logger.error(err);
  //         return null;
  //     } */
};

const getRoomCatGroupCard = async (filters, searchText) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }

  return await RoomCategory.aggregate([
    {
      $lookup: {
        from: "properties",
        localField: "property_id",
        foreignField: "_id",
        as: "p",
      },
    },
    {
      $set: {
        place: {
          $toLower: {
            $concat: [
              {
                $ifNull: [
                  {
                    $toString: "$category_basic_info.name",
                  },
                  "",
                ],
              },
              ", ",
              {
                $ifNull: [
                  {
                    $toString: "$category_basic_info.description",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_city",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_nearest_gate",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_state",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_zip_code",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_address",
                  },
                  "",
                ],
              },
              {
                $ifNull: [
                  {
                    $toString: "$property_location.property_locality",
                  },
                  "",
                ],
              },
            ],
          },
        },
      },
    },

    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [filters.place, null] },
            true,
            {
              $or: [
                {
                  $regexFind: {
                    input: "$place",
                    regex: { $toLower: filters.place },
                  },
                },
                {
                  $or: [
                    {
                      $regexFind: {
                        input: "$category_basic_info.name",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$category_basic_info.description",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_city",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_nearest_gate",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_state",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_zip_code",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_address",
                        regex: searchText,
                      },
                    },
                    {
                      $regexFind: {
                        input: "$property_location.property_locality",
                        regex: searchText,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },

    {
      $set: {
        per_room_occupancy: {
          $sum: [
            "$category_base_pricing.base_occupancy",
            "$category_base_pricing.extra_adult",
            "$category_base_pricing.extra_child",
          ],
        },
      },
    },
    {
      $match: {
        $expr: {
          $lte: [
            "$category_base_pricing.base_price",
            Number(filters.max_price),
          ],
        },
      },
    },
    {
      $lookup: {
        from: "rooms",
        let: {
          category_id: "$_id",
          per_room_occupancy: "$per_room_occupancy",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$category_id", "$$category_id"],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              total_room_occupancy: {
                $toInt: ["$$per_room_occupancy"],
              },
            },
          },
        ],
        as: "r",
      },
    },

    {
      $lookup: {
        from: "categoryimages",
        localField: "_id",
        foreignField: "category_id",
        as: "pi",
      },
    },
    // {
    //   $unwind: "$p"
    // },
    {
      $lookup: {
        from: "bookings",
        localField: "r._id",
        foreignField: "booking_room_id",
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $lte: ["$checkIn_date_time", filters.checkin_date],
                      },
                      {
                        $gte: ["$checkOut_date_time", filters.checkin_date],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $lte: ["$checkIn_date_time", filters.checkout_date],
                      },
                      {
                        $gte: ["$checkOut_date_time", filters.checkout_date],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $gt: ["$checkIn_date_time", filters.checkin_date],
                      },
                      {
                        $lt: ["$checkOut_date_time", filters.checkout_date],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "b",
      },
    },
    {
      $set: {
        r: {
          $filter: {
            input: "$r",
            as: "r",
            cond: {
              $not: {
                $in: ["$$r._id", "$b.booking_room_id"],
              },
            },
          },
        },
      },
    },

    {
      $set: {
        base_occupancy: {
          $ifNull: ["$category_group_booking.booking_capacity", 1],
        },
        available_room_count: {
          $size: {
            $filter: {
              input: "$r",
              as: "room",
              cond: { $eq: ["$$room.room_status", "Available"] },
            },
          },
        },
      },
    },
    {
      $set: {
        total_property_occupancy: {
          $multiply: ["$base_occupancy", "$available_room_count"],
        },
      },
    },

    {
      $addFields: {
        is_available: {
          $cond: [
            {
              $lte: [Number(filters.no_of_guests), "$total_property_occupancy"],
            },
            true,
            false,
          ],
        },
      },
    },

    {
      $set: {
        available_text: {
          $cond: ["$is_available", "", "Currently unavailable"],
        },
      },
    },
    // {
    //   $addFields: {
    //     is_available: {
    //       $or: [
    //         "$is_available",
    //         { $eq: ["$total_property_occupancy", 0] }
    //       ],
    //     },
    //   },
    // },
    {
      $match: {
        $expr: {
          $cond: [
            { $eq: [searchText, null] },
            true,
            {
              $regexMatch: {
                input: "$full_string",
                regex: searchText,
                options: "i",
              },
            },
          ],
        },
      },
    },

    {
      $sort: {
        is_available: -1,
        total_property_occupancy: -1,
      },
    },

    {
      $project: {
        available_text: `$available_text`,
        // available_text:`$is_available`,
        occupancy_per_room: "$base_occupancy",
        available_room_count: "$available_room_count",
        total_Adults_can_occupy: "$total_property_occupancy",
        _id: "$_id",
        property_id: "$property_id",

        catdetails: "$category_basic_info",
        catPrice: "$category_base_pricing",

        services: {
          $concatArrays: [
            {
              $ifNull: ["$category_amenities.basic_facilities", []],
            },
            {
              $ifNull: ["$category_amenities.general_services", []],
            },
            {
              $ifNull: ["$category_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$category_amenities.outdoor_activities_sports", []],
            },
            {
              $ifNull: ["$category_amenities.common_area", []],
            },
            { $ifNull: ["$category_amenities.food_drink", []] },
            {
              $ifNull: ["$category_amenities.health_wellness", []],
            },
            {
              $ifNull: ["$category_amenities.business_center_conference", []],
            },
            { $ifNull: ["$category_amenities.beauty_spa", []] },
            { $ifNull: ["$category_amenities.security", []] },
          ],
        },
        extra_services: "$a",
        // property_policies: "$p.property_policies",
        // property_rules: "$p.property_rules",
        property: "$p",
        room: "$r",
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
  /* .then(async (properties) => {
            for (let property of properties) {
                property.images = await getPropertyImages(property.vendor_id);
            }
            return properties;
        }); */
  //   /* } catch (err) {
  //         Logger.error(err);
  //         return null;
  //     } */
};




module.exports = {
  getPropertyNames,
  createProperty,
  getPropertyByVendorId,
  updateProperty,
  getActivityByPropertyId,
  insertUpdateVendorActivity,
  getPropertyImages,
  getPropertyList,
  getPropertyFinanceLegal,
  updatePropertyStatus,
  getPropertyForUserWithFilters,
  getMostPopularProperty,
  getLocation,
  getPropertyDocs,
  getRoomPropertyDetails,
  getPropertyDetailsService,
  getRoomCategoryDetailsService,
  getRoomCategoryDetails,
  getRoomCatCard,
  getRoomCatGroupCard 
};



