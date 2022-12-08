const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

// Sets up config file
require("dotenv").config()

// Routes Import
const authRoutes = require("./routes/auth.routes")
const courseRoutes = require("./routes/course.routes")
const enrollmentRoutes = require("./routes/enrollment.routes")

const errorMiddleware = require("./middlewares/errors")

const app = express()

app.use(cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollment", enrollmentRoutes)

// Handles Errors
app.use(errorMiddleware)

module.exports = app
