import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import ResourceChunk from "@/models/ResourceChunk";

async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["admin", "lecturer", "helper"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { resourceId } = await req.json();
    if (!resourceId) {
      return NextResponse.json(
        { message: "Resource ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    // Determine text source
    const textContent =
      resource.textContent || resource.content || resource.description || "";

    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No extractable text found",
        chunksCount: 0,
      });
    }

    // Chunking logic: ~1500 chars with 200 overlap
    const chunkSize = 1500;
    const overlap = 200;
    const chunks = [];

    for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
      const chunk = textContent.slice(i, i + chunkSize);
      chunks.push(chunk);
      if (i + chunkSize >= textContent.length) break;
    }

    // Clear existing chunks for this resource
    await ResourceChunk.deleteMany({ resourceId });

    // Save chunks
    const chunkDocs = chunks.map((text, index) => ({
      resourceId: resource._id,
      moduleId: resource.module,
      chunkText: text,
      metadata: {
        section: resource.title,
        // page and slide are optional
      },
    }));

    await ResourceChunk.insertMany(chunkDocs);

    return NextResponse.json({
      ok: true,
      message: "Resource ingested successfully",
      chunksCount: chunkDocs.length,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
