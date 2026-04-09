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

export async function PATCH(req, { params }) {
  let requestData;
  let moduleId;
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "admin" && user.role !== "lecturer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    moduleId = id;
    await connectDB();
    requestData = await req.json();
    const updatedModule = await Module.findByIdAndUpdate(id, requestData, { returnDocument: 'after' });
    if (!updatedModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("PATCH module error:", error, "ID:", moduleId, "Payload:", requestData);
    
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

export async function DELETE(req, { params }) {
  let moduleId;
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "admin" && user.role !== "lecturer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    moduleId = id;
    await connectDB();
    const deletedModule = await Module.findByIdAndDelete(id);
    if (!deletedModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });
    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("DELETE module error:", error, "ID:", moduleId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
