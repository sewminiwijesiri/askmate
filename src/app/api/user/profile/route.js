import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";
import Helper from "@/models/Helper";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        let userProfile = null;
        let role = "";
        
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        
        const query = isObjectId 
            ? { $or: [{ _id: userId }, { studentId: userId }, { lecturerId: userId }, { helperId: userId }] }
            : { $or: [{ studentId: userId }, { lecturerId: userId }, { helperId: userId }] };

        const student = await Student.findOne(query).select("-password").lean();
        if (student) {
            userProfile = student;
            role = "student";
        } else {
            const lecturer = await Lecturer.findOne(query).select("-password").lean();
            if (lecturer) {
                userProfile = lecturer;
                role = "lecturer";
            } else {
                const helper = await Helper.findOne(query).select("-password").lean();
                if (helper) {
                    userProfile = helper;
                    role = "helper";
                }
            }
        }

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ ...userProfile, role });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }
}
