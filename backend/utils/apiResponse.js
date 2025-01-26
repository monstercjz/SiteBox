// backend/utils/apiResponse.js
const success = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      data: data,
    });
  };
  
  const error = (res, message, statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  };
  
  module.exports = {
    success,
    error,
  };