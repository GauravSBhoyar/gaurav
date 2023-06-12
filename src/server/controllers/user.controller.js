const { result } = require("lodash");
const { ObjectId } = require("mongodb");


const passport = require("passport"),
  aws = require("aws-sdk"),
  multer = require("multer"),
  multerS3 = require("multer-s3"),
  { v4: uuid } = require("uuid"),
  catchAsync = require("../utilities/catchAsync"),
  Logger = require("../utilities/logger"),
  {
    getPropertyForUserWithFilters,
    getMostPopularProperty,
    getLocation,
    getRoomsForUser,
    getRoomPropertyDetails,
    getuserCoupons,
    getsimilar,
    getRoomCatGroupCard,
  } = require("../services"),
  { User, Property, Thought, Customer, Mail, Blog } = require("../models");
const { RoomCategory } = require("../models");
const {
  getRoomCategoryDetailsService,
  getRoomCategoryDetails,
  getRoomCatCard,
  getPropertyDetailsService,
} = require("../services/property.service");
const Faq = require("../models/faq.model");
const Blogform = require("../models/blogform.model");
const BlogComment = require("../models/blogform.model");
const About = require("../models/aboutus.model");
const User_Review = require("../models/userreview.model");
const Userreview = require("../models/userreview.model");
const Guestreview = require("../models/userreview.model");
const Gettouch = require("../models/gettouch.model");
userPropertyController = catchAsync(async (req, res, next) => {
  // await passport.authenticate(
  //     "user-jwt",
  //     { session: false },
  //     async (err, user, info) => {
  //         if (err) {
  //             res.error = err || info.message;
  //             return next(401);
  //         }
  //         if (!user) {
  //             res.error = info.message;
  //             return next(401);
  //         }
  //         let response = "ERR";
  //         res.error = "System Error. Contact System Adminitrator.";
  if (req.method === "GET" && req.originalUrl.includes("rooms")) {
    let query = { ...req.query };
    response = await getRoomsForUser(query, user);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property rooms";
  }
  // if (req.method === "GET" && req.originalUrl.includes("category")) {
  //     let query = { ...req.query };
  //     response = await getRoomCategoryDetailsService(query);
  //     if (response !== "ERR") {
  //         res.data = response;
  //         return next(200);
  //     }
  //     res.error = "Failed to fetch property category";
  // }
  if (req.method === "GET" && req.originalUrl.includes("location")) {
    let query = { ...req.query };
    //query.room_Ids = query.room_Ids.split(",");
    response = await getLocation(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property locations";
  }
  if (req.method === "GET" && req.originalUrl.includes("property")) {
    let query = { ...req.query };
    response = await getPropertyForUserWithFilters(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property list";
  }
  if (req.method === "GET" && req.originalUrl.includes("mostPopularProperty")) {
    let query = { ...req.query };
    response = await getMostPopularProperty(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property list";
  }
  // }
  // )(req, res, next);
});

const userCategoryController = catchAsync(async (req, res, next) => {
  // await passport.authenticate(
  //     "user-jwt",
  //     { session: false },
  //     async (err, user, info) => {
  //         if (err) {
  //             res.error = err || info.message;
  //             return next(401);
  //         }
  //         if (!user) {
  //             res.error = info.message;
  //             return next(401);
  //         }
  //         let response = "ERR";
  //         res.error = "System Error. Contact System Adminitrator.";
  if (req.method === "GET" && req.originalUrl.includes("rooms")) {
    let query = { ...req.query };
    response = await getRoomsForUser(query, user);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property rooms";
  }
  if (req.method === "GET" && req.originalUrl) {
    let query = { ...req.query };
    response = await getRoomCatCard(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property category";
  }
  if (req.method === "GET" && req.originalUrl.includes("location")) {
    let query = { ...req.query };
    //query.room_Ids = query.room_Ids.split(",");
    response = await getLocation(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property locations";
  }
  if (req.method === "GET" && req.originalUrl.includes("property")) {
    let query = { ...req.query };
    response = await getPropertyForUserWithFilters(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property list";
  }
  if (req.method === "GET" && req.originalUrl.includes("mostPopularProperty")) {
    let query = { ...req.query };
    response = await getMostPopularProperty(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property list";
  }
  // }
  // )(req, res, next);
});

const uploadProfilePic = catchAsync(async (req, res, next) => {
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
      let fileUpload = multer({
        storage: multerS3({
          s3,
          bucket: process.env.AWS_BUCKET,
          metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
          },
          key: (req, file, cb) => {
            req.body["user_pic_id"] = uuid();
            cb(null, req.body["user_pic_id"]);
          },
        }),
      }).single("user_profile_pic");

      fileUpload(req, res, (err) => {
        if (err) {
          Logger.error(err);
          res.error = "Failed to upload profile pic";
          return next(500);
        } else {
          try {
            User.updateOne(
              {
                _id: user._id,
              },
              {
                user_pic_id: req.body.user_pic_id,
              }
            ).then((result) => {
              if (!result) {
                res.error = "Failed to Upload Profile Picture";
                return next(500);
              }
              res.message = "Profile pic saved successfully";
              return next(200);
            });
          } catch (err) {
            Logger.error(err);
            res.error = "Failed to Upload Profile Picture";
            return next(500);
          }
        }
      });
    }
  )(req, res, next);
});

const getProfilePic = catchAsync(async (req, res, next) => {
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
      let s3 = new aws.S3();
      let image = await s3
        .getObject({
          Bucket: process.env.AWS_BUCKET,
          Key: user.user_pic_id,
        })
        .promise();
      if (image.Body) {
        res.data = image.Body;
        return next(200);
      }
      res.error = "Failed to get user profile pic";
      return next(500);
    }
  )(req, res, next);
});

// property details
const getPropertyDetails = catchAsync(async (req, res, next) => {
  if (req.method === "GET" && req.originalUrl) {
    let query = { ...req.query };
    response = await getPropertyDetailsService(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property rooms";
  }
});

// room details
const getRoomDetails = catchAsync(async (req, res, next) => {
  if (req.method === "GET" && req.originalUrl.includes("rooms")) {
    let query = { ...req.query };
    response = await getRoomPropertyDetails(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property rooms";
  }
});
// const getRoomCategories = catchAsync(async (req, res, next) => {
//     if (req.method === "GET" && req.originalUrl) {
//         let query = { ...req.query };
//         response = await getRoomCatCard(query);
//         if (response !== "ERR") {
//             res.data = response;
//             return next(200);
//         }
//         res.error = "Failed to fetch property rooms";
//     }
// });
//category




// const getRoomCategories = async (req, res, next) => {
//   const cat = req.query.category_id;
//   if (req.method === "GET" && req.originalUrl) {
//     response = await RoomCategory.findOne({ _id: cat }).then((result) => {
//       const lake = result;
//       const propid = result.property_id;

//       Property.findOne({ _id: propid }).then((result) => {
//         const propName = result;
//         if (result !== "ERR") {
//           res.data = lake;
//           res.message= result.property_policies
//           // res.message = result.property_basic_info.property_name;
//           return next(200);
//         }
//       });
//     });

//     res.error = "Failed to fetch property category";
//   }
// };

const getRoomCategories = catchAsync(async (req, res, next) => {
  if (req.method === "GET" && req.originalUrl) {
    let query = { ...req.query };
    response = await getRoomCategoryDetailsService(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property rooms";
  }
});


const getUserCoupon = async (req, res, next) => {
  if (req.method === "GET") {
    let query = { ...req.query };
    response = await getuserCoupons(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch coupon list";
  }
};

const getSimilarroom = async (req, res, next) => {
  if (req.method === "GET" && req.originalUrl) {
    let query = { ...req.query };
    response = await getsimilar(query);
    console.log(query, "tryin yekhf")
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property category";
  }
}


const getRoomGroupCard = catchAsync(async (req, res, next) => {
  if (req.method === "GET" && req.originalUrl.includes("roomgroupcategory")) {
    let query = { ...req.query };
    response = await getRoomCatGroupCard(query);
    if (response !== "ERR") {
      res.data = response;
      return next(200);
    }
    res.error = "Failed to fetch property category";
  }
});
const uploadThoughtImage = catchAsync(async (req, res, next) => {
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
            // const blog_id = req.body.blog_id;
            const path = `profile-images/${timestamp}/${file.originalname}`;
            uploadedFiles.push({ path });
            cb(null, path);
          },
          contentType: multerS3.AUTO_CONTENT_TYPE,
        }),
      }).single("profile-image");

      fileUpload(req, res, async (err) => {
        if (err) {
          console.error(err);
          res.error = "Failed to insert profile image";
          return next(500);
        } else {
          try {
            const data = {};
            const body = {};
            Object.assign(body, req.body);
            Object.assign(data, uploadedFiles[0]);
            data["file_category"] = "blog-image";
            data["file_size"] = req.file.size;

            console.log(user._id);

            const cdata = await Customer.findOne({ _id: req.body.id });
            const fullname = cdata.firstname + " " + cdata.lastname;
            console.log(fullname)
            const thinker = new Thought({
              title: body.title,
              name: fullname,
              Rating: body.Rating,
              file_paths: [data],
            });

            const result = await thinker.save();
            if (!result || result === "ERR") {
              console.error("Failed to insert thought with image");
              res.error = "Failed to insert thought with image";
              return next(500);
            }
            console.log("Inserted thought with image successfully");
            res.message = "Inserted thought with image successfully";
            return next(200);
          } catch (err) {
            console.error(err);
            res.error = "Failed to insert thought with image";
            return next(500);
          }
        }
      });
    }
  )(req, res, next);
});

