import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get("module");
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");

    const matchQuery = {};
    if (moduleName) matchQuery.module = moduleName;
    if (year) matchQuery.year = year;
    if (semester) matchQuery.semester = semester;

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: moduleName ? { module: "$module", topic: "$topic" } : "$module",
          totalQuestions: { $sum: 1 },
          unresolvedQuestions: {
            $sum: { $cond: [{ $eq: ["$isResolved", false] }, 1, 0] }
          },
          urgentQuestions: {
            $sum: { $cond: [{ $eq: ["$urgencyLevel", "Urgent"] }, 1, 0] }
          },
          difficultyScore: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficultyLevel", "Hard"] }, then: 3 },
                  { case: { $eq: ["$difficultyLevel", "Medium"] }, then: 2 },
                  { case: { $eq: ["$difficultyLevel", "Easy"] }, then: 1 }
                ],
                default: 2
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          module: moduleName ? "$_id.module" : "$_id",
          topic: moduleName ? "$_id.topic" : { $literal: "All Topics" },
          totalQuestions: 1,
          unresolvedQuestions: 1,
          urgentQuestions: 1,
          difficultyScore: 1,
          confusionScore: {
            $add: [
              { $multiply: ["$totalQuestions", 2] },
              { $multiply: ["$unresolvedQuestions", 5] },
              { $multiply: ["$urgentQuestions", 8] },
              { $multiply: ["$difficultyScore", 4] }
            ]
          }
        }
      },
      { $sort: { confusionScore: -1 } }
    ];

    const confusionData = await Question.aggregate(pipeline);

    return NextResponse.json({ success: true, data: confusionData });
  } catch (error) {
    console.error("Error fetching confusion data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch confusion data" },
      { status: 500 }
    );
  }
}
