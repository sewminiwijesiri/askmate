import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    
    const query = moduleId ? { module: moduleId } : {};
    const resources = await Resource.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    
    // In a real app, we'd verify the user token here
    // For now, we expect uploader info in the body
    
    const newResource = await Resource.create(data);
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
