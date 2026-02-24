import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: true,
    },
    moduleCode: {
      type: String,
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in development
const Module = mongoose.models.Module || mongoose.model("Module", ModuleSchema);

export default Module;
