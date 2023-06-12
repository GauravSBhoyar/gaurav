const userSchema = new (require("mongoose").Schema)(
  {
    user_role: {
      type: String,
      required: false,
    },
    user_email: {
      type: String,
      trim: true,
      required: false,
    },
    user_first_name: {
      type: String,
      trim: true,
      required: false,
      text: true,
    },
    user_last_name: {
      type: String,
      trim: true,
      required: false,
      text: true,
    },
    user_status: {
      type: String,
      default: "Unverified",
      required: true,
    },
    user_salt: {
      type: String,
      required: true,
    },
    user_hash: {
      type: String,
      required: true,
    },
    user_phone_no: {
      type: String,
      required: false,
      text: true,
    },
    vendor_company_name: {
      type: String,
      required: false,
    },
    vendor_is_onboard: {
      type: Boolean,
      required: false,
    },
    vendor_address: {
      type: String,
      required: false,
    },
    user_cipher_text: {
      type: String,
      required: false,
    },
    user_pic_id: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const User = require("mongoose").model("User", userSchema);

module.exports = User;
