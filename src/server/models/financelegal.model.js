const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FinanceImageSchema = new Schema({
   
   
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


const Financeimage = mongoose.model('Financeimage', FinanceImageSchema);



module.exports = Financeimage;