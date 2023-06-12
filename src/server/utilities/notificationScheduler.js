const CronJob = require("cron").CronJob;
const { Booking, Notification } = require("../models");
const Logger = require("./logger");

const notificationCronJobs = () => {
    let notificationCheckIn = new CronJob(
        "0 9 * * *",
        async () => {
            try {
                let isoDate = new Date();
                Logger.info("Executing notificationController at: " + isoDate);
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
                //let lastRun = new Data(Date.now() - 60*1000);
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
                            //user_id: "$booking_user_id",
                            user_id: "$booking_vendor_id",
                            property_id: {
                                $arrayElemAt: [
                                    "$room_info.property_id",
                                    0
                                ]
                            },
                            booking_full_name: "$booking_full_name",
                            property_name: {
                                $arrayElemAt: [
                                    "$property_info.property_basic_info.property_name",
                                    0
                                ]
                            },
                            room_name: {
                                $arrayElemAt: [
                                    "$room_info.room_basic_info.room_name",
                                    0
                                ]
                            },
                        },
                    },
                ]);
                for (const bookingId of checkInBookingIds) {
                    new Notification(
                        {
                            notification_user_id: bookingId.user_id,
                            notification_type: 'today_checkins',
                            notification_message: `Guest: ${bookingId.booking_full_name}, Property: ${bookingId.property_name}, Room: ${bookingId.room_name}`,
                            notification_pulled_status: false,
                            notification_read_status: false
                        }
                    ).save();
                }
            } catch (err) {
                Logger.error(err);
            }
        },
        exitNotificationScheduler,
        false
    );
    notificationCheckIn.start();
};

const exitNotificationScheduler = () => {
    let isoDate = new Date();
    Logger.info("Exiting notification scheduler at: " + isoDate);
};

module.exports = { notificationCronJobs };
