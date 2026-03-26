import { connectDB } from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Helper from "@/models/Helper";
import Lecturer from "@/models/Lecturer";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();
        const { answerId, userId } = await req.json();

        if (!answerId) {
            return NextResponse.json({ error: "Answer ID is required" }, { status: 400 });
        }

        // 1. Find the answer
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        // 2. Increment upvotes on the answer
        answer.upvotes = (answer.upvotes || 0) + 1;
        await answer.save();

        // 3. Update author's reputation
        const authorId = answer.author;
        const authorType = answer.authorType;

        if (authorType === 'Helper') {
            await Helper.findByIdAndUpdate(authorId, { $inc: { reputation: 10 } });
        } else if (authorType === 'Lecturer') {
            await Lecturer.findByIdAndUpdate(authorId, { $inc: { reputation: 10 } });
        }

        return NextResponse.json({ 
            success: true, 
            upvotes: answer.upvotes,
            message: "Upvote successful and reputation updated." 
        }, { status: 200 });

    } catch (error) {
        console.error("Error upvoting answer:", error);
        return NextResponse.json({ error: "Failed to upvote answer" }, { status: 500 });
    }
}
