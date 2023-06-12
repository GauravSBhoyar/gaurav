const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    res.error = err;
    next(400);
  });
};

module.exports = catchAsync;
