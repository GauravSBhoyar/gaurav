const thoughtSchema = new (require("mongoose").Schema)(
    {
      name: {
        type: String,
        required: false,
      },
      title: {
        type: String,
        required: false,
      },
      rating: {
        type: Number,
        required: false,
      },
      
      file_paths: [
        {
          path: {
            type: String,
            required: false,
          },
          file_category: {
            type: String,
            required: false,
          },
          file_size: {
            type: Number,
            // required: true,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  const Thought = require("mongoose").model("Thought", thoughtSchema);
  
  module.exports = Thought;