import mongoose from "mongoose";

const AiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
  },
  { timestamps: true }
);

const AiChat = mongoose.models.AiChat || mongoose.model("AiChat", AiChatSchema);

export default AiChat;
