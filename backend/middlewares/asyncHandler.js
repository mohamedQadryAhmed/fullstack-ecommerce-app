const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  });
};

export default asyncHandler;
