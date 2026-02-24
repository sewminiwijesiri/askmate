import mongoose from "mongoose";

const SemesterSchema = new mongoose.Schema(
  {
    name: {
      type: String, // e.g., "Semester 1", "Semester 2"
      required: true,
    },
    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Year",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate semesters within the same year
SemesterSchema.index({ name: 1, yearId: 1 }, { unique: true });

export default mongoose.models.Semester || mongoose.model("Semester", SemesterSchema);
