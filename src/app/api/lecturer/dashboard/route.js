import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Module from "@/models/Module";
import Student from "@/models/Student";
import Helper from "@/models/Helper";
import Question from "@/models/Question";

export async function GET(req) {
  try {
    await connectDB();

    // 1. Get Total Active Modules
    const moduleCount = await Module.countDocuments();

    // 2. Get Total Enrolled Students (Students + Helpers)
    const studentCount = await Student.countDocuments();
    const helperCount = await Helper.countDocuments();
    const totalStudents = studentCount + helperCount;

    // 3. Get Pending Queries (Questions where isResolved is false)
    const pendingQueries = await Question.countDocuments({ isResolved: false });

    // 4. Get some active modules with real query counts
    const modules = await Module.find().limit(3).lean();
    
    const activeModules = await Promise.all(
      modules.map(async (mod) => {
        // Find queries specifically for this module
        const queries = await Question.countDocuments({ 
            module: mod.moduleCode, 
            isResolved: false 
        });
        
        return {
          code: mod.moduleCode,
          name: mod.moduleName,
          students: Math.floor(totalStudents * (Math.random() * 0.4 + 0.3)), // simulated enrollment based on real total
          queries: queries,
          progress: Math.floor(Math.random() * 40) + 40 // Simulated syllabus progress
        };
      })
    );

    // 5. Get top peer helpers across platform
    const topHelpers = await Helper.find({ adminApproved: true })
        .sort({ reputation: -1 })
        .limit(3)
        .lean();

    const topPeers = topHelpers.map(h => ({
        name: h.name || h.username || h.studentId,
        id: h.studentId,
        pts: h.reputation || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeModules: moduleCount,
          totalStudents: totalStudents,
          pendingQueries: pendingQueries,
          engagement: "84%" // Place holder metric
        },
        activeModules: activeModules,
        topPeers: topPeers,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Lecturer Dashboard Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
