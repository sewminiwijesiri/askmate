import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";
import Helper from "@/models/Helper";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

async function getUserFriendlyName(idStr) {
    if (!idStr) return "Unknown User";
    try {
        let query = { $or: [{ studentId: idStr }, { lecturerId: idStr }, { username: idStr }] };
        if (mongoose.Types.ObjectId.isValid(idStr)) {
            query.$or.push({ _id: idStr });
        }
        let user = await Student.findOne(query).select("name studentId") 
                || await Lecturer.findOne(query).select("name lecturerId") 
                || await Helper.findOne(query).select("name username");
        return user ? (user.name || user.studentId || user.lecturerId || user.username) : idStr;
    } catch (err) {
        return idStr;
    }
}

export async function GET() {
    try {
        await connectDB();
        const rawReports = await Report.find({}).sort({ createdAt: -1 }).lean();
        
        const reports = await Promise.all(rawReports.map(async (report) => {
            const reporterName = await getUserFriendlyName(report.reporterId);
            const reportedUserName = await getUserFriendlyName(report.reportedUserId);
            return {
                ...report,
                reporterName,
                reportedUserName
            };
        }));

        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, status } = body;
        const updatedReport = await Report.findByIdAndUpdate(id, { status }, { new: true });
        return NextResponse.json(updatedReport);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update report status" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "No id provided" }, { status: 400 });
        
        await Report.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
    }
}
