const User = require("../models/User")

const jwt = require("jsonwebtoken")

const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("./catchAsyncErrors")

// Checks if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  
  const { authorization: token } = req.headers

  if (!token) {
    return next(new ErrorHandler("Login to access this resource", 401))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.id)

  if (!user) {
    return next(new ErrorHandler("Login to access this resource", 401))
  }

  req.user = user

  next()
})
