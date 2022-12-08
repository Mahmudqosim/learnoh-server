const express = require("express")
const router = express.Router()

const {
  isInstructor,
  createCourse,
  listByInstructor,
  getCourse,
  courseByID,
  newLesson,
  isEducator,
  updateCourse,
  deleteCourse,
  togglePublish,
  getCourses,
} = require("../controllers/course.controller.js")

const { userByID } = require("../controllers/user.controller")

const { isAuthenticatedUser } = require("../middlewares/auth")

router.route("/search").get(getCourses)

router
  .route("/by/:userId")
  .post(isAuthenticatedUser, isEducator, createCourse)
  .get(isAuthenticatedUser, listByInstructor)

router
  .route("/:courseId")
  .get(getCourse)
  .put(isAuthenticatedUser, isInstructor, updateCourse).delete(isAuthenticatedUser, isInstructor, deleteCourse)

router
  .route("/:courseId/publish")
  .get(getCourse)
  .put(isAuthenticatedUser, isInstructor, togglePublish)

router
  .route("/:courseId/lesson/new")
  .put(isAuthenticatedUser, isInstructor, newLesson)

router.param("userId", userByID)
router.param("courseId", courseByID)

module.exports = router
