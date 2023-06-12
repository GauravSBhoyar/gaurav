const activitySchema = new (require("mongoose").Schema)(
  {
    activity_property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    activity_title: {
      type: String,
      required: false,
    },
    activity_image_id: {
      type: String,
      required: false,
    },
    activity_description: {
      type: String,
      required: false,
    },
    activity_status: {
      type: String,
      default: "Deactive",
      required: false,
    },
    activity_category: {
      type: String,
      default: null,
      required: false,
    },
    activity_image_file: [{ type: String, required: false, default: "" }],
  },
  {
    timestamps: true,
  }
);

const Activity = require("mongoose").model("Activity", activitySchema);



module.exports = Activity;