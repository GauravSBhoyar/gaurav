// const { Coupon } = require("../models"),
//     Logger = require("../utilities/logger"),
    
//     getCoupons = async (query) => {
//         try {
//             return await Coupon.aggregate([
//                 {
//                     $sort: { createdAt: -1 },
//                 },
//                 // {
//                 //     $project: {
                        
//                 //             coupon_title:
//                 //             "$coupon_title",
//                 //             coupone_code:
//                 //             "$coupone_code",
//                 //             coupone_discount:
//                 //             "$coupone_discount",
//                 //             coupone_discount_type:
//                 //             "$coupone_discount_type",
//                 //             coupone_is_one_time:
//                 //             "$coupone_is_one_time",
//                 //             coupon_valid_from:
//                 //             "$coupon_valid_from",
//                 //             coupon_valid_till:
//                 //             "$coupon_valid_till",
//                 //             coupon_status:
//                 //             "$coupon_status",
                           
//                 //     }
//                 // },
//                 {
//                     $facet: {
//                         metadata: [
//                             { $count: "total" },
//                             { $addFields: { page: parseInt(query.page_no) } },
//                         ],
//                         data: [
//                             { $skip: parseInt(query.page_no) * 10 },
//                             { $limit: 10 },
//                         ],
//                     },
//                 },
//             ]).then((result) => {
//                 return {
//                     // metatdata: result[0].metadata[0],
//                     data: result,
//                 };
//             });
//         } catch (err) {
//             Logger.error(err);
//             return err;
//         }
//     },
//     // const getCoupons = async (query) => {
//     //     try {
//     //       const couponCode = query.coupon_code;
//     //       return await Coupon.find({ coupone_code: couponCode })
//     //         .then((result) => {
//     //           return {
//     //             data: result,
//     //           };
//     //         });
//     //     } catch (err) {
//     //       Logger.error(err);
//     //       return err;
//     //     }
//     //   };
//     // getCoupons = async (query) => {
//     //     try {
//     //       const couponCode = query.coupon_code;
//     //       const coupon = await Coupon.findOne({ coupone_code: couponCode });
//     //       if (!coupon) {
//     //         return { message: "Coupon not found" };
//     //       }
      
//     //       const currentDate = new Date();
//     //       if (currentDate > coupon.coupon_valid_till) {
//     //         return { message: "Coupon expired" };
//     //       }
      
//     //       if (coupon.coupone_is_one_time == "Yes") {
//     //         if (coupon.coupon_status === "inactive") {
//     //           return { message: "Coupon already used" };
//     //         }
//     //         coupon.coupon_status = "inactive";
//     //         await coupon.save();
//     //       }
      
//     //       return { data: coupon };
//     //     } catch (err) {
//     //       Logger.error(err);
//     //       return err;
//     //     }
//     //   };
//     // getCoupons = async (query) => {
//     //   try {
//     //     const couponCode = query.coupon_code;
//     //     const coupon = await Coupon.findOne({ coupone_code: couponCode });
//     //     if (!coupon) {
//     //       return { message: "Coupon not found" };
//     //     }
    
//     //     const currentDate = new Date();
//     //     if (currentDate > coupon.coupon_valid_till) {
//     //       return { message: "Coupon expired" };
//     //     }
    
//     //     if (coupon.coupone_is_one_time === "Yes") {
//     //       if (coupon.coupon_status === "inactive") {
//     //         return { message: "Coupon already used" };
//     //       }
//     //       coupon.coupon_status = "inactive";
//     //       await coupon.save();
//     //     }
       
//     //     if (coupon.coupone_is_one_time === "No") {
//     //       const totalCouponsUsed = coupon.coupon_uses_count || 0;
//     //       const maxCouponUses = coupon.coupon_max_uses || 0;
//     //       if (totalCouponsUsed >= maxCouponUses) {
//     //         return { message: "Coupon usage limit reached" };
//     //       }
//     //       coupon.coupon_uses_count = totalCouponsUsed + 1;
//     //       await coupon.save();
//     //     }
    
