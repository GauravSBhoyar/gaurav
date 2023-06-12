const { Property, Room, Pricing, RoomCategory } = require("../models");
const { getBookingInfoByBookingId } = require("./booking.service");
const Logger = require("../utilities/logger");

const getRoomsForUser = async (filters) => {
    try {
        filters.room_Ids = filters.room_Ids.split(",");
        return await Room.aggregate([
            {
                $match: {
                    _id: {
                        $in: filters.room_Ids,
                    },
                },
            },
        ]);
    } catch (err) {
        Logger.error(err);
        return;
    }
};

const getPricingListByPropertyId = (propertyId) => {
    try {
        return Promise.resolve(
            Pricing.find({ pricing_property_id: propertyId })
                .then((pricingInfo) => {
                    return pricingInfo;
                })
                .catch((err) => {
                    Logger.error(err);
                    return "error";
                })
        ).catch((err) => {
            Logger.error(err);
            return "error";
        });
    } catch (err) {
        Logger.error(err);
        return "error";
    }
};

const insertUpdatePricingList = async (pricingInfo) => {
    let message = "error";
    try {
        await RoomCategory.updateOne(
            {
                property_id: pricingInfo.pricing_property_id,
                "category_basic_info.name": pricingInfo.category_name,
            },
            {
                $set: {
                    "category_base_pricing.base_occupancy":
                        pricingInfo.individual.base_occupancy,
                    "category_base_pricing.extra_adult":
                        pricingInfo.individual.extra_adult,
                    "category_base_pricing.extra_child":
                        pricingInfo.individual.extra_child,
                    "category_base_pricing.max_guests":
                        pricingInfo.individual.max_guests,
                    "category_base_pricing.base_price":
                        pricingInfo.individual.weekdays.base_price,
                    "category_base_pricing.extra_adult_price":
                        pricingInfo.individual.weekdays.extra_adult_price,
                    "category_base_pricing.extra_child_price.child_range_one_price":
                        pricingInfo.individual.weekdays.extra_child_price
                            .child_range_one_price,
                    "category_base_pricing.extra_child_price.child_range_two_price":
                        pricingInfo.individual.weekdays.extra_child_price
                            .child_range_two_price,
                    "category_group_booking.per_person_cost":
                        pricingInfo.group.weekdays.per_person_cost,
                    "category_group_booking.base_price":
                        pricingInfo.group.weekdays.base_price,
                    "category_group_booking.booking_capacity":
                        pricingInfo.group.booking_capacity,
                    "category_group_booking.no_cost_child":
                        pricingInfo.group.no_cost_child,
                },
            }
        )
            .then(async (result) => {
                if (result.modifiedCount === 0) {
                    let pricingCount = await Pricing.countDocuments({
                        pricing_property_id: pricingInfo.pricing_property_id,
                        category_name: pricingInfo.category_name,
                    });
                    if (pricingCount === 1) {
                        await Pricing.updateOne(
                            {
                                pricing_property_id:
                                    pricingInfo.pricing_property_id,
                                category_name:
                                    pricingInfo.category_name,
                            },
                            {
                                "individual.base_occupancy":
                                    pricingInfo.individual.base_occupancy,
                                "individual.extra_adult":
                                    pricingInfo.individual.extra_adult,
                                "individual.extra_child":
                                    pricingInfo.individual.extra_child,
                                "individual.max_guests":
                                    pricingInfo.individual.max_guests,
                                "individual.weekdays.base_price":
                                    pricingInfo.individual.weekdays
                                        .base_price,
                                "individual.weekdays.extra_adult_price":
                                    pricingInfo.individual.weekdays
                                        .extra_adult_price,
                                "individual.weekdays.extra_child_price.child_range_one_price":
                                    pricingInfo.individual.weekdays
                                        .extra_child_price
                                        .child_range_one_price,
                                "individual.weekdays.extra_child_price.child_range_two_price":
                                    pricingInfo.individual.weekdays
                                        .extra_child_price
                                        .child_range_two_price,
                                "individual.weekends.base_price":
                                    pricingInfo.individual.weekends
                                        .base_price,
                                "individual.weekends.extra_adult_price":
                                    pricingInfo.individual.weekends
                                        .extra_adult_price,
                                "individual.weekends.extra_child_price.child_range_one_price":
                                    pricingInfo.individual.weekends
                                        .extra_child_price
                                        .child_range_one_price,
                                "individual.weekends.extra_child_price.child_range_two_price":
                                    pricingInfo.individual.weekends
                                        .extra_child_price
                                        .child_range_two_price,
                                "group.weekdays.per_person_cost":
                                    pricingInfo.group.weekdays.per_person_cost,
                                "group.weekdays.base_price":
                                    pricingInfo.group.weekdays.base_price,
                                "group.weekends.per_person_cost":
                                    pricingInfo.group.weekends.per_person_cost,
                                "group.weekends.base_price":
                                    pricingInfo.group.weekends.base_price,
                                "group.booking_capacity":
                                    pricingInfo.group.booking_capacity,
                                "group.no_cost_child":
                                    pricingInfo.group.no_cost_child,
                            }
                        )
                            .then((result) => {
                                if (result.modifiedCount == 1) {
                                    message = "Pricing updated";
                                } else {
                                    message = "Pricing not updated";
                                    throw new Error(message);
                                }
                            })
                            .catch((err) => {
                                Logger.error(err);
                                return "error";
                            });
                    }
                }
            })
            .catch((err) => {
                Logger.error(err);
                return "error";
            });
        return message;
    } catch (err) {
        Logger.error(err);
        return "error";
    }
};

