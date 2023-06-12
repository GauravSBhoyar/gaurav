const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const Logger = require("../utilities/logger");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuid } = require("uuid");

const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();

app.use(fileUpload());
const { User, AmenityImage, RoomCategory, Room, Pricing, PropertyImage, CategoryImage, Property } = require("../models");

const {
    getVendorProfileInfo,
    createProperty,
    createCategory,
    updateCategory,
    createRoom,
    getRoomsByPropertyId,
    getAllCategories,
    updateProperty,
    updateRoomStatus,
    getPropertyByVendorId,
    doBooking,
    getBookingListByVendorId,
    getDashboardInfo,
    getPricingListByPropertyId,
    insertUpdatePricingList,
    getActivityByPropertyId,
    insertUpdateVendorActivity,
    getPropertyImages,
    getPropertyDocs,
} = require("../services");
const Financeimage = require("../models/financelegal.model");
const { getBookingListByVendorIdCancelled, getBookingListByVendorIdCompleted, getBookingListByVendorIdUpcoming } = require("../services/booking.service");

//     await passport.authenticate(
//         "user-jwt",
//         { session: false },
//         (err, user, info) => {
//             if (err) {
//                 res.error = err || info.message;
//                 return next(401);
//             }
//             if (!user) {
//                 res.error = info.message;
//                 return next(401);
//             }
//             let s3 = new aws.S3();
//             let uploadedFileIds = [];
//             let fileUpload = multer({
//                 storage: multerS3({
//                     s3,
//                     bucket: process.env.AWS_BUCKET,
//                     metadata: (req, file, cb) => {
//                         cb(null, { fieldName: file.fieldname });
//                     },
//                     key: (req, file, cb) => {
//                         let fileId = uuid();
//                         let folderName = 'amenity-image/';
//                         uploadedFileIds.push({
//                             file_id: fileId,
//                             file_fieldname: file.fieldname,
//                         });
//                         req["file_ids"] = uploadedFileIds;
//                         cb(null, folderName + fileId);
//                     },
//                 }),
//             }).single("amenity_images");

//             fileUpload(req, res, (err) => {
//                 if (err) {
//                     Logger.error(err);
//                     res.error = "Failed to insert amenity images";
//                     return next(500);
//                 } else {
//                     try {
//                         let data = {};
//                         let body = {};
//                         Object.assign(body, req.body);
//                         Object.assign(data, req["file_ids"]["0"]);
//                         data["file_category"] = body.category;
//                         AmenityImage.findOneAndUpdate(
//                             {
//                                 category_id: body.category_id,
//                                 vendor_id: user._id,
//                             },
//                             {
//                                 category_id: body.category_id,
//                                 $push: { file_ids: data },
//                             },
//                             { upsert: true, new: true }
//                         ).then((result) => {
//                             if (!result) {
//                                 res.error = "Failed to insert amenity images";
//                                 return next(500);
//                             }
//                             res.message =
//                                 "Inserted amenity images successfully";
//                             return next(200);
//                         });
//                     } catch (err) {
//                         Logger.error(err);
//                         res.error = "Failed to insert amenity images";
//                         return next(500);
//                     }
//                 }
//             });
//         }
//     )(req, res, next);
// });


// const uploadAmenityImage = catchAsync(async (req, res, next) => {
//     await passport.authenticate(
//       "user-jwt",
//       { session: false },
//       (err, user, info) => {
//         if (err) {
//           console.error(err || info.message);
//           res.error = err || info.message;
//           return next(401);
//         }
//         if (!user) {
//           console.error(info.message);
//           res.error = info.message;
//           return next(401);
//         }

//         console.log("User authenticated successfully");

//         const s3 = new aws.S3();
//         const uploadedFileIds = [];
//         const fileUpload = multer({
//           storage: multerS3({
//             s3,
//             bucket: process.env.AWS_BUCKET,
//             metadata: (req, file, cb) => {
//               cb(null, { fieldName: file.fieldname });
//             },
//             key: (req, file, cb) => {
//               const fileId = uuid();
//               const folderName = "amenity-image/";
//               uploadedFileIds.push({
//                 file_id: fileId,
//                 file_fieldname: file.fieldname,
//               });
//               req["file_ids"] = uploadedFileIds;
//               cb(null, folderName + fileId);
//             },
//           }),
//         }).single("amenity_images");

//         fileUpload(req, res, (err) => {
//           if (err) {
//             console.error(err);
//             res.error = "Failed to insert amenity images";
//             return next(500);
//           } else {
//             try {
//               const data = {};
//               const body = {};
//               Object.assign(body, req.body);
//               Object.assign(data, req["file_ids"]["0"]);
//               data["file_category"] = body.category;

//               AmenityImage.findOneAndUpdate(
//                 {
//                   category_id: body.category_id,
//                   vendor_id: user._id,
//                 },
//                 {
//                   category_id: body.category_id,
//                   $push: { file_ids: data },
//                 },
//                 { upsert: true, new: true }
//               ).then((result) => {
//                 if (!result) {
//                   console.error("Failed to insert amenity images");
//                   res.error = "Failed to insert amenity images";
//                   return next(500);
//                 }
//                 console.log("Inserted amenity images successfully");
//                 res.message = "Inserted amenity images successfully";
//                 return next(200);
//               });
//             } catch (err) {
//               console.error(err);
//               res.error = "Failed to insert amenity images";
//               return next(500);
//             }
//           }
//         });
//       }
//     )(req, res, next);
//   });


// const uploadPropertyImage = async (req, res, next) => {
//     try {
//       const s3 = new aws.S3();
//       const uploadedFiles = [];

//     const fileUpload = multer({
//       storage: multerS3({
//         s3,
//         bucket: process.env.AWS_BUCKET,
//         // acl: "public-read",
//         key: (req, file, cb) => {
//           const timestamp = Date.now().toString();
//           const propertyId = req.body.property_id;
//           const path = `property-images/${propertyId}/${timestamp}/${file.originalname}`;
//           uploadedFiles.push({ path });
//           cb(null, path);
//         },
//       }),
//     }).single("property_image");

//     fileUpload(req, res, async (err) => {
//       if (err) {
//         console.error(err);
//         res.error = "Failed to insert property image";
//         return next(400);
//       }

//       const filePath = req.file.location;
//       const propertyId = req.body.property_id;
//     //   const vendorId = req.user._id;

//       const propertyImage = new PropertyImage({
//         // vendor_id: vendorId,
//         property_id: propertyId,
//         file_paths: [
//           {
//             path: filePath,
//             file_category: "property",
//             file_size: req.file.size,
//           },
//         ],
//       });

//       const result = await propertyImage.save();
//       if (!result) {
//         console.error("Failed to insert property image");
//         res.error = "Failed to insert property image";
//         return next(500);
//       }

//       console.log("Inserted property image successfully");
//       res.message = "Inserted property image successfully";
//       return next(200);
//     });
//   } catch (err) {
//     console.error(err);
//     res.error = "Failed to insert property image";
//     return next(500);
//   }
// };

