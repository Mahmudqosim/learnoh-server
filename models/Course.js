const { Schema, model } = require("mongoose")
const { LessonSchema } = require("./Lesson")

const CourseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      required: "Category is required",
    },
    enrolled: [{ type: Schema.Types.ObjectId, ref: "User" }],
    published: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lessons: [LessonSchema],
  },
  { timestamps: true }
)

module.exports = model("Course", CourseSchema)
