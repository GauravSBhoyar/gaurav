const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
};

module.exports = { corsMiddleware };
