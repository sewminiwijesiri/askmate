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
            required: false, // Made optional to support Lecturer/Helper authors
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'authorType'
        },
        authorType: {
            type: String,
            required: true,
            enum: ['Lecturer', 'Helper', 'Student']
        },
        content: {
            type: String,
            required: true,
        },
        concept: {
            type: String,
            trim: true
        },
        hints: [
            {
                type: String,
                trim: true
            }
        ],
        examples: [
            {
                type: String,
                trim: true
            }
        ],
        supportingResources: [
            {
                title: String,
                url: String
            }
        ],
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