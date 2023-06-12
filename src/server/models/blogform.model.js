const blogCommentSchema = new (require("mongoose").Schema)(
    {
        message: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        blog_id: {
            type: String,
            required: false,
        },
        user_id: {
            type: String,
            required: false,
        },
        user_image: [{ type: String, required: false, default: "" }],
    },
    {
        timestamps: true,
    }
);

const BlogComment = require("mongoose").model("BlogComment", blogCommentSchema);

module.exports = BlogComment;