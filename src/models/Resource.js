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
    resourceType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Other",
    },
    url: {
      type: String,
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    uploadedBy: {
      type: String, // Storing internal userId (e.g. studentId) or ObjectId
      required: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    uploaderRole: {
      type: String,
      required: true,
      enum: ["student", "helper", "lecturer", "admin"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming there's a User model, if not use String for name/id
    },
  },
  { timestamps: true }
);

const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

export default Resource;
