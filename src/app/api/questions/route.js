import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { translateQuestion, translateText } from "@/lib/ai/translation";

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
        const { title, description, module, year, semester, topic, student, difficultyLevel, urgencyLevel, tags, isVoiceQuestion, originalLanguage, whatIveTried, assignmentContext, codeSnippet, attachments } = body;

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

        // 4. Automatic Translation (Gemini)
        let translatedVersions = body.translatedVersions || { english: title, sinhala: "", tamil: "" };
        const lang = originalLanguage || "English";

        if (lang === "English" && !body.translatedVersions) {
            try {
                console.log("Triggering translation utility for English question...");
                const translations = await translateQuestion(title, description, whatIveTried);
                if (translations) {
                    console.log("Translations generated successfully.");
                    translatedVersions = {
                        english: title,
                        sinhala: translations.sinhala.title,
                        tamil: translations.tamil.title,
                        sinhalaDescription: translations.sinhala.description,
                        tamilDescription: translations.tamil.description,
                        sinhalaStuck: translations.sinhala.stuck,
                        tamilStuck: translations.tamil.stuck
                    };
                } else {
                    console.error("Translation utility returned NULL.");
                }
            } catch (err) {
                console.error("Critical failure in translation flow:", err);
            }
        }

        // 5. Create Question
        const newQuestion = await Question.create({
            title,
            description,
            whatIveTried,
            assignmentContext,
            codeSnippet,
            attachments: attachments || [],
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
            originalLanguage: lang,
            translatedVersions
        });

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }
}

// DELETE: Delete a question by ID
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
        }

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
    }
}
