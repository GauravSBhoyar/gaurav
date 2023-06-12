const server = require("./config/express");
const Logger = require("./server/utilities/logger");
const port = process.env.PORT || 3000;
server.listen(port, () => {
  Logger.info(`Server up on port ${port} (${process.env.NODE_ENV})`);
});

module.exports = server;
