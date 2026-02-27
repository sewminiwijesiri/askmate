import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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
    
    if (decoded.role === "admin" || decoded.role === "lecturer") return true;
    return resource.uploadedBy === decoded.userId;
  } catch (err) {
    return false;
  }
};

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    
    let data;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = {
        title: formData.get("title"),
        description: formData.get("description"),
        resourceType: formData.get("resourceType"),
        category: formData.get("category"),
        status: formData.get("status"),
      };
      
      // Remove undefined fields
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      const file = formData.get("file");
      if (file && typeof file !== "string") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name || "upload";
        const fileExt = originalName.includes(".") ? originalName.split(".").pop() : "bin";
        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const uploadDir = join(process.cwd(), "public", "uploads");
        
        try {
          await mkdir(uploadDir, { recursive: true });
          await writeFile(join(uploadDir, filename), buffer);
          data.url = `/uploads/${filename}`;
        } catch (fileError) {
          console.error("File upload error:", fileError);
          return NextResponse.json({ error: "File upload failed" }, { status: 500 });
        }
      }
    } else {
      data = await req.json();
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const isAuthorized = await verifyAdminOrOwner(req, resource) || resource.uploadedBy === data.userId;
    
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