const getThought = async (req, res, next) => {
  try {
    const think = await Thought.find();
    if (!think) {
      res.error = "No think found";
      return next(404);
    }
    res.data = think;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve think";
    return next(500);
  }
};
//categor

const Join_Our_Community = async (req, res) => {
  const { email } = req.body;

  try {
    const data = await new Mail({ email: email }).save();
    if (data) {
      res.status(201).send({
        message: "Email added successfully",
        data: data,
      });

    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add email");
  }
};


const getBloger = async (req, res, next) => {
  try {
    const blog = await Blog.find();
    if (!blog) {
      res.error = "No blog found";
      return next(404);
    }
    res.data = blog;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve blog";
    return next(500);
  }
};

const getBlogLimit = async (req, res, next) => {
  try {
    const blog = await Blog.find().limit(5);
    if (!blog || blog.length === 0) {
      res.error = "No blog found";
      return next(404);
    }
    res.data = blog;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve blog";
    return next(500);
  }
};

const getBlogerdetails = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.query.id });
    if (!blog) {
      res.error = "No blog found";
      return next(404);
    }
    res.data = blog;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve blog";
    return next(500);
  }
};

const blogCommentForm = async (req, res) => {
  const { message, name, email, blog_id, user_id } = req.body;

  try {

    let user_image;
    if (user_id) {
      const customer = await Customer.findById({ _id: user_id })

      if (customer.user_image) {
        const userImages = customer.user_image;
        user_image = userImages[userImages.length - 1];
      }
    }


    const comment = await BlogComment.create({ message, name, email, blog_id, user_id, user_image });
    if (comment) {
      res.status(201).send({
        message: "Comment Added Successfully",
        comment,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to Add Comment");
  }
};

const getBlogComment = async (req, res, next) => {
  try {
    const blogcomment = await BlogComment.find({ blog_id: req.query.blog_id }).sort({ createdAt: -1 });
    if (!blogcomment) {
      res.error = "No Blog Comment Found";
      return next(500);
    }
    res.data = blogcomment;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to Retrieve Comment";
    return next(500)
  }
};

const deleteBlogComment = async (req, res, next) => {
  const blogId = req.body._id;
  try {
    const deleteComment = await BlogComment.findByIdAndDelete(blogId);

    console.log(blogId, "blogId")

    if (deleteComment) {
      return res.status(200).send({
        message: "Blog Comment Deleted Successfully",
        result: deleteComment
      });
    } else {
      return res.status(404).send({
        message: "No Blog Comment Found",
        result: deleteComment
      });
    }
  }
  catch (error) {
    console.error(error)
    res.status(500).send({
      message: "Failed to Delete Blog Comment"
    });
  }
};

const createFaq = async (req, res) => {
  const { question, answer } = req.body;

  try {
    const faq = await new Faq({ question: question, answer: answer }).save();
    if (faq) {
      res.status(201).send({
        message: "Faq added successfully",
        faq: faq,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add faq");
  }
};


const faqQuestions = async (req, res, next) => {
  try {
    const faq = await Faq.find();
    if (!faq) {
      res.error = "No faq found";
      return next(500);
    }
    res.data = faq;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve faq";
    return next(500)
  }
};

const updatefaq = async (req, res) => {
  const { question, answer } = req.body;

  try {
    let existingfaq = await Faq.findOne({ _id: req.body._id });

    if (!existingfaq) {
      return res.status(404).send({
        message: "No existing Faq Found"
      });
    }

    existingfaq.question = question;
    existingfaq.answer = answer;

    const faqUpdate = await existingfaq.save();

    if (faqUpdate) {
      return res.status(200).send({
        message: "Faq Updated Successfully",
        faqUpdate: faqUpdate,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to Update Faq");
  }
};

const deleteFaq = async (req, res, next) => {
  const faqId = req.body._id
  try {
    const deletedFaq = await Faq.findByIdAndDelete(faqId);

    if (deletedFaq) {
      return res.status(200).send({
        message: "Faq Deleted Successfully !!!",
        result: faqId
      });
    }
    else {
      return res.status(404).send({
        message: "Faq Not Found !!!",
        result: faqId
      });
    }
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Failed to Delete Faq");
  }
};



const UserReview = async (req, res) => {
  const { review, rating, username, mobile, email, resort_id, user_id } = req.body;

  try {

    const customer = await Customer.findById({ _id: user_id })

    let user_image = ''

    if (customer.user_image) {
      const userImages = customer.user_image; // Assuming `user_image` is an array
      user_image = userImages[userImages.length - 1]; // Get the last element in the array
    }

    const reviews = await new Guestreview({ review, rating, username, mobile, email, resort_id, user_id, user_image }).save();
    if (reviews) {
      res.status(201).send({
        message: "Review Added Successfully",
        reviews: reviews,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to Add Review");
  }
};

const getUserReview = async (req, res, next) => {
  try {
    let user_review;

    if (req.query.resort_id) {
      user_review = await Guestreview.find({ resort_id: req.query.resort_id }).sort({ createdAt: -1 });

      let starRatings = user_review.map(review => review.rating);

      const sum = starRatings.reduce((acc, rating) => acc + rating, 0);
      const average = sum / starRatings.length;
      let averageRating = average.toFixed(2); // Rounded to 2 decimal places

      // Calculate the frequency of each star rating
      const frequency = {};
      starRatings.forEach(rating => {
        frequency[rating] = (frequency[rating] || 0) + 1;
      });

      // Calculate the percentage distribution
      let totalCount = starRatings.length;
      let percentageDistribution = {};
      for (const rating in frequency) {
        const count = frequency[rating];
        const percentage = (count / totalCount) * 100;
        percentageDistribution[rating] = percentage.toFixed(0); // Rounded to 2 decimal places
      }

      if (!user_review) {
        res.error = "No User Review Found";
        return next(404);
      }


      res.data = {
        user_reviews: user_review,
        averageRating: averageRating,
        totalCount: totalCount,
        percentageDistribution: percentageDistribution
      };
      return next(200);
    }
    else {
      user_review = await Guestreview.find({ rating: 5 }).sort({ createdAt: -1 }).limit(12);
      if (!user_review) {
        res.error = "No User Review Found";
        return next(404);
      }
      res.data = user_review;
      return next(200);
    }



  } catch (err) {
    console.error(err);
    res.error = "Failed to Retrieve User Review";
    return next(500)
  }
};

const deleteReview = async (req, res, next) => {
  const reviewId = req.body._id;
  console.log(reviewId, "reivew id")
  try {
    const deletedUserReview = await Guestreview.findByIdAndDelete(reviewId);

    if (deletedUserReview) {
      return res.status(200).send({
        message: "Review Deleted Successfully !!!",
        result: reviewId
      });
    }
    else {
      return res.status(404).send({
        message: "Review Not Found !!!",
        result: reviewId
      });
    }
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Failed to Delete Review");
  }
};

// const getTouchWithUs = async(req,res)=> {
//   const { office,mobile,address,follow } = req.body;

//   try {
//     const gettouch = await new Gettouch({ office:office,mobile:mobile,address:address,follow:follow }).save();
//     if (gettouch){
//       res.status(200).send({
//         message: "Data Added Successfully",
//         gettouch: gettouch,
//       });
//   }
//   } catch (error){
//     console.error(error);
//     res.status(500).send("Failed to Add Contacts")
//   }
// };

const createAboutus = async (req, res) => {
  const { title, info, luxury, attractive, happy } = req.body;

  try {
    const existingdata = await About.findOne();
    if (existingdata) {
      res.status(400).send({
        message: "Only one data allowed",
      });
      return;
    }

    const aboutus = await new About({ title: title, info: info, luxury: luxury, attractive: attractive, happy: happy }).save();
    if (aboutus) {
      res.status(201).send({
        message: "About us Data Added Successfully",
        aboutus: aboutus,
      });
    };
  } catch (error) {
    console.error(err);
    res.status(500).send("Failed to add About us Data")
  }
};


const getAboutus = async (req, res, next) => {
  try {
    const aboutus = await About.find();
    if (!aboutus) {
      res.error = "No About us Data Found";
      return next(500);
    }
    res.data = aboutus;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to retrieve About us";
    return next(500)
  }
};


const updateAboutUs = async (req, res) => {
  const { title, info, luxury, attractive, happy } = req.body;

  try {
    const existingdata = await About.findOne();
    if (!existingdata) {
      res.status(404).send({
        message: "No existing data found",
      });
      return;
    }

    existingdata.title = title;
    existingdata.info = info;
    existingdata.luxury = luxury;
    existingdata.attractive = attractive;
    existingdata.happy = happy;

    const updateAbout = await existingdata.save();

    if (updateAbout) {
      res.status(200).send({
        message: "Data Updated Successfully",
        updateAbout: updateAbout,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to Update About Us");
  }
};


const getTouchWithUs = async (req, res) => {
  const { office, mobile, address, follow } = req.body;

  try {
    const existingRecord = await Gettouch.findOne();
    if (existingRecord) {
      res.status(400).send({
        message: "Only one record allowed",
      });
      return;
    }

    const gettouch = await new Gettouch({
      office: office,
      mobile: mobile,
      address: address,
      follow: follow,
    }).save();

    if (gettouch) {
      res.status(200).send({
        message: "Data Added Successfully",
        gettouch: gettouch,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to Add Contacts");
  }
};


const getTouchWith = async (req, res, next) => {
  try {
    const gettouchwith = await Gettouch.find();
    if (!gettouchwith) {
      res.error = "No Contact Found"
      return next(500);
    }
    res.data = gettouchwith;
    return next(200);
  } catch (err) {
    console.error(err);
    res.error = "Failed to Retrieve Contact Us"
    return next(500);
  }
};


const updateTouchWithUs = async (req, res) => {
  const { office, mobile, address, follow } = req.body;

  try {
    const existingRecord = await Gettouch.findOne();
    if (!existingRecord) {
      res.status(404).send({
        message: "No existing record found",
      });
      return;
    }

    existingRecord.office = office;
    existingRecord.mobile = mobile;
    existingRecord.address = address;
    existingRecord.follow = follow;

    const updatedTouch = await existingRecord.save();

    if (updatedTouch) {
      res.status(200).send({
        message: "Data Updated Successfully",
        updatedTouch: updatedTouch,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to Update Contacts");
  }
};

const uploadUserImage = async (req, res, next) => {
  const s3 = new aws.S3();
  const uploadedFiles = [];
  const fileUpload = multer({
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
        const timestamp = Date.now().toString();
        let user_id = req.body.user_id;
        const path = `User-images/${user_id}/${timestamp}/${file.originalname}`;
        uploadedFiles.push({ path });
        req.file_ids = uploadedFiles;
        cb(null, path);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
  }).single("user-image");

  fileUpload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.error = "Failed to Upload User Profile Pic";
      return next(500);
    } else {
      try {
        let body = { ...req.body }; // Use spread operator for object cloning
        let userId = req.body.user_id
        let fileId = req.file.location; // Accessing the first element of the array

        const result = await Customer.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              "user_image": fileId,
            },
          },
          { upsert: true, new: true }
        );

        // const result = true;

        if (!result) {
          console.error("Failed to Upload User Profile Pic");
          res.error = "Failed to Upload User Profile Pic";
          return next(500);
        }
        res.message = "Uploaded Profile Pic Successfully";
        return next(200);
      } catch (err) {
        console.error(err);
        res.error = "Failed to Upload User Profile Pic";
        return next(500);
      }
    }
  });

}


const getAmenitiesWithTravelMood = async (req, res) => {
  const travelMood = req.query.travelMood;
  console.log(travelMood)
  // const travelMood = "adventure";
  try {
    // Execute the query
    const data = await RoomCategory.find({ "category_amenities.travel_moods": { $in: [travelMood] } });
    console.log(data);
    res.send(data);
    // Return the data
    return data;
  } catch (err) {
    console.error(err);
    // Throw the error to be handled by the calling function
    throw new Error(err.message);
  }
};


module.exports = {

  userPropertyController,
  uploadProfilePic,
  getProfilePic,
  getRoomDetails,
  getPropertyDetails,
  getRoomCategories,
  userCategoryController,
  getUserCoupon,
  getSimilarroom,
  getRoomGroupCard,
  Join_Our_Community,
  getThought,
  uploadThoughtImage,
  getBloger,
  createFaq,
  faqQuestions,
  updatefaq,
  deleteFaq,
  getBlogLimit,
  blogCommentForm,
  deleteBlogComment,
  getBlogComment,
  createAboutus,
  getAboutus,
  UserReview,
  getUserReview,
  deleteReview,
  getTouchWithUs,
  getTouchWith,
  updateTouchWithUs,
  updateAboutUs,
  getBlogerdetails,
  uploadUserImage,
  getAmenitiesWithTravelMood
};
