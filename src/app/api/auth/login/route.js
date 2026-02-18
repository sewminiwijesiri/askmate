import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    // Convert to uppercase
    const formattedStudentId = studentId.toUpperCase();

    // Validate IT format
    const studentIdPattern = /^IT\d{8}$/;

    if (!studentIdPattern.test(formattedStudentId)) {
      return NextResponse.json(
        { message: "Invalid Student ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      studentId: formattedStudentId,
    });

    if (!user) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // 🔐 Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        studentId: user.studentId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
