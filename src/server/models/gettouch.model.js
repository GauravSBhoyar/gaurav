const getTouchSchema = new (require("mongoose").Schema)(
    {
        office: {
            type: Number,
            required: false
        },
        mobile: {
            type: Number,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        follow: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true
    }
);

const Gettouch = require("mongoose").model("Gettouch",getTouchSchema);

module.exports = Gettouch;