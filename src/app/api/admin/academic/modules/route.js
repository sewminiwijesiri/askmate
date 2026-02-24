import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/Module";
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
    const semesterId = searchParams.get("semesterId");
    
    const query = semesterId ? { semesterId } : {};
    const modules = await Module.find(query).populate({
      path: 'semesterId',
      populate: { path: 'yearId' }
    }).sort({ name: 1 });
    return NextResponse.json(modules, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!verifyAdmin(req)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();
  try {
    const { name, code, semesterId, description } = await req.json();
    if (!name || !code || !semesterId) {
      return NextResponse.json({ message: "Name, code and semesterId are required" }, { status: 400 });
    }
    const module = await Module.create({ name, code, semesterId, description });
    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Module code already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create module" }, { status: 500 });
  }
}
