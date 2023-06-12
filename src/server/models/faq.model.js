const faqSchema = new (require("mongoose").Schema)(
    {
        question: {
            type: String,
            required: false,
        },
        answer: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true
    }
);

const Faq = require("mongoose").model("Faq",faqSchema);

module.exports = Faq;