// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const blogSchema = new (require("mongoose").Schema)({

//   file_paths: [
//     {
//       path: {
//         type: String,
//         required: true,
//       },
//       file_category: {
//         type: String,
//         required: true,
//       },
//       file_size: {
//         type: Number,
//       },
//     },
//   ],
//   blog_title: {
//     type: String,
//     required: false,
//   },

//   blog_image_id: {
//     type: String,
//     required: false,
//   },
//   blog_date: {
//     type: String,
//     required: false,
//   },
//   blog_data: { type: String, required: false },
// },
//   {
//     timestamps: true,
//   }
// );

// const Blog = require("mongoose").model("Blog", blogSchema,Schema);

// module.exports = Blog;

const blogSchema = new (require("mongoose").Schema)(
  {
    blog_title: {
      type: String,
      required: false,
    },
    blog_image_id: {
      type: String,
      required: false,
    },
    blog_date: {
      type: String,
      required: false,
    },
    blog_data: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Blog = require("mongoose").model("Blog", blogSchema);

module.exports = Blog;
