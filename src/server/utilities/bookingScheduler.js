const CronJob = require("cron").CronJob;
const { Room, Booking, Counter } = require("../models/");
const Logger = require("./logger");

const cronJobs = () => {
    let checkInController = new CronJob(
        "* * * * *",
        async () => {
            try {
                let isoDate = new Date();
                Logger.info("Executing checkInController at: " + isoDate);
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
        },
        exitScheduler,
        false
    );
    checkInController.start();

    let checkOutController = new CronJob(
        "* * * * *",
        async () => {
            try {
                let isoDate = new Date();
                Logger.info("Executing checkOutController at: " + isoDate);
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
                let checkOutBookingIds = await Booking.aggregate([
                    {
                        $match: {
                            checkOut_date_time: currentDate,
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
                            checkout_time: {
                                $arrayElemAt: [
                                    "$property_info.property_policies.checkout_time",
                                    0,
                                ],
                            },
                        },
                    },
                ]);
                for (const bookingId of checkOutBookingIds) {
                    if (bookingId.checkout_time === currentTime) {
                        await Booking.updateOne(
                            { _id: bookingId._id },
                            { booking_status: "Completed" }
                        );
                        await Room.updateOne(
                            { _id: bookingId.booking_room_id },
                            {
                                room_booking_id: bookingId._id,
                                room_status: "Available",
                            }
                        );
                    }
                }
            } catch (err) {
                Logger.error(err);
            }
        },
        exitScheduler,
        false
    );
    checkOutController.start();

    let counterController = new CronJob(
        "0 0 * * *",
        async () => {
            try {
                let isoDate = new Date();
                Logger.info("Executing counterController at: " + isoDate);
                Counter.findOne({ counter_type: "Admin" }).then(
                    async (result) => {
                        await Counter.updateOne(
                            { counter_type: "Admin" },
                            {
                                $set: {
                                    check_ins_previous: result.check_ins_today,
                                    check_ins_today: 0,
                                    booking_previous: result.booking_today,
                                    booking_today: 0,
                                    amount_previous: result.amount_today,
                                    amount_today: 0,
                                    revenue_previous: result.revenue_today,
                                    revenue_today: 0,
                                    visits_previous: result.visits_today,
                                    visits_today: 0,
                                    settlement_checkouts_previous:
                                        result.settlement_checkouts_today,
                                    settlement_checkouts_today: 0,
                                },
                            }
                        );
                    }
                );
            } catch (err) {
                Logger.error(err);
            }
        },
        exitScheduler,
        false,
        "Asia/Kolkata"
    );
    counterController.start();
};

const exitScheduler = () => {
    let isoDate = new Date();
    Logger.info("Exiting scheduler at: " + isoDate);
};

module.exports = { cronJobs };
