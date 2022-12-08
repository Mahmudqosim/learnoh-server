const User = require("../models/User")
const ErrorHandler = require("../utils/errorHandler")

exports.userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)

    if (!user) return next(new ErrorHandler("User not found", 400))

    req.profile = user

    next()
  } catch (err) {
    return next(new ErrorHandler("Could not retrieve user", 400))
  }
}
