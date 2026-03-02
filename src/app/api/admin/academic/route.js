import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/Module";

export async function GET(req) {
  try {
    await connectDB();
    const modules = await Module.find({});
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  let requestData;
  try {
    await connectDB();
    requestData = await req.json();

    // Check if there's a legacy index conflict (orphaned 'code_1' index from previous schema)
    try {
      // We only try to drop it if it might be causing issues
      await Module.collection.dropIndex("code_1");
      console.log("Dropped legacy 'code_1' index successfully.");
    } catch (e) {
      // It's fine if it doesn't exist
    }

    const newModule = await Module.create(requestData);
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("POST module error:", error, "Payload:", requestData);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
