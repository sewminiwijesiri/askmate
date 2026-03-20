import { connectDB } from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

// POST: Create a new answer
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { question: questionId, student, content, isVoiceAnswer } = body;

        if (!questionId || !student || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the answer
        const newAnswer = await Answer.create({
            question: questionId,
            student,
            content,
            isVoiceAnswer: !!isVoiceAnswer
        });

        // Update question's answer count
        await Question.findByIdAndUpdate(questionId, {
            $inc: { answersCount: 1 },
            lastAnsweredAt: new Date()
        });

        return NextResponse.json(newAnswer, { status: 201 });
    } catch (error) {
        console.error("Error creating answer:", error);
        return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
    }
}

// GET: Get answers for a specific question (via query param)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get("questionId");

        if (!questionId) {
            return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
        }

        const answers = await Answer.find({ question: questionId })
            .populate("student", "email studentId")
            .sort({ createdAt: -1 });

        return NextResponse.json(answers);
    } catch (error) {
        console.error("Error fetching answers:", error);
        return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
    }
}
