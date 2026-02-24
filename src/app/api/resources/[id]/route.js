import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await req.json();
    const { userId } = data; // Identifier of the person trying to update

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Basic ownership check
    if (resource.uploadedBy !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedResource = await Resource.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedResource);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    
    // We should ideally check ownership here too
    // For simplicity, we'll allow delete if the userId matches in the body or query
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (resource.uploadedBy !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Resource.findByIdAndDelete(id);
    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
