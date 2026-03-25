import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

// GET: Single question detail
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const question = await Question.findById(id)
            .populate("student", "email studentId")
            .populate({
                path: "acceptedAnswer",
                populate: { path: "student", select: "email studentId" }
            });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Increment views
        question.views += 1;
        await question.save();

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error fetching question:", error);
        return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
    }
}

// PATCH: Update question
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updatedQuestion = await Question.findByIdAndUpdate(id, body, { new: true });

        if (!updatedQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }
}

// DELETE: Remove question
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
    }
}