const uploadPropertyImage = async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                console.error(err || info.message);
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                console.error(info.message);
                res.error = info.message;
                return next(401);
            }
            try {
                const s3 = new aws.S3();
                const uploadedFiles = [];

                const fileUpload = multer({
                    storage: multerS3({
                        s3,
                        bucket: process.env.AWS_BUCKET,
                        metadata: (req, file, cb) => {
                            cb(null, { fieldName: file.fieldname });
                        },
                        key: (req, file, cb) => {
                            const timestamp = Date.now().toString();
                            const property_id = req.body.property_id;
                            console.log(req.body.property_id)
                            const path = `property-images/${timestamp}/${file.originalname}`;
                            uploadedFiles.push({ path });
                            cb(null, path);
                        },
                    }),
                }).single("property_image");

                fileUpload(req, res, async (err) => {
                    if (err) {
                        console.error(err);
                        res.error = "Failed to insert property image";
                        return next(400);
                    }
                    try {
                        const data = {};
                        const body = {};
                        Object.assign(body, req.body);
                        Object.assign(data, uploadedFiles[0]);
                        data["file_category"] = body.category;
                        data["file_size"] = req.file.size;

                        //   console.log(user._id);

                        //   const filePath = req.file.location;
                        const propertyId = req.body.property_id;
                        // console.log(body.property_id)

                        const propertyImage = new PropertyImage({
                            // vendor_id: vendorId,
                            property_id: body.property_id,
                            file_paths: [data],
                        });

                        const result = await propertyImage.save();
                        if (!result) {
                            console.error("Failed to insert property image");
                            res.error = "Failed to insert property image";
                            return next(500);
                        }

                        console.log("Inserted property image successfully");
                        res.message = "Inserted property image successfully";
                        return next(200);


                    } catch (err) {
                        console.error(err);
                        res.error = "Failed to insert property image";
                        return next(500);
                    }
                });
            } catch (err) {
                console.error(err);
                res.error = "Failed to insert property image";
                return next(500);
            }
        })(req, res, next)
}


const uploadCatImage = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                console.error(err || info.message);
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                console.error(info.message);
                res.error = info.message;
                return next(401);
            }

            console.log("User authenticated successfully");
            // AmenityImage.drop((err) => {
            //     if (err) {
            //       console.log('Error dropping collection:', err);
            //     } else {
            //       console.log('Collection dropped successfully');
            //     }
            //   });
            const s3 = new aws.S3();
            const uploadedFiles = [];
            const fileUpload = multer({
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_BUCKET,
                    metadata: (req, file, cb) => {
                        cb(null, { fieldName: file.fieldname });
                    },
                    key: (req, file, cb) => {
                        const timestamp = Date.now().toString();
                        const category_id = req.body.category_id;
                        const path = `Category-images/${category_id}/${timestamp}/${file.originalname}`;
                        uploadedFiles.push({ path });
                        cb(null, path);
                    },
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                }),
            }).single("category-Image");

            fileUpload(req, res, async (err) => {
                if (err) {
                    console.error(err);
                    res.error = "Failed to insert category images";
                    return next(500);
                } else {
                    try {
                        const data = {};
                        const body = {};
                        Object.assign(body, req.body);
                        Object.assign(data, uploadedFiles[0]);
                        data["file_category"] = body.category;
                        data["file_size"] = req.file.size;

                        console.log(user._id);

                        const categoryImage = new CategoryImage({
                            category_id: body.category_id,
                            file_paths: [data],
                            vendor_id: user._id,
                        });

                        const result = await categoryImage.save();
                        if (!result) {
                            console.error("Failed to insert category images");
                            res.error = "Failed to insert category images";
                            return next(500);
                        }
                        console.log("Inserted category images successfully");
                        res.message = "Inserted category images successfully";
                        return next(200);
                    } catch (err) {
                        console.error(err);
                        res.error = "Failed to insert category images";
                        return next(500);
                    }
                }
            });
        }
    )(req, res, next);
});


const uploadAmenityImage = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                console.error(err || info.message);
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                console.error(info.message);
                res.error = info.message;
                return next(401);
            }

            console.log("User authenticated successfully");

            const s3 = new aws.S3();
            const uploadedFiles = [];
            const fileUpload = multer({
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_BUCKET,
                    metadata: (req, file, cb) => {
                        cb(null, { fieldName: file.fieldname });
                    },
                    key: (req, file, cb) => {
                        const timestamp = Date.now().toString();
                        const category = req.body.category_id;
                        const path = `amenity-images/${category}/${timestamp}/${file.originalname}`;
                        uploadedFiles.push({ path });
                        cb(null, path);
                    },
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                }),
            }).single("amenity_images");

            fileUpload(req, res, async (err) => {
                if (err) {
                    console.error(err);
                    res.error = "Failed to insert amenity images";
                    return next(500);
                } else {
                    try {
                        const data = {};
                        const body = {};
                        Object.assign(body, req.body);
                        Object.assign(data, uploadedFiles[0]);
                        data["file_category"] = body.category;
                        data["file_size"] = req.file.size;

                        console.log(user._id);

                        const amenityImage = new AmenityImage({
                            category_id: body.category_id,
                            file_paths: [data],
                            vendor_id: user._id,
                        });

                        const result = await amenityImage.save();
                        if (!result) {
                            console.error("Failed to insert amenity images");
                            res.error = "Failed to insert amenity images";
                            return next(500);
                        }
                        console.log("Inserted amenity images successfully");
                        res.message = "Inserted amenity images successfully";
                        return next(200);
                    } catch (err) {
                        console.error(err);
                        res.error = "Failed to insert amenity images";
                        return next(500);
                    }
                }
            });
        }
    )(req, res, next);
});

const getAmenities = catchAsync(async (req, res, next) => {
    try {
        const amenityImages = await AmenityImage.find({ category_id: req.query.category_id }).exec();
        if (!amenityImages) {
            res.error = "No amenity images found";
            return next(404);
        }

        const s3 = new aws.S3();
        const imagePromises = [];

        amenityImages.forEach((amenityImage) => {
            amenityImage.file_paths.forEach((filePath) => {
                imagePromises.push(
                    s3.getObject({
                        Bucket: process.env.AWS_BUCKET,
                        Key: filePath.path,
                    }).promise()
                );
            });
        });

        Promise.allSettled(imagePromises)
            .then((results) => {
                const images = [];

                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        const amenityImage = amenityImages[Math.floor(index / amenityImages.length)];
                        const filePath = amenityImage.file_paths[index % amenityImage.file_paths.length];
                        images.push({
                            amenity_image_id: amenityImage._id,
                            category_id: amenityImage.category_id,
                            image_id: filePath._id,
                            // image_file: result.value.Body,
                            file_size: filePath.file_size,
                            path: filePath.path,
                            file_category: filePath.file_category,
                        });
                    } else {
                        images.push({
                            error: `Failed to get image ${index}: ${result.reason}`,
                        });
                    }
                });

                res.data = images;
                return next(200);
            })
            .catch((error) => {
                console.error(`Error getting amenity images from S3: ${error}`);
                res.error = "Failed to get amenity images";
                return next(500);
            });
    } catch (error) {
        console.error(`Error getting amenity images: ${error}`);
        res.error = "Failed to get amenity images";
        return next(500);
    }
});

// const financeImage = catchAsync(async (req, res, next) => {
//     await passport.authenticate(
//         "user-jwt",
//         { session: false },
//         (err, user, info) => {
//             if (err) {
//                 console.error(err || info.message);
//                 res.error = err || info.message;
//                 return next(401);
//             }
//             if (!user) {
//                 console.error(info.message);
//                 res.error = info.message;
//                 return next(401);
//             }

//             console.log("User authenticated successfully");
//             // AmenityImage.drop((err) => {
//             //     if (err) {
//             //       console.log('Error dropping collection:', err);
//             //     } else {
//             //       console.log('Collection dropped successfully');
//             //     }
//             //   });
//             const s3 = new aws.S3();
//             const uploadedFiles = [];
//             console.log(req.body)
//             const fileUpload = multer({
//                 storage: multerS3({
//                     s3,
//                     bucket: process.env.AWS_BUCKET,
//                     metadata: (req, file, cb) => {
//                         cb(null, { fieldName: file.fieldname });
//                     },
//                     key: (req, file, cb) => {
//                         const timestamp = Date.now().toString();
//                         const path = `Finance-images/${timestamp}/${file.originalname}`;
//                         uploadedFiles.push({ path });
//                         cb(null, path);
//                     },
//                     contentType: multerS3.AUTO_CONTENT_TYPE,
//                 }),
//             }).single("finance-Image");

