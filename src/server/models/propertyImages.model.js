const propertyImageSchema = new (require("mongoose").Schema)(
  {
    vendor_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
    },
    property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    // file_ids: [
    //   {
    //     file_id: {
    //       type: String,
    //       required: false,
    //     },
    //     file_fieldname: {
    //       type: String,
    //       required: false,
    //     },
    //     file_category: {
    //       type: String,
    //       required: false,
    //     },
    //   },
    // ],
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
          // required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const PropertyImage = require("mongoose").model("PropertyImage", propertyImageSchema);

module.exports = PropertyImage;
