const mongoose = require("mongoose");
const Logger = require("../server/utilities/logger");

const uri = process.env.NODE_ENV === "development" ? process.env.MONGO_URI : process.env.MONGO_URI;

mongoose.Promise = global.Promise;

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("connected", () => {
  Logger.info("MongoDB connected.");
});

mongoose.connection.on("error", (err) => {
  Logger.error(err);
  throw new Error("Unable to connect to database.");
});

module.exports = uri;
