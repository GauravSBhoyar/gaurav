const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AmenityImageSchema = new Schema({
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
            required: true,
          },
        },
      ],
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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


const AmenityImage = mongoose.model('AmenityImage', AmenityImageSchema);
// AmenityImage.collection.drop((err) => {
//   if (err) {
//       console.log('Error dropping collection:', err);
//   } else {
//       console.log('Collection dropped successfully.');
//   }
// });


module.exports = AmenityImage;
