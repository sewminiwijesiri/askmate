import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const status = searchParams.get("status");
    
    let query = {};
    if (moduleId) query.module = moduleId;
    if (status) {
      if (status !== "all") query.status = status;
    } else {
      // Default to approved for public views
      query.status = "approved";
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    let data;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = {
        title: formData.get("title"),
        description: formData.get("description"),
        resourceType: formData.get("resourceType"),
        category: formData.get("category") || "Other",
        module: formData.get("module"),
        uploadedBy: formData.get("uploadedBy"),
        uploaderName: formData.get("uploaderName"),
        uploaderRole: formData.get("uploaderRole"),
      };
      
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
      } else {
        data.url = formData.get("url");
      }
    } else {
      data = await req.json();
    }
    
    // Set initial status
    if (data.uploaderRole === "admin" || data.uploaderRole === "lecturer") {
      data.status = "approved";
    } else {
      data.status = "pending";
    }
    
    // In a real app, we'd verify the user token here
    const newResource = await Resource.create(data);
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
