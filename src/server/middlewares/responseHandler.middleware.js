const Logger = require("../utilities/logger");

const responseHandlerMiddleware = (status, req, res, next) => {
  if (status !== 200) {
    Logger.error(res.exception || res.error);
    res.status(status).send({
      status: "error",
      message: res.exception || res.error,
    });
  } else if (status === 200) {
    res.status(200).send({
      status: "success",
      message: res.message,
      data: res.data,
    });
  } else {
    res.status(500).send({
      status: "error",
    });
  }
};

module.exports = { responseHandlerMiddleware };
