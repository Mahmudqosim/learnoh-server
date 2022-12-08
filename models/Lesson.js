const { Schema, model } = require("mongoose")

const LessonSchema = new Schema(
  {
    title: {
      type: String,
      required: "Lesson must have a title",
    },
    content: {
      type: Object,
      required: "Lesson must have a content",
    },
    resources: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = { LessonSchema, Lesson: model("Lesson", LessonSchema) }
