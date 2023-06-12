const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoryImageSchema = new Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomCategory",
        required: true,
    },
   
    file_paths: [
        {
          path: {
            type: String,
            required: true,
          },
          file_category: {
            type: String,
            required: true,
          },
          file_size: {
            type: Number,
          },
        },
      ],
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
});


const CategoryImage = mongoose.model('CategoryImage', CategoryImageSchema);



module.exports = CategoryImage;
