const catchAsync = require("../utilities/catchAsync");
const Logger = require("../utilities/logger");
// const bcrypt = require("bcrypt");
const { Customer } = require("../models");
const { Otp } = require("../models");
const { otpGeneration } = require("../services");
const { response } = require("express");
const fast2sms = require('fast-two-sms')
var unirest = require("unirest");

const OTP = Math.floor(Math.random() * 90000) + 10000;


function sendMsg(mobile, OTP) {
  var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

  req.headers({
    "authorization": process.env.Fast2SmsApiKey,
  });

  req.form({
    "variables_values": OTP,
    "route": "otp",
    "numbers": mobile,
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
  });
}

const registerCustomer = async (req, res, next) => {
  const { mobile } = req.body;
  //   const user = await Customer.findOne({ mobile: mobile }, "_id");
  try {
    const result = await Customer.findOne({ mobile: mobile }, "_id");
    console.log(result);

    const otp = new Otp({ mobile: mobile, otp: OTP });
    const resulter = await otp.save();
    var otp_sample = "1234";

    if (result) {
      var otps = otpGeneration(result._id, "Customer", OTP);

      const mySms = await sendMsg(mobile, OTP)

      res.send({
        message: "Customer verification pending and OTP is " + OTP,
        sms: mySms,
        data: result._id
      })
      return next(200);
    }

    const savedCustomer = await new Customer({
      mobile: mobile
    }).save();

    const mySms = await sendMsg(mobile, OTP)

    // var otp = otpGeneration(savedCustomer._id, "Customer", OTP);
    Logger.info("Customer verification pending and OTP is " + OTP);
    console.log(OTP);

    res.send({
      message: "Customer verification pending and OTP is " + OTP,
      sms: mySms,
      data: savedCustomer._id
    });

    return next(200);
  } catch (err) {
    console.log(err);
    Logger.error(
      err + " - Failed to register customer. " + JSON.stringify(req.body)
    );
    res.error = "Failed to register customer";
    return next(500);
  }
};

// 888 99 427 85 to send only messages no numbers
//  function sendMsg(number, OTP) {
//   return new Promise((resolve, reject) => {

//     const message = `Dear Customer, Your MyResorts OTP is myotp`; 

//     var options = {
//       authorization: process.env.Fast2SmsApiKey,
//       message: message,
//       numbers: [number]
//     };

//     console.log(options, "fast2 sms message");

//     fast2sms.sendMessage(options)
//     .then((response) => {
//         resolve(`Sms OTP sent successfully ${OTP}`);
//       })
//       .catch((error) => {
//         reject("Failed to send SMS OTP");
//       });
//   });
// }

const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  return Promise.resolve(
    Customer.find({ mobile: req.body.mobile })
    // Otp.find({
    //   mobile: req.body.mobile,
    //   otp: req.body.otp,
    // })
  )
    .then((result) => {
      const factor = result;
      Otp.find({
        mobile: req.body.mobile,
        // otp: req.body.otp,
      }).then((result) => {
        if (otp.length === 0) return res.status(400).send("OTP is Expired!!");
        const rightOtpFind = result[result.length - 1];

        let apikey = process.env.Fast2SmsApiKey;

        console.log(apikey, "right otp find");


        if (rightOtpFind.mobile === mobile && rightOtpFind.otp === otp) {
          return res.status(200).send({
            status: "Success",
            message: "Your OTP is Verified !!",
            data: factor,
          });
        } else {
          // return res.status(200).send("your otp is wrong");
          // } else if(rightOtpFind.mobile !== mobile && rightOtpFind.otp !== otp) {
          return res.status(200).send({
            status: "Failure",
            message: "Your OTP is Not Verified !!",
          });
        }

      })


    })
    .catch((error) => {
      res.status(200).send({
        status: "failure",
        message: "Otp Entered was Incorrect Try Again",
      });
    });
};

const updateCustumer = async (req, res) => {
  const { mobile, firstname, lastname, email } = req.body;

  const update = await Customer.updateOne({ mobile: mobile }, {
    firstname: firstname,
    lastname: lastname,
    email: email
  }).then((result) => {
    res.status(200).send({
      data: result,
      message: "Your Details has been Updated Successfully"
    });
  })
};

const getcustomers = async (req, res) => {
  try {
    const result = await Customer.find({}).sort({ updatedAt: -1 });
    res.send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
}

module.exports = {
  registerCustomer,
  verifyOtp,
  updateCustumer,
  getcustomers
};