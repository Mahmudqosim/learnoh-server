const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const Course = require("../models/Course")
const APIFeatures = require("../utils/APIFeatures")
const ErrorHandler = require("../utils/errorHandler")

/* exports.listPublished = catchAsyncErrors(async (req, res) => {
  const COURSE_LIMIT = 5
  const coursesCount = await Course.countDocuments({ published: true })

  let hasNextPage = false

  let cursorQuery = { published: true }

  if (req.query.cursor && req.query.cursor.length) {
    cursorQuery._id = { $lt: req.query.cursor }
  }

  let courses = await Course.find(cursorQuery)
    .sort({ _id: -1 })
    .limit(COURSE_LIMIT + 1)

  courses.forEach((course) => {
    course.lessons = null
  })

  if (courses.length > COURSE_LIMIT) {
    hasNextPage = true

    courses = courses.slice(0, -1)
  }

  const newCursor = courses[courses.length - 1]._id

  return res.status(200).json({
    success: true,
    coursesCount,
    courses,
    hasNextPage,
    cursor: newCursor,
  })
}) */

exports.getCourses = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 2
  const coursesCount = await Course.countDocuments({ published: true })

  const apiFeatures = new APIFeatures(
    Course.find({ published: true }),
    req.query
  )
    .search()
    .filter()

  let courses = await apiFeatures.query
  let filteredCoursesCount = courses.length

  apiFeatures.pagination(resPerPage)
  courses = await apiFeatures.query

  courses = courses.map((c) => ({
    _id: c._id,
    name: c.name,
    description: c.description,
    category: c.category,
    image: c.image,
    published: c.published,
    enrolled: c.enrolled,
    instructor: c.instructor,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  res.status(200).json({
    success: true,
    resPerPage,
    coursesCount,
    filteredCoursesCount,
    courses,
  })
})

exports.isEducator = (req, res, next) => {
  const isEducator = req.profile && req.profile.educator

  if (!isEducator) {
    return res.status(403).json({
      success: false,
      message: "You're not an educator",
    })
  }

  next()
}

exports.createCourse = catchAsyncErrors(async (req, res, next) => {
  const { name, description, image, category } = req.body

  const course = new Course({
    name,
    description,
    category,
    image,
    instructor: req.profile._id,
  })

  await course.save()

  return res.status(201).json({
    success: true,
    course,
  })
})

exports.updateCourse = catchAsyncErrors(async (req, res) => {
  const { name, description, category, image, lessons } = req.body

  let course = req.course

  course.name = name
  course.description = description
  course.category = category
  course.image = image
  course.lessons = lessons

  await course.save()

  return res.status(201).json({
    success: true,
    course,
  })
})

exports.deleteCourse = catchAsyncErrors(async (req, res) => {
  let course = req.course

  await course.remove()

  return res.status(201).json({
    success: true,
    message: "Course has been deleted",
  })
})

exports.togglePublish = catchAsyncErrors(async (req, res) => {
  let course = req.course

  course.published = !course.published

  await course.save()

  return res.status(200).json({
    success: true,
    message: course.published ? "Course is published" : "Course is unpublished",
  })
})

exports.listByInstructor = catchAsyncErrors(async (req, res) => {
  let courses = await Course.find({ instructor: req.profile._id })
    .populate("instructor", "_id username")
    .exec()

  return res.status(200).json({
    success: true,
    courses,
  })
})

exports.courseByID = async (req, res, next, id) => {
  let course = await Course.findById(id).populate("instructor", "_id username")

  if (!course) {
    return next(new ErrorHandler("Course not found", 400))
  }

  req.course = course

  next()
}

exports.getCourse = async (req, res) => {
  return res.status(200).json({
    success: true,
    course: req.course,
  })
}

exports.isInstructor = (req, res, next) => {
  console.log(req.course.instructor._id, req.user._id)
  const isInstructor =
    req.course &&
    req.user &&
    req.course.instructor._id.toString() == req.user._id.toString()

  console.log(isInstructor)

  if (!isInstructor) next(new ErrorHandler("You are not authorized", 403))

  next()
}

exports.newLesson = catchAsyncErrors(async (req, res, next) => {
  const { title, content, resources } = req.body

  let result = await Course.findByIdAndUpdate(
    req.course._id,
    {
      $push: { lessons: { title, content, resources } },
    },
    { new: true }
  )
    .populate("instructor", "_id username")
    .exec()

  return res.status(200).json({
    success: true,
    result,
  })
})
