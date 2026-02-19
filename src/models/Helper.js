import mongoose from "mongoose";

const HelperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    studentID: {
      type: String,
      required: true,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    expertiseLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
    },
    preferredModules: {
      type: [String],
    },
    availableForUrgentHelp: {
      type: Boolean,
      default: false,
    },
    reputation: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Helper || mongoose.model("Helper", HelperSchema);
