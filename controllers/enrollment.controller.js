const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const Enrollment = require("../models/Enrollment")
const ErrorHandler = require("../utils/errorHandler")

exports.findEnrollment = catchAsyncErrors(async (req, res, next) => {
  let enrollments = await Enrollment.find({
    course: req.course._id,
    student: req.user._id,
  })

  if (enrollments.length == 0) {
    next()
  } else {
    res.json(enrollments[0])
  }
})

exports.createEnrollment = catchAsyncErrors(async (req, res) => {
  let newEnrollment = {
    course: req.course._id,
    student: req.user._id,
  }

  newEnrollment.lessonStatus = req.course.lessons.map((lesson) => {
    return { lesson: lesson, complete: false }
  })

  const enrollment = await Enrollment.create(newEnrollment)

  return res.status(200).json({
    success: true,
    enrollment,
  })
})

exports.enrollmentByID = async (req, res, next, id) => {
  let enrollment = await Enrollment.findById(id)
    .populate({
      path: "course",
      populate: {
        path: "instructor",
      },
    })
    .populate("student", "_id username")

  if (!enrollment) return next(new ErrorHandler("Enrollment not found", 400))

  req.enrollment = enrollment

  next()
}

exports.isStudent = (req, res, next) => {
  const isStudent =
    req.user && req.user._id.toString() == req.enrollment.student._id.toString()

  if (!isStudent) return next(new ErrorHandler("You are not enrolled", 403))

  next()
}

exports.getEnrollment = (req, res) => {
  const enrollment = req.enrollment

  return res.status(200).json({
    success: true,
    enrollment,
  })
}

exports.complete = catchAsyncErrors(async (req, res) => {
  let updatedData = {}

  updatedData["lessonStatus.$.complete"] = req.body.complete

  if (req.body.courseCompleted) updatedData.completed = req.body.courseCompleted

  let enrollment = await Enrollment.updateOne(
    { "lessonStatus._id": req.body.lessonStatusId },
    { $set: updatedData }
  )
  return res.status(200).json({ success: true, enrollment })
})

exports.listEnrolled = catchAsyncErrors(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .sort({ completed: 1 })
    .populate("course", "_id name description category image published")

  return res.status(200).json({ success: true, enrollments })
})

exports.enrollmentStats = catchAsyncErrors(async (req, res) => {
  let stats = {}

  stats.totalEnrolled = await Enrollment.find({
    course: req.course._id,
  }).countDocuments()

  stats.totalCompleted = await Enrollment.find({ course: req.course._id })
    .exists("completed", true)
    .countDocuments()

  return res.status(200).json({ success: true, stats })
})
