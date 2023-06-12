const notificationSchema = new (require("mongoose").Schema)(
  {
    notification_user_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    notification_type: {
      type: String,
      required: false,
    },
    notification_message: {
      type: String,
      required: false,
    },
    notification_pulled_status: {
      type: Boolean,
      required: false,
    },
    notification_read_status: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = require("mongoose").model("Notification", notificationSchema);

module.exports = Notification;
