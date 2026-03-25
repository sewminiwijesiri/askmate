import mongoose from "mongoose";

const ConfusionAnalyticsSchema = new mongoose.Schema({
    module: {
        type: String,
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        index: true
    },
    year: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    repeatedKeywords: [{
        type: String
    }],
    unansweredCount: {
        type: Number,
        default: 0
    },
    delayedAnswerCount: {
        type: Number,
        default: 0
    },
    averageDifficulty: {
        type: Number,
        default: 0
    },
    urgencyScore: {
        type: Number,
        default: 0
    },
    similarityScore: {
        type: Number,
        default: 0
    },
    keywordScore: {
        type: Number,
        default: 0
    },
    confusionScore: {
        type: Number,
        default: 0
    },
    heatLevel: {
        type: String,
        enum: ["Red", "Orange", "Green"],
        default: "Green"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient searching
ConfusionAnalyticsSchema.index({ module: 1, topic: 1, year: 1, semester: 1 });

export default mongoose.models.ConfusionAnalytics || mongoose.model("ConfusionAnalytics", ConfusionAnalyticsSchema);