//     //     return { data: coupon };
//     //   } catch (err) {
//     //     Logger.error(err);
//     //     return err;
//     //   }
//     // };

//     // getCoupons = async (query) => {
//     //   try {
//     //     const couponCode = query.coupon_code;
//     //     return await Coupon.find({})
//     //       .then((result) => {
//     //         return {
//     //           data: result,
//     //         };
//     //       });
//     //   } catch (err) {
//     //     Logger.error(err);
//     //     return err;
//     //   }
//     // };
      
//     createCoupon = async (params, data) => {
//         try {
//             return await new Coupon(data)
//                 .save()
//                 .then((result) => (!result._id ? 0 : 1));
//         } catch (err) {
//             Logger.error(err);
//             return err;
//         }
//     },
//     updateCoupon = async (params, data) => {
//         try {
//             return await Coupon.updateOne({ _id: params.id }, data).then(
//                 (result) => (!result.modifiedCount ? 0 : 1)
//             );
//         } catch (err) {
//             Logger.error(err);
//             return err;
//         }
//     },
//     deleteCoupon = async (params) => {
//         try {
//             return await Coupon.deleteOne({ _id: params.id }).then((result) =>
//                 !result.deletedCount ? 0 : 1
//             );
//         } catch (err) {
//             Logger.error(err);
//             return err;
//         }
//     };
// module.exports = {
//     getCoupons,
//     createCoupon,
//     updateCoupon,
//     deleteCoupon,
// };


















const { Coupon } = require("../models"),
    Logger = require("../utilities/logger"),
    getCoupons = async (query) => {
        try {
            return await Coupon.aggregate([
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        metadata: [
                            { $count: "total" },
                            { $addFields: { page: parseInt(query.page_no) } },
                        ],
                        data: [
                            { $skip: parseInt(query.page_no) * 10 },
                            { $limit: 10 },
                        ],
                    },
                },
            ]).then((result) => {
                return {
                    metatdata: result[0].metadata[0],
                    data: result[0].data,
                };
            });
        } catch (err) {
            Logger.error(err);
            return err;
        }
    },
    createCoupon = async (params, data) => {
        try {
            return await new Coupon(data)
                .save()
                .then((result) => (!result._id ? 0 : 1));
                // .then((result) => res.send(result));
        } catch (err) {
            Logger.error(err);
            return err;
        }
    },
    updateCoupon = async (params, data) => {
        try {
            return await Coupon.updateOne({ _id: params.id }, data)
            .then(
                (result) => res.send('update successfully')
            );
            // .then(
            //     (result) => (!result.modifiedCount ? 0 : 1)
            // );
        } catch (err) {
            Logger.error(err);
            return err;
        }
    },
    deleteCoupon = async (params) => {
        try {
            return await Coupon.deleteOne({ _id: params.id }).then((result) =>
                !result.deletedCount ? 0 : 1
            );
        } catch (err) {
            Logger.error(err);
            return err;
        }
    };


    const getuserCoupons = async (query) => {
        try {
          const couponCode = query.coupon_code;
          const coupon = await Coupon.findOne({ coupone_code: couponCode });
          if (!coupon) {
            return { message: "Coupon not found" };
          }
      
          const currentDate = new Date();
          if (currentDate > coupon.coupon_valid_till) {
            return { message: "Coupon expired" };
          }
      
          if (coupon.coupone_is_one_time === "Yes") {
            if (coupon.coupon_status === "inactive") {
              return { message: "Coupon already used" };
            }
            coupon.coupon_status = "inactive";
            await coupon.save();
          }
         
          if (coupon.coupone_is_one_time === "No") {
            const totalCouponsUsed = coupon.coupon_uses_count || 0;
            const maxCouponUses = coupon.coupon_max_uses || 0;
            if (totalCouponsUsed >= maxCouponUses) {
              return { message: "Coupon usage limit reached" };
            }
            coupon.coupon_uses_count = totalCouponsUsed + 1;
            await coupon.save();
          }
      
          return { data: coupon };
        } catch (err) {
          Logger.error(err);
          return err;
        }
      };

module.exports = {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getuserCoupons,
};
