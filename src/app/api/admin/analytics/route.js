import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Helper from "@/models/Helper";
import Lecturer from "@/models/Lecturer";
import Module from "@/models/Module";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // 1. Get user counts
    const studentCount = await Student.countDocuments();
    const helperCount = await Helper.countDocuments({ adminApproved: true });
    const lecturerCount = await Lecturer.countDocuments();
    const totalUsers = studentCount + helperCount + lecturerCount;

    // 2. Get content metrics
    const moduleCount = await Module.countDocuments();
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();

    // 3. Questions by module (for a bar chart or list)
    // We aggregate questions grouped by module name
    const questionsByModule = await Question.aggregate([
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 4. Activity over time (e.g. questions per day for the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const questionsOverTime = await Question.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format the questions over time to ensure all 7 days are represented
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = questionsOverTime.find(q => q._id === dateStr);
        last7Days.push({
            date: dateStr,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            count: found ? found.count : 0
        });
    }

    // 5. Unanswered queries percentage
    const answeredCount = await Question.countDocuments({ "answers.0": { $exists: true } });
    const answeredPercentage = questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        users: { total: totalUsers, students: studentCount, helpers: helperCount, lecturers: lecturerCount },
        content: { modules: moduleCount, questions: questionCount, answers: answerCount },
        questionsByModule,
        last7Days,
        answeredPercentage
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Analytics API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
