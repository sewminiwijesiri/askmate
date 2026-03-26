import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema(
  {
    lecturerId: {
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
    name: {
      type: String,
      required: true,
    },
    reputation: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Lecturer) {
  delete mongoose.models.Lecturer;
}

const Lecturer = mongoose.model("Lecturer", LecturerSchema);
export default Lecturer;
