import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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
    const years = await Year.find({}).sort({ name: 1 });
    return NextResponse.json(years, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch years" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!verifyAdmin(req)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    const year = await Year.create({ name });
    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Year already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create year" }, { status: 500 });
  }
}
