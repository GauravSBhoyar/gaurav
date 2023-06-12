const pricingSchema = new (require("mongoose").Schema)(
  {
    pricing_property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    pricing_category_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "RoomCategory",
    },
    category_name: {
      type: String,
      required: false,
    },
    added_to_featured: { type: Boolean, required: false, default: false },
    pricing_is_featured: { type: Boolean, required: false, default: false },
    individual: {
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
      weekdays: {
        base_price: {
          type: String,
          required: false,
        },
        extra_adult_price: {
          type: String,
          required: false,
        },
        extra_child_price: {
          child_range_one_price: {
            type: String,
            required: false,
          },
          child_range_two_price: {
            type: String,
            required: false,
          },
        },
      },
      weekends: {
        base_price: {
          type: String,
          required: false,
        },
        extra_adult_price: {
          type: String,
          required: false,
        },
        extra_child_price: {
          child_range_one_price: {
            type: String,
            required: false,
          },
          child_range_two_price: {
            type: String,
            required: false,
          },
        },
      },
    },
    group: {
      group_booking_allowed :{
        type: Boolean,
        required: false,
      },
      booking_capacity: {
        type: Number,
        required: false,
      },
      no_cost_child: {
        type: Number,
        required: false,
      },
      weekdays: {
        per_person_cost: {
          type: String,
          required: false,
        },
        base_price: {
          type: String,
          required: false,
        },
      },
      weekends: {
        per_person_cost: {
          type: String,
          required: false,
        },
        base_price: {
          type: String,
          required: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Pricing = require("mongoose").model("Pricing", pricingSchema);

module.exports = Pricing;