//             fileUpload(req, res, async (err) => {
//                 if (err) {
//                     console.error(err);
//                     res.error = "Failed to Insert Finance Imagesssss1111s";
//                     return next(500);
//                 } else {
//                     try {
//                         const data = {};
//                         const body = {};
//                         Object.assign(body, req.body);
//                         Object.assign(data, uploadedFiles[0]);
//                         data["file_category"] = body.category;
//                         data["file_size"] = req.file.size;

//                         console.log(user._id);

//                         const financeLegalImage = new Financeimage({
//                             // finance_id: body.finance_id,
//                             file_paths: [data],
//                             // vendor_id: user._id,
//                         });

//                         const result = await financeLegalImage.save();
//                         if (!result) {
//                             console.error("Failed to insert Finance images");
//                             res.error = "Failed to insert Finance imagesssssssssssssssssssssss";
//                             return next(500);
//                         }
//                         console.log("Inserted Finance images successfully");
//                         res.message = "Inserted Finance images successfully";
//                         return next(200);
//                     } catch (err) {
//                         console.error(err);
//                         res.error = "Failed to insert Finance images.....";
//                         return next(500);
//                     }
//                 }
//             });
//         }
//     )(req, res, next);
// });
const financeImage = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
        if (err) {
            console.error(err || info.message);
            res.error = err || info.message;
            return next(401);
        }
        if (!user) {
            console.error(info.message);
            res.error = info.message;
            return next(401);
        }

        console.log("User authenticated successfully");

        try {
            const s3 = new aws.S3();
            const uploadedFiles = [];

            const fileUpload = multer({
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_BUCKET,
                    metadata: (req, file, cb) => {
                        cb(null, { fieldName: file.fieldname });
                    },
                    key: (req, file, cb) => {
                        const timestamp = Date.now().toString();
                        const path = `Finance-images/${timestamp}/${file.originalname}`;
                        uploadedFiles.push({ path });
                        cb(null, path);
                    },
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                }),
            }).single("finance-Image");

            fileUpload(req, res, async (err) => {
                if (err) {
                    console.error(err);
                    res.error = "Failed to Insert Finance Images";
                    return next(500);
                }

                const data = {};
                const body = { ...req.body };
                Object.assign(data, uploadedFiles[0]);

                data["file_category"] = body.category;
                data["file_size"] = req.file.size;

                console.log(user._id);

                const financeLegalImage = new Financeimage({
                    file_paths: [data],
                });

                const result = await financeLegalImage.save();

                if (!result) {
                    console.error("Failed to insert Finance images");
                    res.error = "Failed to insert Finance images";
                    return next(500);
                }

                console.log("Inserted Finance images successfully");
                res.message = "Inserted Finance Images Successfully";
                return next(200);
            });
        } catch (err) {
            console.error(err);
            res.error = "Failed to insert Finance images";
            return next(500);
        }
    })(req, res, next);
});


const deletePropertyImage = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let response = await PropertyImage.updateOne(
                { vendor_id: user._id, property_id: req.body.data.property_id },
                { $pull: { file_ids: { _id: req.body.data.image_id } } }
            );
            if (response) {
                res.message = "Property Image deleted successfully";
                next(200);
            }
            res.message = "Failed to delete property Image";
            next(500);
        }
    )(req, res, next);
});


const propertyImagesList = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
        if (err) {
            res.error = err || info.message;
            return next(401);
        }

        try {
            const response = await getPropertyImages(user._id, req.query.property_id);

            if (response.length) {
                res.data = response;
                return next(200);
            } else {
                res.error = "No property images";
                return next(404);
            }
        } catch (error) {
            console.error(`Error getting property images: ${error}`);
            res.error = "Failed to get property images";
            return next(500);
        }
    })(req, res, next);
});




const deletePropertyDoc = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let response = await Property.updateOne(
                { _id: req.body.data.property_id },
                { $pull: { "property_finance_legal.registration_details.registration_doc_id": req.body.data.doc_id } }
            );
            if (response) {
                res.message = "Property Document deleted successfully";
                next(200);
            }
            res.message = "Failed to delete property Doc";
            next(500);
        }
    )(req, res, next);
});

const propertyDocsList = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let response = "ERR";
            const { property_id } = req.query;
            response = await getPropertyDocs(property_id);
            if (response.length) {
                res.data = response;
                return next(200);
            }
            res.error = "No property docs";
            return next(500);
        }
    )(req, res, next);
});

const uploadPropertyDoc = catchAsync(async (req, res, next) => {
    passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
        if (err) {
            res.error = err || info.message;
            return next(401);
        }
        if (!user) {
            res.error = info.message;
            return next(401);
        }

        try {
            let s3 = new aws.S3();
            let uploadedFileIds = [];
            let fileUpload = multer({
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_BUCKET,
                    metadata: (req, file, cb) => {
                        cb(null, {
                            fieldName: file.fieldname,
                            fileName: file.originalname,
                            fileMimeType: file.mimetype,
                        });
                    },
                    key: (req, file, cb) => {
                        // console.log(file, "request")
                        let timestamp = Date.now().toString();
                        const path = `Property-docs/${timestamp}/${file.originalname}`
                        uploadedFileIds.push({ path })
                        req.file_ids = uploadedFileIds;
                        cb(null, path);
                    },
                }),
            }).single("property_doc");

            fileUpload(req, res, async (err) => {
                if (err) {
                    Logger.error(err);
                    res.error = "1 - Failed to insert property doc";
                    return next(500);
                } else {
                    let body = { ...req.body }; // Use spread operator for object cloning
                    let fileId = req.file.location; // Accessing the first element of the array


                    const result = await Property.findOneAndUpdate(
                        { _id: body.property_id },
                        {
                            $push: {
                                "property_finance_legal.registration_details.registration_doc_id": fileId,
                            },
                        },
                        { upsert: true, new: true }
                    );

                    if (!result) {
                        res.error = "2 - Failed to insert property doc";
                        return next(500);
                    }

                    res.message = "Inserted property doc successfully";
                    return next(200);
                }
            });
        } catch (err) {
            Logger.error(err);
            res.error = "3 - Failed to insert property doc";
            return next(500);
        }
    })(req, res, next);
});

// const uploadPropertyDoc = catchAsync(async (req, res, next) => {
//     console.log("upload document file")
//     passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user) {
//         res.error = info.message;
//         return next(401);
//       }

//       try {
//         let s3 = new aws.S3();
//         let uploadedFileIds = [];
//         let fileUpload = multer({
//           storage: multerS3({
//             s3,
//             bucket: process.env.AWS_BUCKET,
//             metadata: (req, file, cb) => {
//                 console.log(file, "upload document file")
//               cb(null, {
//                 fieldName: file.fieldname,
//                 fileName: file.originalname,
//                 fileMimeType: file.mimetype,
//               });
//             },
//             key: (req, file, cb) => {
//               let fileId = uuid();
//               uploadedFileIds.push(fileId);
//               req.file_ids = uploadedFileIds;
//               cb(null, fileId);
//             },
//           }),
//         }).single("property_doc");

