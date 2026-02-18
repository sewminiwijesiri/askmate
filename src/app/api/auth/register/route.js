import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { studentId, password } = await req.json();

    if (!studentId || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert to uppercase (professional touch)
    const formattedStudentId = studentId.toUpperCase();

    // Validate IT student format (IT + 8 digits)
    const studentIdPattern = /^IT\d{8}$/;

    if (!studentIdPattern.test(formattedStudentId)) {
      return NextResponse.json(
        { message: "Invalid Student ID format. Example: IT23554689" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      studentId: formattedStudentId,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Student already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      studentId: formattedStudentId,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Student registered successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
