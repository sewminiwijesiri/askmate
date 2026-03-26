import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
    deadlineTime: {
      type: String,
      required: true,
    },
    notificationTime: {
      type: String, // e.g., "1 hour before"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of the model during HMR in Next.js
const Reminder = mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);

export default Reminder;
