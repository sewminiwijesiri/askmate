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
  },
  { timestamps: true }
);

export default mongoose.models.Lecturer || mongoose.model("Lecturer", LecturerSchema);
