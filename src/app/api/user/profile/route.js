import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";
import Helper from "@/models/Helper";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
    try {
        await connectDB();
        
        // Attempt to get user from token first (for current user view)
        const currentUser = await getAuthUser(req);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || (currentUser ? currentUser.id : null);

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        let userProfile = null;
        let role = "";
        
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        const query = isObjectId 
            ? { _id: userId } 
            : { $or: [{ studentId: userId }, { lecturerId: userId }, { studentID: userId }] };

        // Search through all possible models
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
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: { ...userProfile, role } }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ message: "Failed to fetch user profile" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const currentUser = await getAuthUser(req);

        if (!currentUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        let userModel;
        
        // Define allowed fields per role to prevent state bleeding/pollution
        const fieldsByRole = {
            student: ["email", "year", "semester", "password"],
            lecturer: ["email", "name", "password"],
            helper: ["email", "name", "graduationYear", "skills", "password", "expertiseLevel", "preferredModules"]
        };

        const allowedFields = fieldsByRole[currentUser.role] || [];
        const filteredData = {};

        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                // Don't allow clearing required fields with empty strings
                if ((field === "name" || field === "email") && data[field] === "") return;
                filteredData[field] = data[field];
            }
        });

        if (currentUser.role === "student") userModel = Student;
        else if (currentUser.role === "lecturer") userModel = Lecturer;
        else if (currentUser.role === "helper") userModel = Helper;
        else return NextResponse.json({ message: "Invalid role" }, { status: 403 });

        // Update profile
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: currentUser.id },
            { $set: filteredData },
            { returnDocument: 'after', runValidators: true }
        ).select("-password").lean();

        if (!updatedUser) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Profile updated successfully!", 
            user: { ...updatedUser, role: currentUser.role } 
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const currentUser = await getAuthUser(req);

        if (!currentUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let userModel;
        if (currentUser.role === "student") userModel = Student;
        else if (currentUser.role === "lecturer") userModel = Lecturer;
        else if (currentUser.role === "helper") userModel = Helper;
        else return NextResponse.json({ message: "Invalid role" }, { status: 403 });

        await userModel.deleteOne({ _id: currentUser.id });

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting profile:", error);
        return NextResponse.json({ message: "Failed to delete account" }, { status: 500 });
    }
}
