const { Room, Booking, Counter } = require("../models/");
const { isBetween } = require("./dateTimeChecker");
const Logger = require("./logger");

const checkBooking = async (roomIds, inTime, outTime) => {
    let selectedRoom = "";
    for (const id of roomIds) {
        if (selectedRoom != "") break;
        let booking = await Booking.find({
            booking_room_id: id,
            booking_status: { $in: ["Scheduled", "Ongoing"] },
        });
        if (booking.length != 0) {
            for (const { checkIn_date_time, checkOut_date_time } of booking) {
                if (checkIn_date_time && checkOut_date_time) {
                    if (
                        !isBetween(
                            inTime,
                            outTime,
                            checkIn_date_time,
                            checkOut_date_time
                        )
                    ) {
                        selectedRoom = id;
                    } else {
                        break;
                    }
                }
            }
        } else {
            selectedRoom = id;
            break;
        }
    }
    return selectedRoom;
};

const checkInController = async () => {
    try {
        let isoDate = new Date();
        Logger.info("Executing adhoc checkInController at: " + isoDate);
        let currentDate = isoDate
            .toLocaleString("en-US", {
                timeZone: process.env.LOCAL_TZ,
                hour12: false,
            })
            .split(",")[0]
            .split("/");
        currentDate =
            currentDate[2] +
            "-" +
            currentDate[0].padStart(2, "0") +
            "-" +
            currentDate[1].padStart(2, "0");
        let currentTime = isoDate
            .toLocaleString("en-US", {
                timeZone: process.env.LOCAL_TZ,
                hour12: false,
            })
            .split(",")[1]
            .trim(" ")
            .split(":");
        currentTime =
            currentTime[0].padStart(2, "0") +
            ":" +
            currentTime[1].padStart(2, "0");
        let checkInBookingIds = await Booking.aggregate([
            {
                $match: {
                    checkIn_date_time: currentDate,
                },
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "booking_room_id",
                    foreignField: "_id",
                    as: "room_info",
                },
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "room_info.property_id",
                    foreignField: "_id",
                    as: "property_info",
                },
            },
            {
                $project: {
                    booking_room_id: "$booking_room_id",
                    checkin_time: {
                        $arrayElemAt: [
                            "$property_info.property_policies.checkin_time",
                            0,
                        ],
                    },
                },
            },
        ]);

        for (const bookingId of checkInBookingIds) {
            if (bookingId.checkin_time === currentTime) {
                await Booking.updateOne(
                    { _id: bookingId._id },
                    { booking_status: "Ongoing" }
                );
                await Room.updateOne(
                    { _id: bookingId.booking_room_id },
                    {
                        room_booking_id: bookingId._id,
                        room_status: "Booked",
                    }
                );
                await Counter.updateOne(
                    { counter_type: "Admin" },
                    { $inc: { check_ins_today: 1 } },
                    { upsert: true }
                );
            }
            if (currentTime > bookingId.checkin_time) {
                await Booking.updateOne(
                    { _id: bookingId._id },
                    { booking_status: "Ongoing" }
                );
                await Room.updateOne(
                    { _id: bookingId.booking_room_id },
                    {
                        room_booking_id: bookingId._id,
                        room_status: "Booked",
                    }
                );
                await Counter.updateOne(
                    { counter_type: "Admin" },
                    { $inc: { check_ins_today: 1 } },
                    { upsert: true }
                );
            }
        }
    } catch (err) {
        Logger.error(err);
    }
}

module.exports = { checkBooking };
