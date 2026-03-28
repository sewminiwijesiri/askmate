import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/Module";

export async function PATCH(req, { params }) {
  let requestData;
  let moduleId;
  try {
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
