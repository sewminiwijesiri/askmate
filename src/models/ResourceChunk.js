import mongoose from "mongoose";

const ResourceChunkSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    metadata: {
      page: Number,
      slide: Number,
      section: String,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for Phase 1 Keyword Search
ResourceChunkSchema.index({ moduleId: 1 });
ResourceChunkSchema.index({ chunkText: "text" });

const ResourceChunk =
  mongoose.models.ResourceChunk ||
  mongoose.model("ResourceChunk", ResourceChunkSchema);

export default ResourceChunk;
