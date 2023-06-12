const aboutusSchema = new (require("mongoose").Schema)(
    {
        title: {
            type : String,
            required : false
        },
        info: {
            type : String,
            required : false
        },
        luxury: {
            type : Number,
            required : false
        },
        attractive: {
            type : Number,
            required : false
        },
        happy: {
            type : Number,
            required : false
        },
        carousel: {
                heading: {
                    type : String,
                    required : false
                },
                para: {
                    type : String,
                    required : false
                },
            },
    },
    {
        timestamps: true
    }
);

const About = require ("mongoose").model("About",aboutusSchema);
module.exports = About;

