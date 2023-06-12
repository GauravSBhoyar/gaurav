const commissionSchema = new (require("mongoose").Schema)(
  {
    access_type: {
      type: String,
      required: false,
      defualt: "Admin",
    },
    pricing: [
      {
        pricing_slab: {
          type: String,
          required: false,
          defualt: "0",
        },
        commission_rate: {
          type: String,
          required: false,
          defualt: "0",
        },
        fixed_commission: {
          type: String,
          required: false,
          defualt: "0",
        },
      },
    ],
    tax: [
      {
        pricing_slab: {
          type: String,
          required: false,
          defualt: "0",
        },
        commission_rate: {
          type: String,
          required: false,
          defualt: "0",
        },
        fixed_commission: {
          type: String,
          required: false,
          defualt: "0",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Commission = require("mongoose").model("Commission", commissionSchema);

module.exports = Commission;