const updateRoomStatus = (roomId, roomStatus) => {
    return Promise.resolve(
        Room.updateOne({ _id: roomId }, { room_status: roomStatus })
            .then((roomStatusUpdate) => {
                if (roomStatusUpdate.modifiedCount) {
                    return roomStatusUpdate;
                }
                return "error";
            })
            .catch((err) => {
                Logger.error(err);
                return "error";
            })
    ).catch((err) => {
        Logger.error(err);
        return "error";
    });
};

const updateCategory = (
    categoryId,
    categoryBasicInfo,
    categoryExtraBed,
    categoryBasePricing,
    categoryAvailability,
    categoryAmenities,
    categoryGroupBooking,
    propertyLocation,
    category_weekend_base_pricing,
    category_weekend_group_booking
) => {
    return Promise.resolve(
        RoomCategory.updateOne(
            {
                _id: categoryId,
            },
            {
                category_basic_info: categoryBasicInfo,
                category_extra_bed: categoryExtraBed,
                category_base_pricing: categoryBasePricing,
                category_availability: categoryAvailability,
                category_amenities: categoryAmenities,
                category_group_booking: categoryGroupBooking,
                property_location: propertyLocation,
                category_weekend_base_pricing:  category_weekend_base_pricing,
                category_weekend_group_booking: category_weekend_group_booking,
            }
        )
            .then((categoryUpdate) => {
                if (categoryUpdate.modifiedCount == 1) {
                    return categoryUpdate;
                }
                return "error";
            })
            .catch((err) => {
                Logger.error(err);
                return "error";
            })
    )
        .then((result) => {
            if (!result) return "error";
        })
        .catch((err) => {
            Logger.error(err);
            return "error";
        });
};

const getAllRooms = (categoryId) => {
    return Promise.resolve(
        Room.find({ category_id: categoryId }).then((result) => result)
    ).catch((err) => {
        Logger.error(err);
        return "error";
    });
};

const getAllCategories = (propertyId) => {
    return Promise.resolve(
        RoomCategory.find({ property_id: propertyId })
            .then(async (categories) => {
                if (!categories) return "error";
                for (let cat of categories) {
                    cat._doc.rooms = await getAllRooms(cat._id)
                }
                return categories
            })
    ).catch((err) => {
        Logger.error(err);
        return "error";
    });
};

const createCategory = (
    propertyId,
    categoryBasicInfo,
    categoryExtraBed,
    categoryBasePricing,
    categoryAvailability,
    categoryAmenities,
    categoryGroupBooking,
    propertyLocation,
    category_weekend_base_pricing,
    category_weekend_group_booking

) => {
    return Promise.resolve(Property.countDocuments({ _id: propertyId })).then(
        (result) => {
            if (!result) return "error";
            return Promise.resolve(new RoomCategory({
                property_id: propertyId,
                category_basic_info: categoryBasicInfo,
                category_extra_bed: categoryExtraBed,
                category_base_pricing: categoryBasePricing,
                category_availability: categoryAvailability,
                category_amenities: categoryAmenities,
                category_group_booking: categoryGroupBooking,
                property_location: propertyLocation,
                category_weekend_base_pricing: category_weekend_base_pricing,
                category_weekend_group_booking: category_weekend_group_booking
            })
                .save()
                .then((result) => result._id)
                .catch((err) => {
                    Logger.error(err);
                    return "error";
                })
            )
        }
    );
};
// const createCategory = (
//     propertyId,
//     categoryBasicInfo,
//     categoryExtraBed,
//     categoryBasePricing,
//     categoryAvailability,
//     categoryAmenities,
//     categoryGroupBooking,
//     propertyLocation
// ) => {
//     return Promise.resolve(Property.countDocuments({ _id: propertyId })).then(
//         (result) => {
//             if (!result) return "error";
//             return Promise.resolve(new RoomCategory({
//                 property_id: propertyId,
//                 category_basic_info: categoryBasicInfo,
//                 category_extra_bed: categoryExtraBed,
//                 category_base_pricing: categoryBasePricing,
//                 category_availability: categoryAvailability,
//                 category_amenities: categoryAmenities,
//                 category_group_booking: categoryGroupBooking,
//                 property_location: propertyLocation,
//             })
//                 .save()
//                 .then((result) => result._id)
//                 .catch((err) => {
//                     Logger.error(err);
//                     return "error";
//                 })
//             )
//         }
//     );
// };

