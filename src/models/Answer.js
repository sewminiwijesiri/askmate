import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isVoiceAnswer: {
            type: Boolean,
            default: false,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        isAccepted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);