//         fileUpload(req, res, async (err) => {
//           if (err) {
//             Logger.error(err);
//             res.error = "1 - Failed to insert property doc";
//             return next(500);
//           } else {
//             let body = { ...req.body }; // Use spread operator for object cloning
//             let fileId = req.file_ids[0]; // Accessing the first element of the array

//             console.log(fileId, "file id doc upload api")

//             const result = await Property.findOneAndUpdate(
//               { _id: body.property_id },
//               {
//                 $push: {
//                   "property_finance_legal.registration_details.registration_doc_id": fileId,
//                 },
//               },
//               { upsert: true, new: true }
//             );

//             if (!result) {
//               res.error = "2 - Failed to insert property doc";
//               return next(500);
//             }

//             res.message = "Inserted property doc successfully";
//             return next(200);
//           }
//         });
//       } catch (err) {
//         Logger.error(err);
//         res.error = "3 - Failed to insert property doc";
//         return next(500);
//       }
//     })(req, res, next);
//   }); chnaging this on 20 may 2023

// const uploadPropertyDoc = catchAsync(async (req, res, next) => {
//     await passport.authenticate(
//         "user-jwt",
//         { session: false },
//         (err, user, info) => {
//             if (err) {
//                 res.error = err || info.message;
//                 return next(401);
//             }
//             if (!user) {
//                 res.error = info.message;
//                 return next(401);
//             }
//             let s3 = new aws.S3();
//             let uploadedFileIds = [];
//             let fileUpload = multer({
//                 storage: multerS3({
//                     s3,
//                     bucket: process.env.AWS_BUCKET,
//                     metadata: (req, file, cb) => {
//                         cb(null, {
//                             fieldName: file.fieldname,
//                             fileName: file.originalname,
//                             fileMimeType: file.mimetype,
//                         });
//                     },
//                     key: (req, file, cb) => {
//                         let fileId = uuid();
//                         uploadedFileIds.push(fileId);
//                         req["file_ids"] = uploadedFileIds;
//                         cb(null, fileId);
//                     },
//                 }),
//             }).single("property_doc");

//             fileUpload(req, res, (err) => {
//                 if (err) {
//                     Logger.error(err);
//                     res.error = "1 - Failed to insert property doc";
//                     return next(500);
//                 } else {
//                     {
//                         let body = {};
//                         Object.assign(body, req.body);
//                         let fileId = req["file_ids"]["0"];
//                         Property.findOneAndUpdate(
//                             { _id: body.property_id },
//                             {
//                                 $push: { "property_finance_legal.registration_details.registration_doc_id": fileId }
//                             },
//                             { upsert: true, new: true }
//                         ).then((result) => {
//                             if (!result) {
//                                 res.error = "2 - Failed to insert property doc";
//                                 return next(500);
//                             }
//                             res.message =
//                                 "Inserted property doc successfully";
//                             return next(200);
//                         });
//                     } /* catch (err) {
//                         Logger.error(err);
//                         res.error = "3 - Failed to insert property doc";
//                         return next(500);
//                     } */
//                 }
//             });
//         }
//     )(req, res, next);
// });


const deleteRoom = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let response = await Room.findOneAndDelete({
                _id: req.params.room_id,
            });
            if (response) {
                res.message = "Room deleted successfully";
                next(200);
            }
            else {
                res.message = "Failed to delete room";
                next(500);
            }
        }
    )(req, res, next);
});

/* const updateSingleRoom = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let { body } = req;
            try {
                let response = await Pricing.findOne({
                    pricing_property_id: body.property_id,
                    category_name: body.category_basic_info.name,
                });
                if (response) {
                    body.category_base_pricing = {
                        base_occupancy:
                            response.individual.base_occupancy,
                        extra_adult: response.individual.extra_adult,
                        extra_child: response.individual.extra_child,
                        max_guests: response.individual.max_guests,
                        base_price:
                            response.individual.weekdays.base_price,
                        extra_adult_price:
                            response.individual.weekdays.extra_adult_price,
                        extra_child_price: {
                            child_range_one_price:
                                response.individual.weekdays.extra_child_price
                                    .child_range_one_price,
                            child_range_two_price:
                                response.individual.weekdays.extra_child_price
                                    .child_range_two_price,
                        },
                    };
                } else {
                    new Pricing({
                        pricing_property_id: body.property_id,
                        category_name: body.category_basic_info.name,
                        "individual.base_occupancy":
                            body.category_base_pricing.base_occupancy,
                        "individual.extra_adult":
                            body.category_base_pricing.extra_adult,
                        "individual.extra_child":
                            body.category_base_pricing.extra_child,
                        "individual.max_guests":
                            body.category_base_pricing.max_guests,
                        "individual.weekdays.base_price":
                            body.category_base_pricing.base_price,
                        "individual.weekdays.extra_adult_price":
                            body.category_base_pricing.extra_adult_price,
                        "individual.weekdays.extra_child_price.child_range_one_price":
                            body.category_base_pricing.extra_child_price
                                .child_range_one_price,
                        "individual.weekdays.extra_child_price.child_range_two_price":
                            body.category_base_pricing.extra_child_price
                                .child_range_two_price,
                        "individual.weekends.base_price":
                            body.category_base_pricing.base_price,
                        "individual.weekends.extra_adult_price":
                            body.category_base_pricing.extra_adult_price,
                        "individual.weekends.extra_child_price.child_range_one_price":
                            body.category_base_pricing.extra_child_price
                                .child_range_one_price,
                        "individual.weekends.extra_child_price.child_range_two_price":
                            body.category_base_pricing.extra_child_price
                                .child_range_two_price,
                        "group.weekdays.per_person_cost":
                            body.category_group_booking.per_person_cost,
                        "group.weekdays.base_price":
                            body.category_group_booking.base_price,
                        "group.weekends.per_person_cost":
                            body.category_group_booking.per_person_cost,
                        "group.weekends.base_price":
                            body.category_group_booking.base_price,
                        "group.booking_capacity":
                            body.category_group_booking.booking_capacity,
                        "group.no_cost_child":
                            body.category_group_booking.no_cost_child,
                    }).save();
                }
                response = await Room.updateOne({ _id: body._id }, body);
                if (response.modifiedCount > 0) {
                    res.message = "Room updated successfully";
                    next(200);
                }
                res.message = "Failed to update room";
                next(500);
            } catch (err) {
                Logger.error(err);
                res.message = "Failed to update room";
                next(500);
            }
        }
    )(req, res, next);
}); */

const updateSingleRoom = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let params = { ...req.params }
            let data = { ...req.body }
            let response = "error"
            response = await Room.updateOne(
                { _id: params.room_id },
                data
            )
            if (response.modifiedCount === 1) {
                res.message = "Room updated successfully";
                next(200);
            }
            else {
                res.error = response;
                next(500);
            }
        }
    )(req, res, next);
});

// const uploadActivityImage = catchAsync(async (req, res, next) => {
//     await passport.authenticate(
//         "user-jwt",
//         { session: false },
//         (err, user, info) => {
//             if (err) {
//                 res.error = err || info.message;
//                 return next(401);
//             }
//             if (!user) {
//                 res.error = info.message;
//                 return next(401);
//             }
//             let s3 = new aws.S3();
//             // let uploadedFileIds = [];
//             let fileUpload = multer({
//                 storage: multerS3({
//                     s3,
//                     bucket: process.env.AWS_BUCKET,
//                     metadata: (req, file, cb) => {
//                         cb(null, { fieldName: file.fieldname });
//                     },
//                     key: (req, file, cb) => {
//                         console.log("files in activity")
//                         // let timestamp = Date.now().toString();
//                         // const path = `Activity-Images/${timestamp}/${file.originalname}`
//                         // cb(null, path);
//                         cb(null, req.body["activity_image_id"]);
//                     },
//                 }),
//             }).single("activity_image_id");
//             fileUpload(req, res, (err) => {
//                 if (err) {
//                     Logger.error(err);
//                     res.error = "Failed to insert vendor activity";
//                     return next(500);
//                 } else {
//                     next();
//                 }
//             });
//         }
//     )(req, res, next);
// });



