import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

// GET: Aggregate heatmap data (keywords frequency by module)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const module = searchParams.get("module");

        const matchQuery = {};
        if (module) matchQuery.module = module;

        const heatmapData = await Question.aggregate([
            { $match: matchQuery },
            { $unwind: "$keywords" },
            {
                $group: {
                    _id: { module: "$module", keyword: "$keywords" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    module: "$_id.module",
                    keyword: "$_id.keyword",
                    count: 1
                }
            },
            { $sort: { count: -1 } },
            { $limit: 100 }
        ]);

        return NextResponse.json(heatmapData);
    } catch (error) {
        console.error("Error fetching heatmap data:", error);
        return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
    }
}
