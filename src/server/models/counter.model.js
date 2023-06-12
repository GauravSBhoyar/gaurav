const counterSchema = new (require("mongoose").Schema)(
  {
    counter_type: {
      type: String,
      required: false,
    },

    check_ins_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    check_ins_today: {
      type: Number,
      default: 0,
      required: false,
    },
    booking_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    booking_today: {
      type: Number,
      default: 0,
      required: false,
    },
    amount_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    amount_today: {
      type: Number,
      default: 0,
      required: false,
    },
    revenue_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    revenue_today: {
      type: Number,
      default: 0,
      required: false,
    },
    visits_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    visits_today: {
      type: Number,
      default: 0,
      required: false,
    },
    settlement_checkouts_previous: {
      type: Number,
      default: 0,
      required: false,
    },
    settlement_checkouts_today: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = require("mongoose").model("Counter", counterSchema);

module.exports = Counter;
