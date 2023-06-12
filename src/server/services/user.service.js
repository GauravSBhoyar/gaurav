const ejs = require("ejs");
const path = require("path");
const Logger = require("../utilities/logger");
const { User, Otp, RoomCategory } = require("../models");

const sendVerificationMail = async (userId, userEmailId, firstName) => {
    let mailTemplate;
    ejs.renderFile(path.resolve(__dirname + "/../views/verifyemail.ejs"), {
        http_type: process.env.Env_Type == "secure" ? "s" : "",
        host_name: process.env.Code_Type == "online"? process.env.UAT_PROD_HOSTNAME : process.env.STAGE_HOSTNAME+":"+process.env.DEV_PORT,
        api_version: process.env.API_VERSION,
        user_id: userId,
        first_name: firstName,
    }).then((result) => {
        mailTemplate = result;
        require("nodemailer")
            .createTransport({
                host: process.env.SMTP_HOST,
                secure: true,
                port: 465,
                auth: {
                    user: process.env.SMTP_USER_NAME,
                    pass: process.env.SMTP_PASSWORD,
                },
            })
            .sendMail(
                {
                    from: process.env.SMTP_USER_NAME,
                    to: userEmailId,
                    subject: "MyResorts Verification Mail",
                    html: mailTemplate,
                    attachments: [
                        {
                            filename: "banner.jpg",
                            path: `${__dirname}/../public/banner.jpg`,
                            cid: "banner",
                        },
                        {
                            filename: "facebook.png",
                            path: `${__dirname}/../public/facebook.png`,
                            cid: "facebook",
                        },
                        {
                            filename: "twitter.png",
                            path: `${__dirname}/../public/twitter.png`,
                            cid: "twitter",
                        },
                        {
                            filename: "youtube.png",
                            path: `${__dirname}/../public/youtube.png`,
                            cid: "youtube",
                        },
                    ],
                },

                (err, info) => {
                    if (err) {
                        User.deleteOne({ _id: userId }).catch((err) => {
                            Logger.error(err);
                        });
                        Logger.error(err);
                    } else {
                        Logger.info(JSON.stringify(info));
                    }
                }
            );
    });
};

const sendPasswdResetMail = (userId, userEmailId) => {
    require("nodemailer")
        .createTransport({
            host: process.env.SMTP_HOST,
            secure: true,
            port: 465,
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_PASSWORD,
            },
        })
        .sendMail(
            {
                from: process.env.SMTP_USER_NAME,
                to: userEmailId,
                subject: "MyResorts Password Reset",
                text: `http${process.env.Env_Type === "secure"?"s":""}://${process.env.Code_Type === "online"? process.env.UAT_PROD_HOSTNAME: process.env.STAGE_HOSTNAME+":"+process.env.DEV_PORT}/auth/resetpassword?user_id=${userId}`,
              },
            (err, info) => {
                if (err) {
                    Logger.error(err);
                } else {
                    Logger.info(JSON.stringify(info));
                }
            }
        );
}

const getUserById = (userId) => {
    return Promise.resolve(
        User.findOne({ _id: userId })
            .then((user) => user)
            .catch((err) => {
                Logger.error(err);
                return "error";
            })
    ).catch((err) => {
        Logger.error(err);
        return "error";
    });
};

const insertUpdateVendorProfileInfo = async (data) => {
    let response = "ERR";
    try {
        if (data._id) {
            response = await User.updateOne(
                { _id: data._id },
                { $set: { ...data } }
            );
            response = response.modifiedCount !== 1 ? "UPDERR" : "UPDSUC";
        } else {
            response = await new User(data).save();
            response = !response._id ? "INSERR" : "INSSUC";
        }
    } catch (err) {
        Logger.error(err);
        return "ERR";
    }
    return response;
};

const otpGeneration = async (relation_object_id, otp_for, otp_sample) => {
    let response = {};
    try {
        if (relation_object_id) {
            
            new Otp({
                relation_object_id: relation_object_id,
                otp: otp_sample,
                otp_for: otp_for
            })
            .save()
            .then((result) => {
                response = {
                    status : true,
                    otp : otp_sample,
                    message : "OTP Generated successfully"
                };
            })
            .catch((err) => {
                response = {
                    status : false,
                    message : "Unable to generate OTP"
                };
            });
        } else {
            response = {
                status : false,
                message : "Mismatch customer object ID"
            };
        }
    } catch (err) {
        console.log("ERROR_LOGGER", err)
        Logger.error(err);
        return "ERR";
    }
    return response;
}

const getsimilar = async (filters ,query)=>{
    console.log("Query:", query);
    return await RoomCategory.aggregate([
        {
            $set: {
              place: {
                $toLower: {
                  $concat: [
                    {
                      $ifNull: [
                        {
                          $toString: "$category_basic_info.name",
                        },
                        "",
                      ],
                    },
                    ", ",
                    {
                      $ifNull: [
                        {
                          $toString: "$category_basic_info.description",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_city",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_nearest_gate",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_state",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_zip_code",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_address",
                        },
                        "",
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $toString: "$property_location.property_locality",
                        },
                        "",
                      ],
                    },
                    ", ",
                    {
                      $ifNull: [
                        {
                          $toString: "$property_basic_info.property_name",
                        },
                        "",
                      ],
                    },
                  ],
                },
              },
              
            },
          },
          {
            $match: {
              $expr: {
                $cond: [
                  { $eq: [filters.place, null] },
                  true,
                  {
                    $regexFind: {
                      input: "$place",
                      regex: { $toLower: filters.place },
                    },
                  },
                ],
              },
            },
          },
          
          {
          $lookup: {
            from: "categoryimages",
            localField: "_id",
            foreignField: "category_id",
            as: "pi",
          },
        },
       
       {
        $project: {
             room_cat_id: "$_id",
          category_basic_info: "$category_basic_info",
          category_base_pricing: "$category_base_pricing",
          all_base_pricing:"$paisa",
          category_availability: "$category_availability",
          category_amenities: "$category_amenities",
          category_group_booking: "$category_group_booking",
          property_location: "$property_location",
          category_extra_bed: "$category_extra_bed",
  
       
  
          images: {
            $concatArrays: [
              {
                $ifNull: ["$pi.file_paths.path", []],
              },
            ],
          },
        },
       }
    ])
}

module.exports = {
    getUserById,
    sendVerificationMail,
    insertUpdateVendorProfileInfo,
    sendPasswdResetMail,
    otpGeneration,
    getsimilar
};