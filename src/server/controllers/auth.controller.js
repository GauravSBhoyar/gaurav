const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const Logger = require("../utilities/logger");
const { User } = require("../models");
const { generatePassword } = require("../utilities/passwordUtilities");
const {
    getUserById,
    sendVerificationMail,
    insertUpdateVendorProfileInfo,
    sendPasswdResetMail,
} = require("../services");
const { response } = require("express");

const verifyUserMail = catchAsync(async (req, res, next) => {
    if (!req.query.id) {
        res.error = "Invalid URL";
        return next(404);
    }
    return Promise.resolve(
        User.findOne(
            { _id: req.query.id }, "user_status"
        ).then((result) => {
            if (result.user_status === 'Verified') {
                res.message = "User Already Verified";
                return next(200);
            }
            User.updateOne(
                { _id: req.query.id, user_status: "Unverified" },
                { user_status: "Verified" }
            )
                .then((result) => {
                    if (result.modifiedCount > 0) {
                        Logger.info("User verified " + `UserId: ${req.query.id}`);
                        res.message = "User verified";
                        //res.redirect('http://vendor.myresorts.in');
                        return next(200);
                    }
                    Logger.error(
                        "Failed to verify user " + `UserId: ${req.query.id}`
                    );
                    res.error = "Failed to verify user";
                    return next(500);
                })
                .catch((err) => {
                    Logger.error(
                        err +
                        " - Failed to verify user " +
                        `UserId: ${req.query.id}`
                    );
                    res.error = "Failed to verify user";
                    return next(500);
                })
        })
    ).catch((err) => {
        Logger.error(
            err + " - Failed to verify user " + `UserId: ${req.query.id}`
        );
        res.error = "Failed to verify user";
        return next(500);
    });
});

const registerRole = catchAsync(async (req, res, next) => {
    const {
        role,
        first_name,
        last_name,
        email,
        password,
        phone_no,
        vendor_company_name,
        tc_agreed,
    } = req.body;
    let saltHash;
    return Promise.resolve(
        User.findOne({ user_email: email.toLowerCase() }, "_id")
    ).then((result) => {
        if (result) {
            res.error =
                "Vendor already registered" //+ `VendorId: ${result._id}`;
            return next(409);
        }
        saltHash = generatePassword(password);
        new User({
            user_role: role,
            user_first_name: first_name,
            user_last_name: last_name,
            user_email: email.toLowerCase(),
            user_salt: saltHash.salt,
            user_hash: saltHash.hash,
            user_cipher_text: saltHash.cipher_text,
            user_phone_no: phone_no,
            vendor_company_name: vendor_company_name,
        })
            .save()
            .then((result) => {
                sendVerificationMail(result._id, email, first_name);
                Logger.info(
                    "User verification pending " + `UserId: ${result._id}`
                );
                res.message = "User verification pending";
                return next(200);
            })
            .catch((err) => {
                Logger.error(
                    err +
                    " - Failed to onboard vendor. " +
                    JSON.stringify(req.body)
                );
                res.error = "Failed to onboard vendor";
                return next(500);
            });
    });
});
const userProfile = catchAsync(async (req, res, next) => {
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
            try {
                let response;
                if (req.method === "POST") {
                    let data = { ...req.body, [req.body.id]: req.body.value };
                    response = await insertUpdateVendorProfileInfo(data);
                    switch (response) {
                        case "INSSUC":
                            res.message = "User inserted succesfully";
                            return next(200);
                        case "UPDSUC":
                            res.message = "User updated succesfully";
                            return next(200);
                        case "INSERR":
                            res.error = "Failed to insert user";
                            return next(500);
                        case "UPDERR":
                            res.error = "Failed to update user";
                            return next(500);
                        case "ERR":
                            res.error =
                                "Something went wrong. Please contact administrator";
                            return next(500);
                    }
                }
                if (req.method == "GET") {
                    response = await getUserById(user._id);
                    res.data = response;
                    return next(200);
                }
                next(404);
            } catch (err) {
                Logger.error(err);
                res.message = "Failed to delete room";
                next(500);
            }
        }
    )(req, res, next);
});

const sendPasswdResetLink = catchAsync(async (req, res, next) => {
    let email = req.body.email.toLowerCase();
    return Promise.resolve(
        User.findOne({ user_email: email }, "_id")
    ).then((result) => {
        if (result) {
            sendPasswdResetMail(result._id, email);
            Logger.info("User password reset mail " + `UserId: ${result._id}`);
            res.message = "User password reset mail sent";
            return next(200);
        }
    }).catch((err) => {
        Logger.error(err + " user not found")
        res.error = "User not found";
        return next(500);
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    let saltHash = generatePassword(req.body.password);
    return Promise.resolve(
        User.updateOne(
            { _id: req.body.user_id },
            {
                user_salt: saltHash.salt,
                user_hash: saltHash.hash,
                user_cipher_text: saltHash.cipher_text,
            }
        ).then((result) => {
            if (result.modifiedCount === 1) {
                res.message = "Password reset successful"
                next(200)
            }
            else {
                re.message = "Password reset failed"
                next(500)
            }
        }).catch((err) => {
            Logger.error(err + " password reset failed")
            res.error = "Password reset failed";
            return next(500);
        })
    )
});

module.exports = {
    registerRole,
    userProfile,
    verifyUserMail,
    sendPasswdResetLink,
    resetPassword,
};
