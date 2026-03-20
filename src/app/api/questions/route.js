import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

// GET: List questions with filters
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const query = {};

        // Apply filters
        if (searchParams.get("module")) query.module = searchParams.get("module");
        if (searchParams.get("year")) query.year = searchParams.get("year");
        if (searchParams.get("semester")) query.semester = searchParams.get("semester");
        if (searchParams.get("difficulty")) query.difficultyLevel = searchParams.get("difficulty");
        if (searchParams.get("urgency")) query.urgencyLevel = searchParams.get("urgency");
        if (searchParams.get("isResolved")) query.isResolved = searchParams.get("isResolved") === "true";

        // Text Search
        const search = searchParams.get("q");
        if (search) {
            query.$text = { $search: search };
        }

        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .populate("student", "email studentId")
            .limit(50);

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}

// POST: Create a new question
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { title, description, module, year, semester, topic, student, difficultyLevel, urgencyLevel, tags, isVoiceQuestion, originalLanguage } = body;

        // 1. Basic Validation
        if (!title || !description || !module || !student) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Duplicate Detection (Simple check for similar title in same module)
        const existingQuestion = await Question.findOne({
            module,
            title: { $regex: new RegExp(`^${title.trim()}$`, "i") }
        });

        if (existingQuestion) {
            return NextResponse.json({
                error: "A similar question already exists in this module.",
                duplicateId: existingQuestion._id
            }, { status: 409 });
        }

        // 3. Keyword Extraction for Heatmap (Basic version)
        const keywords = [...new Set([
            ...title.toLowerCase().split(/\W+/).filter(w => w.length > 3),
            ...(tags || [])
        ])];

        // 4. Create Question
        const newQuestion = await Question.create({
            title,
            description,
            module,
            year,
            semester,
            topic,
            student,
            difficultyLevel: difficultyLevel || "Medium",
            urgencyLevel: urgencyLevel || "Normal",
            tags: tags || [],
            keywords,
            isVoiceQuestion: !!isVoiceQuestion,
            originalLanguage: originalLanguage || "English"
        });

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }
}
