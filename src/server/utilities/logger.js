const { createLogger, format, transports } = require("winston");
const { colorize, combine, splat, timestamp, printf, json } = format;

const ignoreWhenTrue = format((info, opts) => {
  if (info.ignore) {
    return false;
  }
  return info;
});

const dateTime = () => {
  let date = new Date();
  return `${String(date.getFullYear())}-${String(date.getMonth()).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const levels = {
  error: 0,
  api: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "api";
};

require("winston").addColors({
  error: "red",
  api: "orange",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
});

const myFormat = combine(
  splat(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  ignoreWhenTrue(),
  json(),
  printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} \[${level}\](${process.env.NODE_ENV}) : ${message} `;
    if (Object.keys(metadata).length == 0) return msg;
    return (msg += JSON.stringify(metadata));
  })
);

let customTransports = [
  new transports.File({
    filename: `logs/error-${dateTime()}.log`,
    level: "error",
  }),
  new transports.File({ filename: `logs/all-${dateTime()}.log`, level: level(), format: myFormat }),
];

// if (process.env.NODE_ENV == "development" ) {
customTransports.push(
  new transports.Console({
    format: combine(colorize({ all: true }), myFormat),
  })
);
// }

const Logger = createLogger({
  level: level(),
  levels,
  format: myFormat,
  transports: customTransports,
});

module.exports = Logger;
