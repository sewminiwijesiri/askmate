import { connectDB } from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

// PATCH: Update an answer's content
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updatedAnswer = await Answer.findByIdAndUpdate(
            id,
            { content: body.content },
            { new: true }
        );

        if (!updatedAnswer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        return NextResponse.json(updatedAnswer);
    } catch (error) {
        console.error("Error updating answer:", error);
        return NextResponse.json({ error: "Failed to update answer" }, { status: 500 });
    }
}

// DELETE: Remove an answer
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const deletedAnswer = await Answer.findByIdAndDelete(id);

        if (!deletedAnswer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        // Decrement the question's answer count
        await Question.findByIdAndUpdate(deletedAnswer.question, {
            $inc: { answersCount: -1 }
        });

        return NextResponse.json({ message: "Answer deleted successfully" });
    } catch (error) {
        console.error("Error deleting answer:", error);
        return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 });
    }
}
