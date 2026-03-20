import { connectDB } from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

// PATCH: Accept an answer
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = params; // Answer ID

        const answer = await Answer.findById(id);
        if (!answer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        // Mark answer as accepted
        answer.isAccepted = true;
        await answer.save();

        // Update question to reference this as the accepted answer
        await Question.findByIdAndUpdate(answer.question, {
            acceptedAnswer: answer._id,
            isResolved: true
        });

        return NextResponse.json({ message: "Answer accepted successfully", answer });
    } catch (error) {
        console.error("Error accepting answer:", error);
        return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 });
    }
}
