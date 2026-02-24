import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, // e.g., 'pdf', 'docx', 'zip'
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'uploaderType',
    },
    uploaderType: {
      type: String,
      required: true,
      enum: ['Student', 'Lecturer', 'Helper'],
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