const uploadActivityImage = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let s3 = new aws.S3();
            const uploadedFiles = [];
            let fileUpload = multer({
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_BUCKET,
                    metadata: (req, file, cb) => {
                        cb(null, {
                            fieldName: file.fieldname,
                            fileName: file.originalname,
                            fileMimeType: file.mimetype,
                        });
                    },
                    key: (req, file, cb) => {
                        let timestamp = Date.now().toString();
                        const activity_property_id = req.body.activity_property_id;
                        const path = `Activity-Images/${activity_property_id}/${timestamp}/${file.originalname}`;
                        uploadedFiles.push({ path });
                        req.body["activity_image_file"] = path;
                        cb(null, req.body["activity_image_file"]);
                    },
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                }),
            }).single("activity_image_file");
            fileUpload(req, res, (err) => {
                if (err) {
                    Logger.error(err);
                    res.error = "Failed to insert vendor activity";
                    return next(500);
                } else {
                    next();
                }
            });
        }
    )(req, res, next);
});





const activityList = catchAsync(async (req, res, next) => {
    console.log("code run of list")
    await passport.authenticate(
        "user-jwt",
        { session: false },
        async (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            let response;
            if (req.method === "POST") {
                let data = { ...req.body, [req.body.id]: req.body.value };
                response = await insertUpdateVendorActivity(data).catch(
                    (err) => {
                        Logger.error(err);
                        res.error = "Failed to insert vendor activity";
                        return next(500);
                    }
                );
                switch (response) {
                    case "INSSUC":
                        res.message = "Activity inserted succesfully";
                        return next(200);
                    case "UPDSUC":
                        res.message = "Activity updated succesfully";
                        return next(200);
                    case "INSERR":
                        res.error = "Failed to insert activity";
                        return next(500);
                    case "UPDERR":
                        res.error = "Failed to update activity";
                        return next(500);
                    case "ERR":
                        res.error =
                            "Something went wrong. Please contact administrator";
                        return next(500);
                }
            }
            if (req.method === "GET") {
                let query = { ...req.query };
                console.log(query, "thing to do")
                response = await getActivityByPropertyId(query);
                if (response === "ERR") {
                    res.error = "Failed to fetch activities";
                    return next(500);
                }
                res.data = response;
                return next(200);
            }
        }
    )(req, res, next);
});

const pricingList = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            if (req.query.hasOwnProperty("property_id")) {
                return Promise.resolve(
                    getPricingListByPropertyId(req.query.property_id)
                        .then((result) => {
                            res.data = result;
                            return next(200);
                        })
                        .catch((err) => {
                            Logger.error(err);
                            res.error = "Failed to fetch pricing list";
                            return next(500);
                        })
                );
            }
            return Promise.resolve(
                insertUpdatePricingList(req.body.data)
                    .then((message) => {
                        if (message == "error") {
                            res.error = "Failed to update vendor pricing list";
                            return next(500);
                        }
                        res.message = message;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to update vendor pricing list";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch vendor pricing list";
                return next(500);
            });
        }
    )(req, res, next);
});


const vendorDashboard = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getDashboardInfo(req.query.vendor_id, req.query.property_id)
                    // getDashboardInfo(user._id, req.query.property_id)
                    .then((dashboardInfo) => {
                        if (dashboardInfo == "error") {
                            res.error = "Failed to fetch vendor dashboard";
                            return next(500);
                        }
                        res.data = dashboardInfo;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to fetch vendor dashboard";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch vendor dashboard";
                return next(500);
            });
        }
    )(req, res, next);
});


const bookingHistory = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getBookingListByVendorId(user._id)
                    .then((result) => {
                        if (result.length == 0) {
                            res.message = "No records";
                            return next(200);
                        }
                        res.data = result;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to fetch booking history";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch booking history";
                return next(500);
            });
        }
    )(req, res, next);
});

const bookingHistoryUpcoming = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getBookingListByVendorIdUpcoming(user._id)
                    .then((result) => {
                        if (result.length == 0) {
                            res.message = "No records";
                            return next(200);
                        }
                        res.data = result;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to fetch booking history";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch booking history";
                return next(500);
            });
        }
    )(req, res, next);
});


const bookingHistoryCompleted = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getBookingListByVendorIdCompleted(user._id)
                    .then((result) => {
                        if (result.length == 0) {
                            res.message = "No records";
                            return next(200);
                        }
                        res.data = result;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to fetch booking history";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch booking history";
                return next(500);
            });
        }
    )(req, res, next);
});

const bookingHistoryCancelled = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getBookingListByVendorIdCancelled(user._id)
                    .then((result) => {
                        if (result.length == 0) {
                            res.message = "No records";
                            return next(200);
                        }
                        res.data = result;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to fetch booking history";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to fetch booking history";
                return next(500);
            });
        }
    )(req, res, next);
});



const bookRoom = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }

            if (!req.body.data.hasOwnProperty("booking_user_id")) {
                const {
                    booking_property_id,
                    booking_room_id,
                    booking_full_name,
                    booking_country,
                    booking_address,
                    booking_email,
                    booking_phone_no,
                    booking_status,
                    booking_amount,
                    checkIn_date_time,
                    checkOut_date_time,
                } = req.body.data;
                return Promise.resolve(
                    doBooking(
                        booking_property_id,
                        booking_room_id,
                        user._id,
                        null,
                        booking_full_name,
                        booking_address,
                        booking_country,
                        booking_email,
                        booking_phone_no,
                        booking_amount,
                        booking_status,
                        "Offline",
                        checkIn_date_time,
                        checkOut_date_time,
                        Math.floor(1000 + Math.random() * 9000),
                        "Success"
                    )
                        .then((result) => {
                            if (result == "error") {
                                res.error = "Failed to book room";
                                return next(500);
                            }
                            if (result == "Room already booked for given date") {
                                res.error = result;
                                return next(500);
                            }
                            res.message = "Booking successful";
                            return next(200);
                        })
                        .catch((err) => {
                            Logger.error(err);
                            res.error = "Failed to book room";
                            return next(500);
                        })
                ).catch((err) => {
                    Logger.error(err);
                    res.error = "Failed to book room";
                    return next(500);
                });
            }
        }
    )(req, res, next);
});
const switchRoomState = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            const { room_id, room_status } = req.body.data;
            return Promise.resolve(
                updateRoomStatus(room_id, room_status)
                    .then((result) => {
                        if (result == "error") {
                            res.error = "Failed to modify room status";
                            next(500);
                        }
                        res.message = result;
                        return next(200);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Failed to modify room status";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to modify room status";
                return next(500);
            });
        }
    )(req, res, next);
});
const vendorProfile = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            return Promise.resolve(
                getVendorProfileInfo(user._id)
                    .then((result) => {
                        if (result == "error") {
                            res.error = "Failed to fetch Vendor Profile";
                            next(500);
                        }
                        return getPropertyByVendorId(result._id).then(
                            async (prop) => {
                                for (let property of prop) {
                                    property._doc.property_room_categories =
                                        await getAllCategories(property._id);
                                }
                                res.message =
                                    "Vendor Profile fetched successfully";
                                res.data = {
                                    vendor_info: result,
                                    vendor_properties: prop,
                                };
                                return next(200);
                            }
                        );
                    })
                    .catch((err) => {
                        Logger.error(err);
                        res.error = "Vendor Property Data not found";
                        return next(500);
                    })
            ).catch((err) => {
                Logger.error(err);
                res.error = "Failed to get vendor profile";
                return next(500);
            });
        }
    )(req, res, next);
});

