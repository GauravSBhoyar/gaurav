const { Property, Booking, Coupon, Blog } = require("../models");
const { getBookingListUpcoming, getBookingListFilter, getVendorSettlement } = require("../services/booking.service");

const passport = require("passport"),
  aws = require("aws-sdk"),
  multer = require("multer"),
  multerS3 = require("multer-s3"),
  { v4: uuid } = require("uuid"),
  catchAsync = require("../utilities/catchAsync"),
  Logger = require("../utilities/logger"),
  { createPricingAndTaxCommission, updatePropertyStatus, addToFeaturedList, getCategoryNames, getPropertyNames, getAdminDashboardInfo, insertAdminTodo, getAdminTodoList, updateAdminTodo, deleteAdminTodo, getPropertyList, getPropertyFinanceLegal, getVendorList, getBookingList, getPricingAndTaxCommission, updatePricingAndTaxCommission, deletePricingAndTaxCommission, insertBlog, getBlog, updateBlog, deleteBlog, insertBookingNew, getFeaturedList, updateFeatured, deleteFeatured, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../services"),
 
  couponController = catchAsync(async (req, res, next) => {
    if (req.method === "GET") {
      let query = { ...req.query };
      response = await getCoupons(query);
      if (response !== "ERR") {
        res.data = response;
        return next(200);
      }
      res.error = "Failed to fetch coupon list";
    }
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      // if (req.method === "GET" && req.query.property_name) {
      //   response = await getPropertyNames();
      //   if (response !== "ERR") {
      //     res.data = response;
      //     return next(200);
      //   }
      //   res.error = "Failed to fetch property names";
      // }
      if (req.method === "GET") {
        let query = { ...req.query };
        response = await getCoupons(query);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch coupon list";
      }
      
      // if (req.method === "PUT") {
      //   let params = { ...req.params };
      //   let data = { ...req.body };
      //   response = await updateCoupon(params, data);
      //   if (response == 1) {
      //     res.message = "Coupon updated successfully";
      //     next(200);
      //   }
      //   res.error = response;
      // }

      if (req.method === "PUT") {
        let params = { ...req.params };

        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await Coupon.updateOne({ _id: params.id }, data);
        if (response !== "ERR") {
          res.message = "Admin Todo updated successfully";
          next(200);
        }
        res.error = "Admin Todo failed to update";
      }

      if (req.method === "POST") {
        let params = { ...req.params };
        let data = { ...req.body };
        console.log(data, "put data ")
        response = await createCoupon( params , data);
        if (response == 1) {
          res.message = "Added coupon successfully";
          next(200);
        }
        res.error = response;
      }
      if (req.method === "DELETE") {
        let params = { ...req.params };
        response = await deleteCoupon(params);
        if (response == 1) {
          res.message = "Removed coupon successfully";
          next(200);
        }
        res.error = response;
      }
      return next(500);
    })(req, res, next);
  }),
  featureController = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET" && req.query.property_id) {
        let query = { ...req.query };
        response = await getCategoryNames(query);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch category names";
      }
      if (req.method === "GET" && req.query.property_name) {
        response = await getPropertyNames();
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch property names";
      }
      if (req.method === "GET") {
        response = await getFeaturedList(req.query.page_no, req.query.search_text);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch featured list";
      }
      if (req.method === "PUT") {
        let params = { ...req.params };
        let data = { ...req.body };
        response = await updateFeatured(params, data);
        if (response == 1) {
          res.message = "Featured updated successfully";
          next(200);
        }
        res.error = response;
      }
      if (req.method === "POST") {
        let params = { ...req.params };
        response = await addToFeaturedList(params);
        if (response == 1) {
          res.message = "Added room category to featured list";
          next(200);
        }
        res.error = response;
      }
      if (req.method === "DELETE") {
        let params = { ...req.params };
        response = await deleteFeatured(params);
        if (response == 1) {
          res.message = "Removed room category from featured list";
          next(200);
        }
        res.error = response;
      }
      return next(500);
    })(req, res, next);
  }),
  // getbookinglist = (req, res)=>{
  //   getbookinglist
  // }
  
  bookingList = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      // Booking.find({}).then((result)=>{
      //   res.data = result
      // })
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      // if (!user || user.user_role !== "Admin") {
      //   res.error = info.message;
      //   return next(401);
      // }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getBookingList(req.query.page_no, req.query.search_text, req.query.filter);
      
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch booking list";
      }
      if (req.method === "POST") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await insertBookingNew(data);
        if (response == 1) {
          res.message = "Booking inserted successfully";
          next(200);
        }
        res.error = response;
      }
      return next(500);
    })
    (req, res, next);
  }),

  vendorSettlement = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      // Booking.find({}).then((result)=>{
      //   res.data = result
      // })
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      // if (!user || user.user_role !== "Admin") {
      //   res.error = info.message;
      //   return next(401);
      // }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getVendorSettlement(req.query.page_no, req.query.search_text, req.query.filter);
      
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch vendor settlement";
      }
      // if (req.method === "POST") {
      //   let data = { ...req.body, [req.body.id]: req.body.value };
      //   response = await insertBookingNew(data);
      //   if (response == 1) {
      //     res.message = "Booking inserted successfully";
      //     next(200);
      //   }
      //   res.error = response;
      // }
      return next(500);
    })
    (req, res, next);
  }),

  bookingListFilter = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getBookingListFilter(req.query.page_no, req.query.search_text, req.query.filter, req.query.booking_filter);
      
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch booking list";
      }
      return next(500);
    })
    (req, res, next);
  }),



  vendorList = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      console.log(user.user_role)
      if (!user) {
        
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getVendorList(req.query.page_no, req.query.search_text);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch property finance legal";
      }
      if (req.method === "PUT") {
        let params = { ...req.params };
        let data = { ...req.body };
        response = await updatePropertyStatus(params, data);
        if (response == 1) {
          res.message = "Property status updated successfully";
          next(200);
        }
        res.error = response;
      }
      return next(500);
    })(req, res, next);
  }),

  adminDashboard = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = await getAdminDashboardInfo();
      if (response !== "ERR") {
        res.data = response;
        return next(200);
      }
      res.error = "Failed to fetch admin dashboard";
      next(500);
    })(req, res, next);
  }),
  
  adminTodoList = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getAdminTodoList();
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch admin todo";
      }
      if (req.method === "POST") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await insertAdminTodo(data);
        if (response !== "ERR") {
          res.message = "Admin Todo inserted successfully";
          next(200);
        }
        res.error = "Failed to insert admin todo";
      }
      if (req.method === "PUT") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await updateAdminTodo(data);
        if (response !== "ERR") {
          res.message = "Admin Todo updated successfully";
          next(200);
        }
        res.error = "Admin Todo failed to update";
      }
      if (req.method === "DELETE") {
        response = await deleteAdminTodo(req.params.id);
        if (response !== "ERR") {
          res.message = "Admin Todo deleted successfully";
          next(200);
        }
        res.error = "Admin Todo failed to delete";
      }
      return next(500);
    })(req, res, next);
  }),
  propertyList = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      // const propertyfinancelegal = Property.find({}).select("property_finance_legal").then((result)=>{
      //     res.send({
      //       message:"fetched",
      //       data:result,
  
      //     })
      //   })
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await getPropertyList(req.query.page_no, req.query.search_text);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch property list";
      }
      return next(500);
    })(req, res, next);
  }),

  propertyFinanceLegal = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
     
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
       
        response = await getPropertyFinanceLegal(req.query.page_no, req.query.search_text);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch property finance legal";
      }
      return next(500);
    })(req, res, next);
  }),

  commissionList = catchAsync(async (req, res, next) => {
    if (req.method === "GET") {
      response = await getPricingAndTaxCommission();
      if (response !== "ERR") {
        res.data = response;
        return next(200);
      }
      res.error = "Failed to fetch Pricing and Tax Commission";
    }
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      // if (err) {
      //   res.error = err || info.message;
      //   return next(401);
      // }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      // let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
    
      if (req.method === "PUT") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await updatePricingAndTaxCommission(data);
        if (response !== "ERR") {
          res.message = "Pricing and Tax Commission updated successfully";
          next(200);
        }
        res.error = "Pricing and Tax Commission failed to update";
      }
      if (req.method === "POST") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await createPricingAndTaxCommission(data);
        if (response !== "ERR") {
          res.message = "Pricing and Tax Commission updated successfully";
          next(200);
        }
        res.error = "Pricing and Tax Commission failed to update";
      }
      if (req.method === "DELETE") {
        response = await deletePricingAndTaxCommission(req.params.id);
        if (response !== "ERR") {
          res.message = "Pricing and Tax Commission deleted successfully";
          next(200);
        }
        res.error = "Pricing and Tax Commission failed to delete";
      }
      return next(500);
    })(req, res, next);
  }),
  blogController = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
      if (err) {
        res.error = err || info.message;
        return next(401);
      }
      if (!user || user.user_role !== "Admin") {
        res.error = info.message;
        return next(401);
      }
      let response = "ERR";
      res.error = "System Error. Contact System Adminitrator.";
      if (req.method === "GET") {
        response = await Blog.find({}).limit(10);
        if (response !== "ERR") {
          res.data = response;
          return next(200);
        }
        res.error = "Failed to fetch Blog";
      }
      if (req.method === "POST") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await insertBlog(data);
        if (response !== "ERR") {
          res.message = "Blog article inserted successfully";
          next(200);
        }
        res.error = "Blog article failed to insert";
      }
      if (req.method === "PUT") {
        let data = { ...req.body, [req.body.id]: req.body.value };
        response = await updateBlog(data);
        if (response !== "ERR") {
          res.message = "Blog article updated successfully";
          next(200);
        }
        res.error = "Blog article failed to update";
      }
      if (req.method === "DELETE") {
        response = await deleteBlog(req.params.id);
        if (response !== "ERR") {
          res.message = "Blog article deleted successfully";
          next(200);
        }
        res.error = "Blog article failed to delete";
      }
      return next(500);
    })(req, res, next);
  }),

  uploadBlogImage = catchAsync(async (req, res, next) => {
    await passport.authenticate("user-jwt", { session: false }, (err, user, info) => {
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
            cb(null, { fieldName: file.fieldname });
          },
          key: (req, file, cb) => {
            const timestamp = Date.now().toString();
            const blog_id = req.body.blog_id;
            const path = `Blog-Images/${blog_id}/${timestamp}/${file.originalname}`;
            uploadedFiles.push({ path });
            req.body["blog_image_id"] = path;
            cb(null, req.body["blog_image_id"]);
          },
          contentType: multerS3.AUTO_CONTENT_TYPE,
        }),
      }).single("blog_image_file");
      fileUpload(req, res, (err) => {
        if (err) {
          Logger.error(err);
          res.error = "Blog article failed to insert";
          return next(500);
        } else {
          next();
        }
      });
    })(req, res, next);
  });


