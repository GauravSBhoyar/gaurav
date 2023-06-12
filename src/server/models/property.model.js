const propertySchema = new (require("mongoose").Schema)(
  {
    vendor_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
    },
    property_image_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "PropertyImage",
    },
    property_review_count: {
      type: Number,
      required: false,
      default: 0,
    },
    property_review_sum: {
      type: Number,
      required: false,
      default: 0,
    },
    property_basic_info: {
      property_name: {
        type: String,
        required: false,
        text: true,
      },
      property_star_rating: {
        type: Number,
        required: false,
      },
      property_booking_since: {
        type: Number,
        required: false,
      },
      property_channel_manager: {
        type: String,
        required: false,
      },
      property_description: {
        type: String,
        required: false,
      }
    },
    property_status: {
      type: String,
      required: false,
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
    property_contact_details: {
      phone_no: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    property_amenities: {
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

    property_policies: {
      checkin_time: {
        type: String,
        required: false,
        default: "12:00",
      },
      checkout_time: {
        type: String,
        required: false,
        default: "12:00",
      },
      cancellation_policy: {
        type: String,
        required: false,
      },
    },
    property_rules: {
      guest_profile: [
        {
          question: {
            type: String,
            required: false,
          },
          value: {
            type: String,
            required: false,
          },
        },
      ],
      id_proof: {
        acceptable_identity_proofs: {
          type: String,
          required: false,
        },
        unacceptable_identity_proofs: {
          type: String,
          required: false,
        },
        allow_same_id: {
          type: String,
          required: false,
        },
      },
      general_safety_hygiene_guidelines: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      room_safety_hygiene: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      social_distancing: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      food_drinks_hygiene: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      property_restrictions: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      property_restrictions: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      pet_policy: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      guest_suitabilty: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      checkin_checkout_policy: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      extra_bed_policy: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
      custom_policy: [
        {
          question: { type: String, required: false },
          value: { type: String, required: false },
        },
      ],
    },
    property_finance_legal: {
      bank_details: {
        account_no: { type: String, required: false, default: "" },
        ifsc_code: { type: String, required: false, default: "" },
        bank_name: { type: String, required: false, default: "" },
      },
      pan_details: {
        pan_no: { type: String, required: false, default: "" },
        tan_no: { type: String, required: false, default: "" },
      },
      registration_details: {
        ownership_type: { type: String, required: false, default: "" },
        registration_doc_id: [{ type: String, required: false, default: "" }],
      },
      gst_details: { type: String, required: false, default: "" },
    },
    property_tc_agreed: { type: Boolean, required: false },
  },
  {
    timestamps: true,
  }
);

const Property = require("mongoose").model("Property", propertySchema);

module.exports = Property;