const createUpdateVendor = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            if (req.body.data.hasOwnProperty("property_id")) {
                return Promise.resolve(
                    updateProperty(req.body.data)
                        .then((propertyUpdate) => {
                            if (propertyUpdate == "error") {
                                res.error = "Failed to update property";
                                next(500);
                            }
                            for (const roomCategory of req.body.data.property_room_categories) {
                                Pricing.findOne({
                                    pricing_property_id:
                                        req.body.data.property_id,

                                    category_name:
                                        roomCategory.category_basic_info.name,
                                })
                                    .then((pricing) => {
                                        if (!pricing) {
                                            Pricing.create({
                                                pricing_category_id:
                                                    roomCategory._id,
                                                pricing_property_id:
                                                    req.body.data.property_id,
                                                category_name:
                                                    roomCategory.category_basic_info
                                                        .name,
                                                "individual.base_occupancy":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .base_occupancy,
                                                "individual.extra_adult":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_adult,
                                                "individual.extra_child":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_child,
                                                "individual.max_guests":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .max_guests,
                                                "individual.weekdays.base_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .base_price,
                                                "individual.weekdays.extra_adult_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_adult_price,
                                                "individual.weekdays.extra_child_price.child_range_one_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_child_price
                                                        .child_range_one_price,
                                                "individual.weekdays.extra_child_price.child_range_two_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_child_price
                                                        .child_range_two_price,
                                                "individual.weekends.base_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .base_price,
                                                "individual.weekends.extra_adult_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_adult_price,
                                                "individual.weekends.extra_child_price.child_range_one_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_child_price
                                                        .child_range_one_price,
                                                "individual.weekends.extra_child_price.child_range_two_price":
                                                    roomCategory
                                                        .category_base_pricing
                                                        .extra_child_price
                                                        .child_range_two_price,
                                                "group.weekdays.per_person_cost":
                                                    roomCategory
                                                        .category_group_booking
                                                        .per_person_cost,
                                                "group.weekdays.base_price":
                                                    roomCategory
                                                        .category_group_booking
                                                        .base_price,
                                                "group.weekends.per_person_cost":
                                                    roomCategory
                                                        .category_group_booking
                                                        .per_person_cost,
                                                "group.weekends.base_price":
                                                    roomCategory
                                                        .category_group_booking
                                                        .base_price,
                                                "group.group_booking_allowed":
                                                    roomCategory
                                                        .category_group_booking
                                                        .group_booking_allowed,
                                                "group.booking_capacity":
                                                    roomCategory
                                                        .category_group_booking
                                                        .booking_capacity,
                                                "group.no_cost_child":
                                                    roomCategory
                                                        .category_group_booking
                                                        .no_cost_child,
                                            });

                                        } else {
                                            Pricing.updateOne(
                                                {
                                                    pricing_property_id:
                                                        req.body.data.property_id,

                                                    category_name:
                                                        roomCategory.category_basic_info
                                                            .name,
                                                },
                                                {
                                                    "pricing_category_id": roomCategory._id,
                                                    "individual.base_occupancy":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .base_occupancy,
                                                    "individual.extra_adult":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_adult,
                                                    "individual.extra_child":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_child,
                                                    "individual.max_guests":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .max_guests,
                                                    "individual.weekdays.base_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .base_price,
                                                    "individual.weekdays.extra_adult_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_adult_price,
                                                    "individual.weekdays.extra_child_price.child_range_one_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_child_price
                                                            .child_range_one_price,
                                                    "individual.weekdays.extra_child_price.child_range_two_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_child_price
                                                            .child_range_two_price,
                                                    "individual.weekends.base_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .base_price,
                                                    "individual.weekends.extra_adult_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_adult_price,
                                                    "individual.weekends.extra_child_price.child_range_one_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_child_price
                                                            .child_range_one_price,
                                                    "individual.weekends.extra_child_price.child_range_two_price":
                                                        roomCategory
                                                            .category_base_pricing
                                                            .extra_child_price
                                                            .child_range_two_price,
                                                    "group.weekdays.per_person_cost":
                                                        roomCategory
                                                            .category_group_booking
                                                            .per_person_cost,
                                                    "group.weekdays.base_price":
                                                        roomCategory
                                                            .category_group_booking
                                                            .base_price,
                                                    "group.weekends.per_person_cost":
                                                        roomCategory
                                                            .category_group_booking
                                                            .per_person_cost,
                                                    "group.weekends.base_price":
                                                        roomCategory
                                                            .category_group_booking
                                                            .base_price,
                                                    "group.group_booking_allowed":
                                                        roomCategory
                                                            .category_group_booking
                                                            .group_booking_allowed,
                                                    "group.booking_capacity":
                                                        roomCategory
                                                            .category_group_booking
                                                            .booking_capacity,
                                                    "group.no_cost_child":
                                                        roomCategory
                                                            .category_group_booking
                                                            .no_cost_child,
                                                }
                                            ).catch((err) => {
                                                Logger.error(err)
                                            })

                                            /* roomCategory.category_base_pricing = {
                                                base_occupancy:
                                                    pricing.individual
                                                        .base_occupancy,
                                                extra_adult:
                                                    pricing.individual
                                                        .extra_adult,
                                                extra_child:
                                                    pricing.individual
                                                        .extra_child,
                                                max_guests:
                                                    pricing.individual
                                                        .max_guests,
                                                base_price:
                                                    pricing.individual.weekdays
                                                        .base_price,
                                                extra_adult_price:
                                                    pricing.individual.weekdays
                                                        .extra_adult_price,
                                                extra_child_price: {
                                                    child_range_one_price:
                                                        pricing.individual
                                                            .weekdays
                                                            .extra_child_price
                                                            .child_range_one_price,
                                                    child_range_two_price:
                                                        pricing.individual
                                                            .weekdays
                                                            .extra_child_price
                                                            .child_range_two_price,
                                                },
                                            }; */
                                            /* roomCategory.category_group_booking = {
                                                group_booking_allowed: 
                                                    pricing.group.group_booking_allowed,
                                                booking_capacity:
                                                    pricing.group
                                                        .booking_capacity,
                                                per_person_cost:
                                                    pricing.group.weekdays
                                                        .per_person_cost,
                                                base_price:
                                                    pricing.group.weekdays
                                                        .base_price,
                                                no_cost_child:
                                                    pricing.group.no_cost_child,
                                            }; */
                                        }
                                    })
                                    .then(() => {
                                        RoomCategory.countDocuments({
                                            _id: roomCategory._id,
                                        }).then(async (count) => {
                                            if (!count) {
                                                let categoryId = await createCategory(
                                                    req.body.data.property_id,
                                                    roomCategory.category_basic_info,
                                                    roomCategory.extra_bed,
                                                    roomCategory.category_base_pricing,
                                                    roomCategory.category_availability,
                                                    roomCategory.category_amenities,
                                                    roomCategory.category_group_booking,
                                                    roomCategory.property_location,
                                                    roomCategory.category_weekend_base_pricing,
                                                    roomCategory.category_weekend_group_booking
                                                )
                                                if (categoryId == "error") {
                                                    ``
                                                    Logger.error(err);
                                                    res.error =
                                                        "Failed to create property room category";
                                                    next(500);
                                                }

                                                let rooms = roomCategory.rooms
                                                for (const room of rooms) {
                                                    createRoom(
                                                        req.body.data.property_id,
                                                        categoryId,
                                                        room.room_name,
                                                        room.room_status,
                                                    )
                                                        .then((roomInsert) => {
                                                            if (
                                                                roomInsert ==
                                                                "error"
                                                            ) {
                                                                Logger.error(err);
                                                                res.error =
                                                                    "Failed to create rooms for category " + room.category_name
                                                                next(500);
                                                            }
                                                        })
                                                }

                                            } else {
                                                updateCategory(
                                                    roomCategory._id,
                                                    roomCategory.category_basic_info,
                                                    roomCategory.category_extra_bed,
                                                    roomCategory.category_base_pricing,
                                                    roomCategory.category_availability,
                                                    roomCategory.category_amenities,
                                                    roomCategory.category_group_booking,
                                                    roomCategory.property_location,
                                                    roomCategory.category_weekend_base_pricing,
                                                    roomCategory.category_weekend_group_booking,
                                                )
                                                    .then((categoryUpdate) => {
                                                        if (
                                                            categoryUpdate ==
                                                            "error"
                                                        ) {
                                                            Logger.error(err);
                                                            res.error =
                                                                "Failed to update Vendor Profile";
                                                            next(500);
                                                        }
                                                    })
                                                    .catch((err) => {
                                                        Logger.error(err);
                                                        res.error =
                                                            "Failed to update Vendor profile";
                                                        return next(500);
                                                    });
                                            }
                                        });
                                    })
                                    .catch((err) => {
                                        Logger.error(err);
                                        res.error =
                                            "Failed to update Vendor profile";
                                        return next(500);
                                    });
                            }
                        })
                        .then(() => {
                            res.message = "Property updated successfully";
                            next(200);
                        })
                        .catch((err) => {
                            Logger.error(err);
                            res.error = "Failed to update property";
                            return next(500);
                        })
                ).catch((err) => {
                    Logger.error(err);
                    res.error = "Failed to update property";
                    return next(500);
                });

            }
            const {
                property_basic_info,
                property_location,
                property_contact_details,
                property_amenities,
                property_room_categories,
                property_policies,
                property_rules,
                property_finance_legal,
                property_status,
                property_tc_agreed,
            } = req.body.data;
            return Promise.resolve(createProperty(
                user._id,
                property_basic_info,
                property_location,
                property_contact_details,
                property_amenities,
                property_policies,
                property_rules,
                property_finance_legal,
                property_status,
                property_tc_agreed,
            ).then((result) => {
                if (result === 'error') {
                    Logger.error("Failed to create new property for vendor_id" + user._id)
                    res.error = "Failed to create new property"
                    return next(500)
                };
                res.message = "New property " + result._id + "created for vendor_id" + user._id
                return next(200)
            }).catch((err) => {
                Logger.error(err + "Failed to create new property for vendor_id" + user._id)
                res.error = "Failed to create new property"
                return next(500)
            })
            ).catch((err) => {
                Logger.error(err)
                res.error = "Failed to create new property"
                return next(500)
            })

        }
    )(req, res, next);
});