module.exports = {
  adminDashboard,
  adminTodoList,
  updateAdminTodo,
  propertyList,
  propertyFinanceLegal,
  vendorList,
  bookingList,
  vendorSettlement,
  bookingListFilter,
  commissionList,
  blogController,
  uploadBlogImage,
  featureController,
  couponController,
 
};


// // old admin controller 

// const passport = require("passport"),
//   aws = require("aws-sdk"),
//   multer = require("multer"),
//   multerS3 = require("multer-s3"),
//   { v4: uuid } = require("uuid"),
//   catchAsync = require("../utilities/catchAsync"),
//   Logger = require("../utilities/logger"),
//   { createPricingAndTaxCommission, updatePropertyStatus, addToFeaturedList, getCategoryNames, getPropertyNames, getAdminDashboardInfo, insertAdminTodo, getAdminTodoList, updateAdminTodo, deleteAdminTodo, getPropertyList, getPropertyFinanceLegal, getVendorList, getBookingList, getPricingAndTaxCommission, updatePricingAndTaxCommission, deletePricingAndTaxCommission, insertBlog, getBlog, updateBlog, deleteBlog, insertBookingNew, getFeaturedList, updateFeatured, deleteFeatured, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../services"),
//   couponController = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       // if (req.method === "GET" && req.query.property_name) {
//       //   response = await getPropertyNames();
//       //   if (response !== "ERR") {
//       //     res.data = response;
//       //     return next(200);
//       //   }
//       //   res.error = "Failed to fetch property names";
//       // }
//       if (req.method === "GET") {
//         let query = { ...req.query };
//         response = await getCoupons(query);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch coupon list";
//       }
//       if (req.method === "PUT") {
//         let params = { ...req.params };
//         let data = { ...req.body };
//         response = await updateCoupon(params, data);
//         if (response == 1) {
//           res.message = "Coupon updated successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       if (req.method === "POST") {
//         let params = { ...req.params };
//         let data = { ...req.body };
//         response = await createCoupon(params, data);
//         if (response == 1) {
//           res.message = "Added coupon successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       if (req.method === "DELETE") {
//         let params = { ...req.params };
//         response = await deleteCoupon(params);
//         if (response == 1) {
//           res.message = "Removed coupon successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   featureController = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET" && req.query.property_id) {
//         let query = { ...req.query };
//         response = await getCategoryNames(query);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch category names";
//       }
//       if (req.method === "GET" && req.query.property_name) {
//         response = await getPropertyNames();
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch property names";
//       }
//       if (req.method === "GET") {
//         response = await getFeaturedList(req.query.page_no, req.query.search_text);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch featured list";
//       }
//       if (req.method === "PUT") {
//         let params = { ...req.params };
//         let data = { ...req.body };
//         response = await updateFeatured(params, data);
//         if (response == 1) {
//           res.message = "Featured updated successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       if (req.method === "POST") {
//         let params = { ...req.params };
//         response = await addToFeaturedList(params);
//         if (response == 1) {
//           res.message = "Added room category to featured list";
//           next(200);
//         }
//         res.error = response;
//       }
//       if (req.method === "DELETE") {
//         let params = { ...req.params };
//         response = await deleteFeatured(params);
//         if (response == 1) {
//           res.message = "Removed room category from featured list";
//           next(200);
//         }
//         res.error = response;
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   bookingList = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       // if (!user || user.role !== "Admin") {
//       //   res.error = info.message;
//       //   return next(401);
//       // }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getBookingList(req.query.page_no, req.query.search_text, req.query.filter);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch booking list";
//       }
//       if (req.method === "POST") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await insertBookingNew(data);
//         if (response == 1) {
//           res.message = "Booking inserted successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   vendorList = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getVendorList(req.query.page_no, req.query.search_text);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch property finance legal";
//       }
//       if (req.method === "PUT") {
//         let params = { ...req.params };
//         let data = { ...req.body };
//         response = await updatePropertyStatus(params, data);
//         if (response == 1) {
//           res.message = "Property status updated successfully";
//           next(200);
//         }
//         res.error = response;
//       }
//       return next(500);
//     })(req, res, next);
//   }),

