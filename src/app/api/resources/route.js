import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import Module from "@/models/Module";
import cloudinary from "@/lib/cloudinary";
import pdf from "@/lib/ai/pdf-parser";
import ResourceChunk from "@/models/ResourceChunk";

import { ingestResource } from "@/lib/ai/ingestion";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    
    let query = {};
    if (moduleId) query.module = moduleId;
    if (userId) query.uploadedBy = userId;
    if (status) {
      if (status !== "all") query.status = status;
    } else {
      // Default to approved for public views
      query.status = "approved";
    }

    const resources = await Resource.find(query)
      .populate("module", "moduleName moduleCode")
      .sort({ createdAt: -1 });
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET /api/resources error:", error);
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
        
        // Extract text if it's a PDF
        if (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")) {
           try {
              const pdfData = await pdf(buffer);
              data.textContent = pdfData.text;
           } catch (pdfError) {
              console.error("PDF extraction error:", pdfError);
              // Continue anyway, but note it
           }
        }

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
      } else {
        data.url = formData.get("url");
      }
    } else {
      data = await req.json();
    }
    
    // Set initial status to pending for all resources (requires approval)
    data.status = "pending";
    
    // Create resource
    const newResource = await Resource.create(data);

    // Auto-ingest if approved
    if (newResource.status === "approved" && newResource.textContent) {
       await ingestResource(newResource);
    }

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


