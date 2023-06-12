const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
let ejs = require("ejs");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const session = require("express-session");
// const MongoStore = require("connect-mongo");
const passport = require("passport");
const aws = require("aws-sdk");
const { cronJobs } = require("../server/utilities/bookingScheduler");
const { notificationCronJobs } = require("../server/utilities/notificationScheduler")

/** ====== DotENV configuration */
dotenv.config({ path: require("find-config")(".env") });

const configurations = {
    production: { ssl: true, port: process.env.PORT, hostname: "" },
    development: {
        ssl: false,
        port: process.env.PORT,
        hostname: process.env.STAGE_HOSTNAME,
    },
    uat: {
        ssl: true,
    },
};

const environment = process.env.NODE_ENV || "development";
const config = configurations[environment];

const uri = require("./database");

const {
    corsMiddleware,
    morganMiddleware,
    responseHandlerMiddleware,
} = require("../server/middlewares");

const api = require("../server/routes");
const app = express();

/* var credentials = {
   key: fs.readFileSync("/etc/letsencrypt/live/myresorts.in/privkey.pem"),
   cert: fs.readFileSync("/etc/letsencrypt/live/myresorts.in/fullchain.pem"),
}; */

let server = config.ssl
    ? https.createServer({
        key: fs.readFileSync("/etc/letsencrypt/live/uat.myresorts.in/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/uat.myresorts.in/fullchain.pem"),
     }, app)
    : http.createServer(app);

aws.config.loadFromPath(path.resolve(__dirname, "./config.json"));

cronJobs();
notificationCronJobs();

app.use(cors());
app.all("/*", corsMiddleware);
app.options("*", cors());
app.use(morganMiddleware);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
// app.use(express.static(path.resolve(__dirname + "/../server/public")));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        // cookie: { secure: process.env.NODE_ENV == "development" ? false : true },
    })
);

require("./passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use(`/${process.env.API_VERSION}`, api);
app.use(responseHandlerMiddleware);

module.exports = server;
