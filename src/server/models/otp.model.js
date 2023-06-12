const otpSchema = new (require("mongoose").Schema)({
    customer_id: { type: require("mongoose").Schema.Types.ObjectId, ref: "Customer" },
    mobile: {
        type: String,
        required: true,
    },
    otp: { 
        type: String, 
        // type: Number, 
        required: true
    },
    otp_for: {
        type: String,
        enum : ['Customer','User','Vendor']
    },
    otp_status: {
        type: String,
        enum : ['Pending','Validate','Failed'],
        default: 'Pending'
    }
},
{
  timestamps: true,
}
);

const Otp = require("mongoose").model("Otp", otpSchema);
module.exports = Otp;