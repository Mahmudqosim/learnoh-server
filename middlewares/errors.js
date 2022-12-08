const ErrorHandler = require("../utils/ErrorHandler")


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errorMessage: err.message,
      stack: err.stack,
    })
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err }

    error.message = err.message

    // Handle Mongoose Object ID Error
    if(err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${error.path}`
      error = new ErrorHandler(message, 400)
    }
    
    // Handle Mongoose Validation Error
    if(err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(value => value.message)
      error = new ErrorHandler(message, 400)
    }

    // Handles mongoose duplicate key error
    if(err.code === 11000) {
      const message = `User already exists.`
      error = new ErrorHandler(message, 400)
    }

    // Handles invalid JWT error
    if(err.name === 'JsonWebTokenError') {
      const message = 'Token is invalid.'
      error = new ErrorHandler(message, 400)
    }

    
    // Handles expired JWT error
    if(err.name === 'TokenExpiredError') {
      const message = 'Token has expired.'
      error = new ErrorHandler(message, 400)
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    })
  }
}
