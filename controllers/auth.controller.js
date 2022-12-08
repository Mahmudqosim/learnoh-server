const User = require("../models/User")

const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")

const crypto = require("crypto")
const gravatar = require("../utils/gravatar")

function generateUsername(firstName, lastName) {
  const randId = Math.random().toString(6).substring(2, 7)
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randId}`

  return username
}

// Register a user   => /api/auth/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body

  if (!firstName && !lastName && !email && !password) {
    return next(new ErrorHandler("Please fill in all fields.", 400))
  }

  const user = await User.create({
    firstName,
    lastName,
    username: generateUsername(firstName, lastName),
    email,
    password,
    profilePhoto: gravatar(email),
  })

  sendToken(user, 200, res)
})

// Login User  =>  /api/auth/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body

  // Checks if email and password is entered by user
  if (!username || !password) {
    return next(new ErrorHandler("Please enter email and password", 400))
  }

  // Finding user in database
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  }).select("+password")

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401))
  }

  // Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401))
  }

  sendToken(user, 200, res)
})

// Forgot Password   =>  /api/auth/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email

  if (!email) {
    return next(new ErrorHandler(`Please enter your email`, 400))
  }

  const user = await User.findOne({ email })

  if (!user) {
    return next(
      new ErrorHandler(`User with email: ${email} can not be found`, 404)
    )
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

  try {
    await sendEmail({
      email: user.email,
      subject: "Learno Password Recovery",
      message,
    })

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }
})

// Reset Password   =>  /api/auth/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400))
  }

  // Setup new password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  res.status(200).json({
    success: true,
    message:
      "Your password has been updated. You can login with the password now.",
  })
})

// Get currently logged in user details   =>   /api/auth/me
exports.getUserProfile = (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  })
}

// Update / Change password   =>  /api/auth/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password")

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword)
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect"))
  }

  user.password = req.body.password
  await user.save()

  sendToken(user, 200, res)
})

// Update user profile   =>   /api/auth/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    educator: req.body.educator,
  }

  // Update Profile Picture
  if (req.body.profilePhoto !== "") {
    newUserData.profilePhoto = req.body.profilePhoto
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    user,
  })
})
