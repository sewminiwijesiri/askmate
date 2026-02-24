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
  try {
    await connectDB();
    const data = await req.json();
    const newModule = await Module.create(data);
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
