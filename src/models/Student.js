import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

const Student = mongoose.model("Student", StudentSchema);
export default Student;