// const createUpdateVendor = catchAsync(async (req, res, next) => {
//     await passport.authenticate(
//         "user-jwt",
//         { session: false },
//         (err, user, info) => {
//             if (err) {
//                 res.error = err || info.message;
//                 return next(401);
//             }
//             if (!user) {
//                 res.error = info.message;
//                 return next(401);
//             }
//             if (req.body.data.hasOwnProperty("property_id")) {
//                 return Promise.resolve(
//                     updateProperty(req.body.data)
//                         .then((propertyUpdate) => {
//                             if (propertyUpdate == "error") {
//                                 res.error = "Failed to update property";
//                                 next(500);
//                             }
//                             for (const roomCategory of req.body.data.property_room_categories) {
//                                 Pricing.findOne({
//                                     pricing_property_id:
//                                         req.body.data.property_id,
//                                     category_name:
//                                         roomCategory.category_basic_info.name,
//                                 })
//                                     .then((pricing) => {
//                                         if (!pricing) {
//                                             Pricing.create({
//                                                 pricing_property_id:
//                                                     req.body.data.property_id,
//                                                 category_name:
//                                                     roomCategory.category_basic_info
//                                                         .name,
//                                                 "individual.base_occupancy":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .base_occupancy,
//                                                 "individual.extra_adult":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_adult,
//                                                 "individual.extra_child":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_child,
//                                                 "individual.max_guests":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .max_guests,
//                                                 "individual.weekdays.base_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .base_price,
//                                                 "individual.weekdays.extra_adult_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_adult_price,
//                                                 "individual.weekdays.extra_child_price.child_range_one_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_child_price
//                                                         .child_range_one_price,
//                                                 "individual.weekdays.extra_child_price.child_range_two_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_child_price
//                                                         .child_range_two_price,
//                                                 "individual.weekends.base_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .base_price,
//                                                 "individual.weekends.extra_adult_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_adult_price,
//                                                 "individual.weekends.extra_child_price.child_range_one_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_child_price
//                                                         .child_range_one_price,
//                                                 "individual.weekends.extra_child_price.child_range_two_price":
//                                                     roomCategory
//                                                         .category_base_pricing
//                                                         .extra_child_price
//                                                         .child_range_two_price,
//                                                 "group.weekdays.per_person_cost":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .per_person_cost,
//                                                 "group.weekdays.base_price":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .base_price,
//                                                 "group.weekends.per_person_cost":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .per_person_cost,
//                                                 "group.weekends.base_price":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .base_price,
//                                                 "group.group_booking_allowed":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .group_booking_allowed,
//                                                 "group.booking_capacity":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .booking_capacity,
//                                                 "group.no_cost_child":
//                                                     roomCategory
//                                                         .category_group_booking
//                                                         .no_cost_child,
//                                             });

//                                         } else {
//                                             Pricing.updateOne(
//                                                 {
//                                                     pricing_property_id:
//                                                         req.body.data.property_id,
//                                                     category_name:
//                                                         roomCategory.category_basic_info
//                                                             .name,
//                                                 },
//                                                 {
//                                                     "individual.base_occupancy":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .base_occupancy,
//                                                     "individual.extra_adult":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_adult,
//                                                     "individual.extra_child":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_child,
//                                                     "individual.max_guests":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .max_guests,
//                                                     "individual.weekdays.base_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .base_price,
//                                                     "individual.weekdays.extra_adult_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_adult_price,
//                                                     "individual.weekdays.extra_child_price.child_range_one_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_child_price
//                                                             .child_range_one_price,
//                                                     "individual.weekdays.extra_child_price.child_range_two_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_child_price
//                                                             .child_range_two_price,
//                                                     "individual.weekends.base_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .base_price,
//                                                     "individual.weekends.extra_adult_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_adult_price,
//                                                     "individual.weekends.extra_child_price.child_range_one_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_child_price
//                                                             .child_range_one_price,
//                                                     "individual.weekends.extra_child_price.child_range_two_price":
//                                                         roomCategory
//                                                             .category_base_pricing
//                                                             .extra_child_price
//                                                             .child_range_two_price,
//                                                     "group.weekdays.per_person_cost":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .per_person_cost,
//                                                     "group.weekdays.base_price":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .base_price,
//                                                     "group.weekends.per_person_cost":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .per_person_cost,
//                                                     "group.weekends.base_price":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .base_price,
//                                                     "group.group_booking_allowed":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .group_booking_allowed,
//                                                     "group.booking_capacity":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .booking_capacity,
//                                                     "group.no_cost_child":
//                                                         roomCategory
//                                                             .category_group_booking
//                                                             .no_cost_child,
//                                                 }
//                                             ).catch((err) => {
//                                                 Logger.error(err)
//                                             })

