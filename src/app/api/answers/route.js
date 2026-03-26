import { connectDB } from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

// POST: Create a new answer
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { 
            question: questionId, 
            author: authorId, 
            authorType,
            content, 
            concept,
            hints,
            examples,
            supportingResources,
            isVoiceAnswer 
        } = body;

        if (!questionId || !authorId || !authorType || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the answer
        const newAnswer = await Answer.create({
            question: questionId,
            author: authorId,
            authorType,
            student: authorType === 'Student' ? authorId : undefined, // Compatibility
            content,
            concept,
            hints: hints || [],
            examples: examples || [],
            supportingResources: supportingResources || [],
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

import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";
import Helper from "@/models/Helper";

// GET: Get answers for a specific question (via query param)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get("questionId");

        if (!questionId) {
            return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
        }

        const rawAnswers = await Answer.find({ question: questionId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'name email studentId studentID lecturerId role'
            })
            .lean();

        // Compatibility mapping for frontend
        const answers = rawAnswers.map(ans => {
            if (ans.author) {
                ans.student = {
                    _id: ans.author._id,
                    name: ans.author.name,
                    email: ans.author.email,
                    studentId: ans.author.studentId || ans.author.studentID || ans.author.lecturerId,
                    role: ans.authorType.toLowerCase()
                };
            }
            return ans;
        });

        return NextResponse.json(answers);
    } catch (error) {
        console.error("Error fetching answers:", error);
        return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
    }
}
