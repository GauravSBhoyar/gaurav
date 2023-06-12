const roomCategorySchema = new (require("mongoose").Schema)(
  {
    property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    category_basic_info: {
      name: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      bed_type: {
        type: String,
        required: false,
      },
      meal_option: {
        type: String,
        required: false,
      },
      room_size: {
        length: {
          type: String,
          required: false,
        },
        breadth: {
          type: String,
          required: false,
        },
        size_unit: {
          type: String,
          required: false,
        },
      },
      smoking_allowed: {
        type: String,
        required: false,
      },
      view: {
        type: String,
        required: false,
      },
    },
    category_extra_bed: {
      extra_bed_provided: {
        type: String,
        required: false,
      },
      extra_bed_type: {
        type: String,
        required: false,
      }
    },
    category_base_pricing: {
      base_occupancy: {
        type: Number,
        required: false,
      },
      extra_adult: {
        type: Number,
        required: false,
      },
      extra_child: {
        type: Number,
        required: false,
      },
      max_guests: {
        type: Number,
        required: false,
      },
      base_price: {
        type: Number,
        required: false,
      },
      extra_adult_price: {
        type: Number,
        required: false,
      },
      extra_child_price: {
        child_range_one_price: {
          type: Number,
          required: false,
        },
        child_range_two_price: {
          type: Number,
          required: false,
        },
      },
    },
    category_weekend_base_pricing: {
      base_weekend_occupancy: {
        type: Number,
        required: false,
      },
      extra_weekend_adult: {
        type: Number,
        required: false,
      },
      extra_weekend_child: {
        type: Number,
        required: false,
      },
      max_weekend_guests: {
        type: Number,
        required: false,
      },
      base_weekend_price: {
        type: Number,
        required: false,
      },
      extra_weekend_adult_price: {
        type: Number,
        required: false,
      },
      extra_weekend_child_price: {
        child_range_one_price: {
          type: Number,
          required: false,
        },
        child_range_two_price: {
          type: Number,
          required: false,
        },
      },
    },
    category_weekend_group_booking: {
      weekend_group_booking_allowed: {
        type: Boolean,
        required: false,
      },
      weekend_booking_capacity: {
        type: Number,
        required: false,
      },
      weekend_per_person_cost: {
        type: String,
        required: false,
      },
      weekend_base_price: {
        type: String,
        required: false,
      },
      weekend_no_cost_child: {
        type: Number,
        required: false,
      },
    },
    category_availability: {
      start_date: {
        type: String,
        required: false,
      },
      end_date: {
        type: String,
        required: false,
      },
    },
    category_amenities: {
      basic_facilities: [{ type: String, required: false }],
      general_services: [{ type: String, required: false }],
      outdoor_activities_sports: [{ type: String, required: false }],
      common_area: [{ type: String, required: false }],
      food_drink: [{ type: String, required: false }],
      health_wellness: [{ type: String, required: false }],
      business_center_conference: [{ type: String, required: false }],
      beauty_spa: [{ type: String, required: false }],
      security: [{ type: String, required: false }],
      transfers: [{ type: String, required: false }],
      shopping: [{ type: String, required: false }],
      entertainment: [{ type: String, required: false }],
      media_tech: [{ type: String, required: false }],
      payment_services: [{ type: String, required: false }],
      indoor_activities_sports: [{ type: String, required: false }],
      family_kids: [{ type: String, required: false }],
      safety_hygiene: [{ type: String, required: false }],
      pet_essentials: [{ type: String, required: false }],
      room_highlights: [{ type: String, required: false }],
      travel_moods: [{ type: String, required: false }]
    },
    property_location: {
      property_nearest_gate: {
        type: String,
        required: false,
      },
      property_locality: {
        type: String,
        required: false,
      },
      property_address: {
        type: String,
        required: false,
        text: true,
      },
      property_country: {
        type: String,
        required: false,
      },
      property_state: {
        type: String,
        required: false,
      },
      property_city: {
        type: String,
        required: false,
        text: true,
      },
      property_zip_code: {
        type: String,
        required: false,
      },

    },

    category_group_booking: {
      group_booking_allowed: {
        type: Boolean,
        required: false,
      },
      booking_capacity: {
        type: Number,
        required: false,
      },
      per_person_cost: {
        type: String,
        required: false,
      },
      base_price: {
        type: String,
        required: false,
      },
      no_cost_child: {
        type: Number,
        required: false,
      },
    },
    added_to_featured: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

const RoomCategory = require("mongoose").model("RoomCategory", roomCategorySchema);

module.exports = RoomCategory;



// const roomCategorySchema = new (require("mongoose").Schema)(
//   {
//     property_id: {
//       type: require("mongoose").Schema.Types.ObjectId,
//       ref: "Property",
//     },
//     category_basic_info: {
//       name: {
//         type: String,
//         required: false,
//       },
//       description: {
//         type: String,
//         required: false,
//       },
//       bed_type: {
//         type: String,
//         required: false,
//       },
//       meal_option: {
//         type: String,
//         required: false,
//       },
//       room_size: {
//         length: {
//           type: String,
//           required: false,
//         },
//         breadth: {
//           type: String,
//           required: false,
//         },
//         size_unit: {
//           type: String,
//           required: false,
//         },
//       },
//       smoking_allowed: {
//         type: String,
//         required: false,
//       },
//       view: {
//         type: String,
//         required: false,
//       },
//     },
//     category_extra_bed: {
//       extra_bed_provided: {
//         type: String,
//         required: false,
//       },
//       extra_bed_type: {
//         type: String,
//         required: false,
//       }
//     },
//     property_location: {
//       property_nearest_gate: {
//         type: String,
//         required: false,
//       },
//       property_locality: {
//         type: String,
//         required: false,
//       },
//       property_address: {
//         type: String,
//         required: false,
//         text: true,
//       },
//       property_country: {
//         type: String,
//         required: false,
//       },
//       property_state: {
//         type: String,
//         required: false,
//       },
//       property_city: {
//         type: String,
//         required: false,
//         text: true,
//       },
//       property_zip_code: {
//         type: String,
//         required: false,
//       },
//     },
//     category_base_pricing: {
//       base_occupancy: {
//         type: Number,
//         required: false,
//       },
//       extra_adult: {
//         type: Number,
//         required: false,
//       },
//       extra_child: {
//         type: Number,
//         required: false,
//       },
//       max_guests: {
//         type: Number,
//         required: false,
//       },
//       base_price: {
//         type: Number,
//         required: false,
//       },
//       extra_adult_price: {
//         type: Number,
//         required: false,
//       },
//       extra_child_price: {
//         child_range_one_price: {
//           type: Number,
//           required: false,
//         },
//         child_range_two_price: {
//           type: Number,
//           required: false,
//         },
//       },
//     },
//     category_availability: {
//       start_date: {
//         type: String,
//         required: false,
//       },
//       end_date: {
//         type: String,
//         required: false,
//       },
//     },
//     category_amenities: {
//       basic_facilities: [{ type: String, required: false }],
//       general_services: [{ type: String, required: false }],
//       outdoor_activities_sports: [{ type: String, required: false }],
//       common_area: [{ type: String, required: false }],
//       food_drink: [{ type: String, required: false }],
//       health_wellness: [{ type: String, required: false }],
//       business_center_conference: [{ type: String, required: false }],
//       beauty_spa: [{ type: String, required: false }],
//       security: [{ type: String, required: false }],
//       transfers: [{ type: String, required: false }],
//       shopping: [{ type: String, required: false }],
//       entertainment: [{ type: String, required: false }],
//       media_tech: [{ type: String, required: false }],
//       payment_services: [{ type: String, required: false }],
//       indoor_activities_sports: [{ type: String, required: false }],
//       family_kids: [{ type: String, required: false }],
//       safety_hygiene: [{ type: String, required: false }],
//       pet_essentials: [{ type: String, required: false }],
//       room_highlights: [{ type: String, required: false }],
//       travel_moods: [{ type: String, required: false }]
//     },

//     category_group_booking: {
//       group_booking_allowed: {
//         type: Boolean,
//         required: false,
//       },
//       booking_capacity: {
//         type: Number,
//         required: false,
//       },
//       per_person_cost: {
//         type: String,
//         required: false,
//       },
//       base_price: {
//         type: String,
//         required: false,
//       },
//       no_cost_child: {
//         type: Number,
//         required: false,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const RoomCategory = require("mongoose").model("RoomCategory", roomCategorySchema);

// module.exports = RoomCategory;