//                                             /* roomCategory.category_base_pricing = {
//                                                 base_occupancy:
//                                                     pricing.individual
//                                                         .base_occupancy,
//                                                 extra_adult:
//                                                     pricing.individual
//                                                         .extra_adult,
//                                                 extra_child:
//                                                     pricing.individual
//                                                         .extra_child,
//                                                 max_guests:
//                                                     pricing.individual
//                                                         .max_guests,
//                                                 base_price:
//                                                     pricing.individual.weekdays
//                                                         .base_price,
//                                                 extra_adult_price:
//                                                     pricing.individual.weekdays
//                                                         .extra_adult_price,
//                                                 extra_child_price: {
//                                                     child_range_one_price:
//                                                         pricing.individual
//                                                             .weekdays
//                                                             .extra_child_price
//                                                             .child_range_one_price,
//                                                     child_range_two_price:
//                                                         pricing.individual
//                                                             .weekdays
//                                                             .extra_child_price
//                                                             .child_range_two_price,
//                                                 },
//                                             }; */
//                                             /* roomCategory.category_group_booking = {
//                                                 group_booking_allowed: 
//                                                     pricing.group.group_booking_allowed,
//                                                 booking_capacity:
//                                                     pricing.group
//                                                         .booking_capacity,
//                                                 per_person_cost:
//                                                     pricing.group.weekdays
//                                                         .per_person_cost,
//                                                 base_price:
//                                                     pricing.group.weekdays
//                                                         .base_price,
//                                                 no_cost_child:
//                                                     pricing.group.no_cost_child,
//                                             }; */
//                                         }
//                                     })
//                                     .then(() => {
//                                         RoomCategory.countDocuments({
//                                             _id: roomCategory._id,
//                                         }).then(async (count) => {
//                                             if (!count) {
//                                                 let categoryId = await createCategory(
//                                                     req.body.data.property_id,
//                                                     roomCategory.category_basic_info,
//                                                     roomCategory.extra_bed,
//                                                     roomCategory.category_base_pricing,
//                                                     roomCategory.category_availability,
//                                                     roomCategory.category_amenities,
//                                                     roomCategory.category_group_booking,
//                                                     roomCategory.property_location
//                                                 )
//                                                 if (categoryId == "error") {``
//                                                     Logger.error(err);
//                                                     res.error =
//                                                         "Failed to create property room category";
//                                                     next(500);
//                                                 }

//                                                 let rooms = roomCategory.rooms
//                                                 for (const room of rooms) {
//                                                     createRoom(
//                                                         req.body.data.property_id,
//                                                         categoryId,
//                                                         room.room_name,
//                                                         room.room_status,
//                                                     )
//                                                         .then((roomInsert) => {
//                                                             if (
//                                                                 roomInsert ==
//                                                                 "error"
//                                                             ) {
//                                                                 Logger.error(err);
//                                                                 res.error =
//                                                                     "Failed to create rooms for category " + room.category_name
//                                                                 next(500);
//                                                             }
//                                                         })
//                                                 }

//                                             } else {
//                                                 updateCategory(
//                                                     roomCategory._id,
//                                                     roomCategory.category_basic_info,
//                                                     roomCategory.category_extra_bed,
//                                                     roomCategory.category_base_pricing,
//                                                     roomCategory.category_availability,
//                                                     roomCategory.category_amenities,
//                                                     roomCategory.category_group_booking,
//                                                     roomCategory.property_location
//                                                 )
// .then((categoryUpdate) => {
//                                                         if (
//                                                             categoryUpdate ==
//                                                             "error"
//                                                         ) {
//                                                             Logger.error(err);
//                                                             res.error =
//                                                                 "Failed to update Vendor Profile";
//                                                             next(500);
//                                                         }
//                                                     })
//                                                     .catch((err) => {
//                                                         Logger.error(err);
//                                                         res.error =
//                                                             "Failed to update Vendor profile";
//                                                         return next(500);
//                                                     });
//                                             }
//                                         });
//                                     })
//                                     .catch((err) => {
//                                         Logger.error(err);
//                                         res.error =
//                                             "Failed to update Vendor profile";
//                                         return next(500);
//                                     });
//                             }
//                         })
//                         .then(() => {
//                             res.message = "Property updated successfully";
//                             next(200);
//                         })
//                         .catch((err) => {
//                             Logger.error(err);
//                             res.error = "Failed to update property";
//                             return next(500);
//                         })
//                 ).catch((err) => {
//                     Logger.error(err);
//                     res.error = "Failed to update property";
//                     return next(500);
//                 });

//             }
//             const {
//                 property_basic_info,
//                 property_location,
//                 property_contact_details,
//                 property_amenities,
//                 property_room_categories,
//                 property_policies,
//                 property_rules,
//                 property_finance_legal,
//                 property_status,
//                 property_tc_agreed,
//             } = req.body.data;
//             return Promise.resolve(createProperty(
//                 user._id,
//                 property_basic_info,
//                 property_location,
//                 property_contact_details,
//                 property_amenities,
//                 property_policies,
//                 property_rules,
//                 property_finance_legal,
//                 property_status,
//                 property_tc_agreed,
//             ).then((result) => {
//                 if (result === 'error') {
//                     Logger.error("Failed to create new property for vendor_id" + user._id)
//                     res.error = "Failed to create new property"
//                     return next(500)
//                 };
//                 res.message = "New property " + result._id + "created for vendor_id" + user._id
//                 return next(200)
//             }).catch((err) => {
//                 Logger.error(err + "Failed to create new property for vendor_id" + user._id)
//                 res.error = "Failed to create new property"
//                 return next(500)
//             })
//             ).catch((err) => {
//                 Logger.error(err)
//                 res.error = "Failed to create new property"
//                 return next(500)
//             })

//         }
//     )(req, res, next);
// });


const propertyRooms = catchAsync(async (req, res, next) => {
    await passport.authenticate(
        "user-jwt",
        { session: false },
        (err, user, info) => {
            if (err) {
                res.error = err || info.message;
                return next(401);
            }
            if (!user) {
                res.error = info.message;
                return next(401);
            }
            const { property_id } = req.query;
            return Promise.resolve(getRoomsByPropertyId(property_id))
                .then((result) => {
                    if (result.length != 0) {
                        res.message = "Rooms fetched successfully.";
                        res.data = result;
                        return next(200);
                    } else {
                        res.message = "No rooms exist.";
                        return next(200);
                    }
                })
                .catch((err) => {
                    Logger.error(err + "Failed to onboard vendor");
                    res.error = "Failed to onboard vendor";
                    return next(500);
                });
        }
    )(req, res, next);
});


const getAmenitiesWholeData = catchAsync(async (req, res, next) => {
    const result = await AmenityImage.find({}).then((am) => {
        res.send(
            am
        )
    })
    //    res.send(result)
});


module.exports = {
    vendorProfile,
    createUpdateVendor,
    propertyRooms,
    switchRoomState,
    bookRoom,
    bookingHistory,
    bookingHistoryUpcoming,
    bookingHistoryCompleted,
    bookingHistoryCancelled,
    vendorDashboard,
    pricingList,
    activityList,
    uploadActivityImage,
    deleteRoom,
    uploadPropertyImage,
    propertyImagesList,
    updateSingleRoom,
    deletePropertyImage,
    uploadPropertyDoc,
    propertyDocsList,
    deletePropertyDoc,
    uploadAmenityImage,
    getAmenities,
    getAmenitiesWholeData,
    uploadCatImage,
    financeImage,
};


