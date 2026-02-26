import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
    {
        // Related Question
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
            index: true,
        },

        // Helper who answered
        helper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        // Integrity Control
        isConceptBased: {
            type: Boolean,
            default: true,
        },

        isAssignmentSolution: {
            type: Boolean,
            default: false,
        },

        // Feedback
        upvotes: {
            type: Number,
            default: 0,
        },

        downvotes: {
            type: Number,
            default: 0,
        },

        isAccepted: {
            type: Boolean,
            default: false,
        },

        // Quality metrics
        helpfulScore: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for fast sorting
AnswerSchema.index({ question: 1, upvotes: -1, createdAt: -1 });

export default mongoose.models.Answer ||
    mongoose.model("Answer", AnswerSchema);