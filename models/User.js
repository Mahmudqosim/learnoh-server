const { Schema, model } = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: "Please enter your first name",
      maxLength: [30, "Your name cannot exceed 30 characters"],
      minlength: [2, "Your name must be longer than 2 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: "Please enter your last name",
      maxLength: [30, "Your name cannot exceed 30 characters"],
      minlength: [2, "Your name must be longer than 2 characters"],
      trim: true,
    },
    username: {
      type: String,
      required: "Please enter your username",
      maxLength: [30, "Your name cannot exceed 30 characters"],
      minlength: [2, "Your name must be longer than 2 characters"],
      unique: "Username already exists. Choose a different one",
      trim: true,
    },
    email: {
      type: String,
      required: "Please enter your email",
      unique: "Username with email already exists. Choose a different one",
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    profilePhoto: {
      type: String,
    },
    educator: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: "Please enter your password",
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
)

// Encrypts password before saving user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10)
})

// Compare User password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Returns JWT Token
UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  })
}

// Generate password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate Token
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 20 * 60 * 1000

  return resetToken
}

module.exports = model("User", UserSchema)
