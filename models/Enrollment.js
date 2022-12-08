const { Schema, model } = require("mongoose")

const EnrollmentSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lessonStatus: [
      {
        lesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
        complete: Boolean,
      },
    ],
    completed: Date,
  },
  { timestamps: true }
)

module.exports = model("Enrollment", EnrollmentSchema)
