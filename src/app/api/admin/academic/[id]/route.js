import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/Module";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();
    const updatedModule = await Module.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedModule);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await Module.findByIdAndDelete(id);
    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
