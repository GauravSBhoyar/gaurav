const customerSchema = new (require("mongoose").Schema)({
    firstname: { type: String},
    lastname: { type: String, required: false },
    email: { type: String, required: false },
    mobile: { 
        type: Number, 
        required: true,
        unique: true
        // validate: {
        //     validator: function(v) {
        //         return /d{10}/.test(v);
        //     },
        //     message: '{VALUE} is not a valid 10 digit number!'
        // } 
    },
    customer_status: {
        type: String,
        enum : ['Active','Inactive'],
        default: 'Active'
    },
    user_image: [{ type: String, required: false, default: "" }],
},
{
  timestamps: true,
}
);

const Customer = require("mongoose").model("Customers", customerSchema);
module.exports = Customer;