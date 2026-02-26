import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
    {
        // Student who asked
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Question content
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            required: true,
        },

        // Voice-based question support
        isVoiceQuestion: {
            type: Boolean,
            default: false,
        },

        originalLanguage: {
            type: String,
            enum: ["English", "Sinhala", "Tamil"],
            default: "English",
        },

        translatedVersions: {
            english: String,
            sinhala: String,
            tamil: String,
        },

        // Academic Structure
        year: {
            type: String,
            required: true,
        },

        semester: {
            type: String,
            required: true,
        },

        module: {
            type: String,
            required: true,
            index: true,
        },

        topic: {
            type: String,
            required: true,
            index: true,
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        difficultyLevel: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
        },

        urgencyLevel: {
            type: String,
            enum: ["Normal", "Urgent"],
            default: "Normal",
        },

        // Engagement Tracking
        views: {
            type: Number,
            default: 0,
        },

        upvotes: {
            type: Number,
            default: 0,
        },

        answersCount: {
            type: Number,
            default: 0,
        },

        acceptedAnswer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer",
            default: null,
        },

        // Heatmap Fields
        keywords: [
            {
                type: String,
                index: true,
            },
        ],

        isResolved: {
            type: Boolean,
            default: false,
        },

        lastAnsweredAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Text index for AI search / similarity detection
QuestionSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.models.Question ||
    mongoose.model("Question", QuestionSchema);