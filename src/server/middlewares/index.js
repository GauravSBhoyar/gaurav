const { corsMiddleware } = require("./cors.middleware");
const { morganMiddleware } = require("./morgan.middleware");
const { responseHandlerMiddleware } = require("./responseHandler.middleware");
const { logIn } = require("./auth.middleware");

module.exports = {
  morganMiddleware,
  responseHandlerMiddleware,
  logIn,
  corsMiddleware,
};
