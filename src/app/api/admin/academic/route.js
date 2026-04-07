import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/Module";

async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "admin" && user.role !== "lecturer" && user.role !== "student" && user.role !== "helper")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const modules = await Module.find({});
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  let requestData;
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "admin" && user.role !== "lecturer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    requestData = await req.json();

    // Check if there's a legacy index conflict (orphaned 'code_1' index from previous schema)
    try {
      // We only try to drop it if it might be causing issues
      await Module.collection.dropIndex("code_1");
      console.log("Dropped legacy 'code_1' index successfully.");
    } catch (e) {
      // It's fine if it doesn't exist
    }

    const newModule = await Module.create(requestData);
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("POST module error:", error, "Payload:", requestData);
    
    // Handle MongoDB duplicate key error (11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'moduleCode' 
        ? `Module code "${requestData.moduleCode}" already exists.` 
        : `Duplicate entry for ${field}.`;
      
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