//   adminDashboard = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = await getAdminDashboardInfo();
//       if (response !== "ERR") {
//         res.data = response;
//         return next(200);
//       }
//       res.error = "Failed to fetch admin dashboard";
//       next(500);
//     })(req, res, next);
//   }),
  
//   adminTodoList = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getAdminTodoList();
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch admin todo";
//       }
//       if (req.method === "POST") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await insertAdminTodo(data);
//         if (response !== "ERR") {
//           res.message = "Admin Todo inserted successfully";
//           next(200);
//         }
//         res.error = "Failed to insert admin todo";
//       }
//       if (req.method === "PUT") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await updateAdminTodo(data);
//         if (response !== "ERR") {
//           res.message = "Admin Todo updated successfully";
//           next(200);
//         }
//         res.error = "Admin Todo failed to update";
//       }
//       if (req.method === "DELETE") {
//         response = await deleteAdminTodo(req.params.id);
//         if (response !== "ERR") {
//           res.message = "Admin Todo deleted successfully";
//           next(200);
//         }
//         res.error = "Admin Todo failed to delete";
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   propertyList = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getPropertyList(req.query.page_no, req.query.search_text);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch property list";
//       }
//       return next(500);
//     })(req, res, next);
//   }),

//   propertyFinanceLegal = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (user.user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getPropertyFinanceLegal(req.query.page_no, req.query.search_text);
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch property finance legal";
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   commissionList = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getPricingAndTaxCommission();
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch Pricing and Tax Commission";
//       }
//       if (req.method === "PUT") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await updatePricingAndTaxCommission(data);
//         if (response !== "ERR") {
//           res.message = "Pricing and Tax Commission updated successfully";
//           next(200);
//         }
//         res.error = "Pricing and Tax Commission failed to update";
//       }
//       if (req.method === "POST") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await createPricingAndTaxCommission(data);
//         if (response !== "ERR") {
//           res.message = "Pricing and Tax Commission updated successfully";
//           next(200);
//         }
//         res.error = "Pricing and Tax Commission failed to update";
//       }
//       if (req.method === "DELETE") {
//         response = await deletePricingAndTaxCommission(req.params.id);
//         if (response !== "ERR") {
//           res.message = "Pricing and Tax Commission deleted successfully";
//           next(200);
//         }
//         res.error = "Pricing and Tax Commission failed to delete";
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   blogController = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, async (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user || user.role !== "Admin") {
//         res.error = info.message;
//         return next(401);
//       }
//       let response = "ERR";
//       res.error = "System Error. Contact System Adminitrator.";
//       if (req.method === "GET") {
//         response = await getBlog();
//         if (response !== "ERR") {
//           res.data = response;
//           return next(200);
//         }
//         res.error = "Failed to fetch Blog";
//       }
//       if (req.method === "POST") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await insertBlog(data);
//         if (response !== "ERR") {
//           res.message = "Blog article inserted successfully";
//           next(200);
//         }
//         res.error = "Blog article failed to insert";
//       }
//       if (req.method === "PUT") {
//         let data = { ...req.body, [req.body.id]: req.body.value };
//         response = await updateBlog(data);
//         if (response !== "ERR") {
//           res.message = "Blog article updated successfully";
//           next(200);
//         }
//         res.error = "Blog article failed to update";
//       }
//       if (req.method === "DELETE") {
//         response = await deleteBlog(req.params.id);
//         if (response !== "ERR") {
//           res.message = "Blog article deleted successfully";
//           next(200);
//         }
//         res.error = "Blog article failed to delete";
//       }
//       return next(500);
//     })(req, res, next);
//   }),
//   uploadBlogImage = catchAsync(async (req, res, next) => {
//     await passport.authenticate("user-jwt", { session: false }, (err, user, info) => {
//       if (err) {
//         res.error = err || info.message;
//         return next(401);
//       }
//       if (!user) {
//         res.error = info.message;
//         return next(401);
//       }
//       let s3 = new aws.S3();
//       let fileUpload = multer({
//         storage: multerS3({
//           s3,
//           bucket: process.env.AWS_BUCKET,
//           metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//           },
//           key: (req, file, cb) => {
//             req.body["blog_image_id"] = uuid();
//             cb(null, req.body["blog_image_id"]);
//           },
//         }),
//       }).single("blog_image_file");
//       fileUpload(req, res, (err) => {
//         if (err) {
//           Logger.error(err);
//           res.error = "Blog article failed to insert";
//           return next(500);
//         } else {
//           next();
//         }
//       });
//     })(req, res, next);
//   });

// module.exports = {
//   adminDashboard,
//   adminTodoList,
//   updateAdminTodo,
//   propertyList,
//   propertyFinanceLegal,
//   vendorList,
//   bookingList,
//   commissionList,
//   blogController,
//   uploadBlogImage,
//   featureController,
//   couponController,
// };
