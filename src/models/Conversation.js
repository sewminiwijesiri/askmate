import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  locale: {
    type: String,
    enum: ['en-US', 'si-LK', 'ta-LK'],
    default: 'en-US'
  },
  question: {
    original: { type: String, required: true },
    translated: { type: String }, // Always translated to English if original is not English
    language: { type: String }
  },
  answer: {
    original: { type: String, required: true }, // English response from LLM
    translated: { type: String }, // Translated to the student's target language
    audioUrl: { type: String } // Path to generated TTS file if applicable
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
