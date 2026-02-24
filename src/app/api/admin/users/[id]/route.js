import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Helper from "@/models/Helper";
import Lecturer from "@/models/Lecturer";
import jwt from "jsonwebtoken";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { action, role } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    if (role === 'helper' && action === 'approve') {
        const helper = await Helper.findByIdAndUpdate(id, { adminApproved: true }, { new: true });
        if (!helper) return NextResponse.json({ message: "Helper not found" }, { status: 404 });
        return NextResponse.json({ message: "Helper approved successfully", helper }, { status: 200 });
    }

    if (role === 'helper' && action === 'disapprove') {
        const helper = await Helper.findByIdAndUpdate(id, { adminApproved: false }, { new: true });
        if (!helper) return NextResponse.json({ message: "Helper not found" }, { status: 404 });
        return NextResponse.json({ message: "Helper disapproval successful", helper }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action or role" }, { status: 400 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { role } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    let deletedUser = null;
    if (role === 'student') deletedUser = await Student.findByIdAndDelete(id);
    else if (role === 'helper') deletedUser = await Helper.findByIdAndDelete(id);
    else if (role === 'lecturer') deletedUser = await Lecturer.findByIdAndDelete(id);

    if (!deletedUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
