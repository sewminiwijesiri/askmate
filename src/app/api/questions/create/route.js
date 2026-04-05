import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import Module from "@/models/Module";
import { translateQuestion } from "@/lib/ai/translation";

async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, body, moduleId } = await req.json();

    if (!title || !body || !moduleId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      return NextResponse.json({ message: "Module not found" }, { status: 404 });
    }

    // ── AUTOMATIC TRANSLATION ──
    let translatedVersions = { english: title, sinhala: "", tamil: "" };
    try {
      console.log("Auto-translating escalated question...");
      const translations = await translateQuestion(title, body, "");
      if (translations) {
        translatedVersions = {
          english: title,
          sinhala: translations.sinhala.title,
          tamil: translations.tamil.title,
          sinhalaDescription: translations.sinhala.description,
          tamilDescription: translations.tamil.description,
          sinhalaStuck: translations.sinhala.stuck,
          tamilStuck: translations.tamil.stuck
        };
      }
    } catch (transErr) {
      console.error("Escalation translation error:", transErr);
    }

    // Creating question based on existing Question model
    const newQuestion = new Question({
      student: user.id,
      title: title,
      description: body,
      year: moduleDoc.year.toString(),
      semester: moduleDoc.semester.toString(),
      module: moduleDoc.moduleName,
      topic: "AI Assistant Escalation", // Fallback topic
      isVoiceQuestion: false,
      urgencyLevel: "Normal",
      originalLanguage: "English",
      translatedVersions
    });

    await newQuestion.save();

    return NextResponse.json({
      ok: true,
      message: "Question sent to helpers successfully",
      questionId: newQuestion._id,
    });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
