import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import jwt from "jsonwebtoken";

const verifyAdminOrOwner = async (req, resource) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Fallback to body-based userId if no token (for backward compatibility if needed, 
    // but ideally we should transition to tokens everywhere)
    const { searchParams } = new URL(req.url);
    const userIdFromQuery = searchParams.get("userId");
    
    // We'll also try to get it from the body if it's a PATCH
    return resource.uploadedBy === userIdFromQuery;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === "admin") return true;
    return resource.uploadedBy === decoded.userId;
  } catch (err) {
    return false;
  }
};

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await req.json();
    const { userId } = data; // Legacy identifier

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const isAuthorized = await verifyAdminOrOwner(req, resource) || resource.uploadedBy === userId;
    
    if (!isAuthorized) {
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
    
    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const isAuthorized = await verifyAdminOrOwner(req, resource) || resource.uploadedBy === userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Resource.findByIdAndDelete(id);
    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
