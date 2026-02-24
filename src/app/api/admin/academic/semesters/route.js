import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Semester from "@/models/Semester";
import Year from "@/models/Year";
import jwt from "jsonwebtoken";

const verifyAdmin = (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === "admin" ? decoded : null;
  } catch {
    return null;
  }
};

export async function GET(req) {
  if (!verifyAdmin(req)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const yearId = searchParams.get("yearId");
    
    const query = yearId ? { yearId } : {};
    const semesters = await Semester.find(query).populate("yearId").sort({ name: 1 });
    return NextResponse.json(semesters, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch semesters" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!verifyAdmin(req)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  try {
    const { name, yearId } = await req.json();
    if (!name || !yearId) {
      return NextResponse.json({ message: "Name and yearId are required" }, { status: 400 });
    }
    const semester = await Semester.create({ name, yearId });
    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Semester already exists in this year" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create semester" }, { status: 500 });
  }
}
