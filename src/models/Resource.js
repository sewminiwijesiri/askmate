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
      enum: ["pdf", "word", "text", "link"],
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
      enum: ["student", "helper", "lecturer"],
    },
  },
  { timestamps: true }
);

const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

export default Resource;
