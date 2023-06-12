const Logger = require("../utilities/logger");
const { decryptWithAES } = require("../utilities/passwordUtilities");
const { User } = require("../models");

const getVendorProfileInfo = (vendorId) => { 
  return Promise.resolve(
    User.findOne({ _id: vendorId }, "_id user_email user_first_name user_last_name user_status user_phone_no vendor_is_onboard vendor_address vendor_company_name")
      .then((result) => {
        if (!result) return "error";
        return result;
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

const getVendorList = async (pageNo, searchText) => {
  if (!searchText) {
    searchText = null;
  } else {
    searchText = new RegExp(searchText.toLowerCase());
  }
  return await User.aggregate([
    {
      $match: {
        $and: [{ _id: { $ne: null } }, { _id: { $ne: undefined } }],
      },
    },
    {
      $sort: {createdAt: -1},
    },
    {
      $lookup: {
        from: "properties",
        localField: "_id",
        foreignField: "vendor_id",
        as: "p",
      },
    },
    {
      $set: {
        full_string: {
          $toLower: { $concat: [{ $arrayElemAt: ["$p.property_basic_info.property_name", 0] }, "$user_first_name", "$user_last_name", "$user_phone_no", "$user_email"] },
        },
      },
    },
    {
      $match: {
        $expr: {
          $cond: [{ $eq: [searchText, null] }, true, { $regexFind: { input: "$full_string", regex: searchText } }],
        },
      },
    },

    {
      $project: {
        _id: 0,
        vendor_name: { $concat: ["$user_first_name", " ", "$user_last_name"] },
        property_name: { $arrayElemAt: ["$p.property_basic_info.property_name", 0] },
        phone_no: "$user_phone_no",
        user_email: "$user_email",
        user_cipher_text: "$user_cipher_text",
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: parseInt(pageNo) } }],
        data: [{ $skip: parseInt(pageNo) * 10 }, { $limit: 10 }],
      },
    },
  ])
    .then((result) => {
      for (const v of result[0].data) {
        if (v.user_cipher_text) {
          v.password = decryptWithAES(v.user_cipher_text);
        }
      }
      return {
        metadata: result[0].metadata[0],
        data: result[0].data,
      };
    })
    .catch((err) => {
      Logger.error(err);
      return "ERR";
    });
};

module.exports = {
  getVendorProfileInfo,
  getVendorList,
};
