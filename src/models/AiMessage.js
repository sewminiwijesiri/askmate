import mongoose from "mongoose";

const AiMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiChat",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: [
      {
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Resource",
        },
        title: String,
        page: Number,
        slide: Number,
        section: String,
      },
    ],
  },
  { timestamps: true }
);

const AiMessage =
  mongoose.models.AiMessage || mongoose.model("AiMessage", AiMessageSchema);

export default AiMessage;
