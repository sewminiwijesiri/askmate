import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";
import Helper from "@/models/Helper";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    let user = null;
    if (decoded.role === "student") {
      user = await Student.findById(decoded.id).select("-password");
    } else if (decoded.role === "lecturer") {
      user = await Lecturer.findById(decoded.id).select("-password");
    } else if (decoded.role === "helper") {
      user = await Helper.findById(decoded.id).select("-password");
    } else if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const data = await req.json();
    await connectDB();

    let user = null;
    let Model = null;

    if (decoded.role === "student") Model = Student;
    else if (decoded.role === "lecturer") Model = Lecturer;
    else if (decoded.role === "helper") Model = Helper;
    else if (decoded.role === "admin") Model = Admin;

    if (!Model) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const updateData = { ...data };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    // Prevent ID updates
    delete updateData._id;
    delete updateData.studentId;
    delete updateData.studentID;
    delete updateData.lecturerId;
    delete updateData.username;

    user = await Model.findByIdAndUpdate(decoded.id, updateData, { new: true }).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    let Model = null;
    if (decoded.role === "student") Model = Student;
    else if (decoded.role === "lecturer") Model = Lecturer;
    else if (decoded.role === "helper") Model = Helper;
    else if (decoded.role === "admin") Model = Admin;

    if (!Model) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const result = await Model.findByIdAndDelete(decoded.id);

    if (!result) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