const createRoom = (
    propertyId,
    categoryId,
    roomName,
    roomStatus,
) => {
    return Promise.resolve(RoomCategory.countDocuments({ _id: categoryId, property_id: propertyId }))
        .then(
            (result) => {
                if (!result) return "error";
                return Promise.resolve(new Room({
                    property_id: propertyId,
                    category_id: categoryId,
                    room_name: roomName,
                    room_status: roomStatus,
                })
                    .save()
                    .then((result) => result._id)
                    .catch((err) => {
                        Logger.error(err);
                        return "error";
                    })
                )
            }
        )
        .catch((err) => {
            console.log("error")
            Logger.error(err);
            return "error"
        });
}

/* const updateRoom = (
    propertyId,
    categoryId,
    roomName,
) => {
    return Promise.resolve(RoomCategory.countDocuments({ _id: categoryId, property_id: propertyId }))
        .then(
            (result) => {
                if (!result) return "error";
                return Promise.resolve(Room.updateOne({
                    property_id: propertyId,
                    category_id: categoryId,
                }, {
                    category_id: categoryId,
                    room_name: roomName,
                })
                    .then((result) => result._id)
                    .catch((err) => {
                        Logger.error(err);
                        return "error";
                    })
                )
            }
        )
        .catch((err) => {
            console.log("error")
            Logger.error(err);
            return "error"
        });
} */

const getRoomsByPropertyId = (propertyId) => {
    return Promise.resolve(
        Room.find(
            { property_id: propertyId },
            "_id property_id category_id room_name room_status room_booking_id createdAt updatedAt "
        )
            .then(async (rooms) => {
                let roomsInfo = rooms.map(async (room) => {
                    let roomWithBookingInfo = Object.assign({}, room._doc);
                    roomWithBookingInfo.booking_info =
                        room.room_status === "Booked"
                            ? await getBookingInfoByBookingId(
                                room.room_booking_id
                            )
                            : "";
                    roomWithBookingInfo.category_name =
                        room.category_name;
                    roomWithBookingInfo.room_name =
                        room.room_name;
                    return roomWithBookingInfo;
                });
                return Promise.all(roomsInfo).then((roomsWithBookingInfo) => {
                    return roomsWithBookingInfo;
                });
            })
            .catch((err) => {
                Logger.error(err);
                return "error";
            })
    ).catch((err) => {
        Logger.error(err);
        return "error";
    });
};

const getCategoryNames = async (query) => {
    return RoomCategory.find(
        {
            property_id: query.property_id,
        },
        "category_basic_info.name"
    ).then((result) => {
        return result.map((v, i, a) => {
            return {
                _id: v._id,
                room_category: v.category_basic_info.name,
            };
        });
    });
};

const addToFeaturedList = async (params) => {
    return RoomCategory.updateOne(
        { _id: params.id },
        { added_to_featured: true }
    ).then((result) => {
        if (!result.modifiedCount) {
            return "ERR";
        }
        return result.modifiedCount;
    });
};

// const addToFeaturedList = async (params) => {
//     return RoomCategory.updateOne(
//         { _id: params.id },
//         { added_to_featured: true }
//     ).then((result) => {
//         if (!result.modifiedCount) {
//             return "ERR";
//         }
//         return result.modifiedCount;
//     });
// };

const deleteFeatured = async (params) => {
    return RoomCategory.updateOne(
        { _id: params.id },
        { added_to_featured: false }
    ).then((result) => {
        if (!result.modifiedCount) {
            return "ERR";
        }
        return result.modifiedCount;
    });
};



// const addToFeaturedList = async (params) => {
//     return Pricing.updateOne(
//         { _id: params.id },
//         { added_to_featured: true }
//     ).then((result) => {
//         if (!result.modifiedCount) {
//             return "ERR";
//         }
//         return result.modifiedCount;
//     });
// };

// const deleteFeatured = async (params) => {
//     return Pricing.updateOne(
//         { _id: params.id },
//         { added_to_featured: false }
//     ).then((result) => {
//         if (!result.modifiedCount) {
//             return "ERR";
//         }
//         return result.modifiedCount;
//     });
// };

module.exports = {
    getCategoryNames,
    createCategory,
    createRoom,
    //updateRoom,
    getAllRooms,
    getAllCategories,
    getRoomsByPropertyId,
    updateCategory,
    updateRoomStatus,
    insertUpdatePricingList,
    getPricingListByPropertyId,
    addToFeaturedList,
    deleteFeatured,
    getRoomsForUser,
};
