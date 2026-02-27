import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

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
        
        try {
          const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                folder: "askmate_resources"
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });
          
          data.url = uploadResponse.secure_url;
        } catch (fileError) {
          console.error("Cloudinary upload error:", fileError);
          return NextResponse.json({ error: "File upload to Cloudinary failed" }, { status: 500 });
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
