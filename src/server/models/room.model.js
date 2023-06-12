const roomSchema = new (require("mongoose").Schema)(
  {
    property_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Property",
    },
    category_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "RoomCategory",
    },
    room_name: {
      type: String,
      required: false,
    },
    room_status: {
      // 1 - available, 2 - book online, 3 - book offline, 4 - block, 5 - inactive
      type: String,
      default: "Available",
      required: false,
    },
    room_booking_id: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Room = require("mongoose").model("Room", roomSchema);

module.exports = Room;
