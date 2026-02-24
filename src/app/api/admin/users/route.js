import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Helper from "@/models/Helper";
import Lecturer from "@/models/Lecturer";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
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

    const students = await Student.find({}, "-password");
    const helpers = await Helper.find({}, "-password");
    const lecturers = await Lecturer.find({}, "-password");

    return NextResponse.json({
      students,
      helpers,
      lecturers
    }, { status: 200 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
