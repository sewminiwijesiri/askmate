import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";

export async function POST(req) {
  try {
    const { role, id, password } = await req.json();

    if (!role || !id || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const formattedId = id.toUpperCase();
    let user = null;
    let userRole = role;

    if (role === 'student') {
        user = await Student.findOne({ studentId: formattedId });
    } else if (role === 'lecturer') {
        user = await Lecturer.findOne({ lecturerId: formattedId });
    } else {
        return NextResponse.json(
            { message: "Invalid role" },
            { status: 400 }
        );
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
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
        userId: role === 'student' ? user.studentId : user.lecturerId,
        role: userRole,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
            id: user._id,
            userId: role === 'student' ? user.studentId : user.lecturerId,
            role: userRole,
            email: user.email
        }
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
