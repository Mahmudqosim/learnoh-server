const express = require("express")
const router = express.Router()

const { courseByID } = require("../controllers/course.controller.js")
const {
  findEnrollment,
  createEnrollment,
  isStudent,
  getEnrollment,
  complete,
  enrollmentByID,
  listEnrolled,
  enrollmentStats,
} = require("../controllers/enrollment.controller.js")

const { isAuthenticatedUser } = require("../middlewares/auth")

router.route("/enrolled").get(isAuthenticatedUser, listEnrolled)

router
  .route("/:enrollmentId")
  .get(isAuthenticatedUser, isStudent, getEnrollment)

router
  .route("/new/:courseId")
  .get(isAuthenticatedUser, findEnrollment, createEnrollment)

router
  .route("/complete/:enrollmentId")
  .put(isAuthenticatedUser, isStudent, complete)

router.route("/stats/:courseId").get(enrollmentStats)

router.param("courseId", courseByID)
router.param("enrollmentId", enrollmentByID)

module.exports = router
