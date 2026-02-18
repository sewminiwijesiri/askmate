import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Lecturer from "@/models/Lecturer";

export async function POST(req) {
  try {
    const { role, id, email, password, year, semester } = await req.json();

    if (!role || !id || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const formattedId = id.toUpperCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "student") {
        if (!year || !semester) {
            return NextResponse.json(
                { message: "Year and Semester are required for students" },
                { status: 400 }
            );
        }

        // Validate Student ID (IT + 8 digits)
        const studentIdPattern = /^IT\d{8}$/;
        if (!studentIdPattern.test(formattedId)) {
            return NextResponse.json(
                { message: "Invalid Student ID format. Example: IT23554689" },
                { status: 400 }
            );
        }

        const studentEmailPattern = new RegExp(`^${formattedId.toLowerCase()}@my\\.sliit\\.lk$`, 'i');
        if (!studentEmailPattern.test(email)) {
            return NextResponse.json(
                { message: `Email must be in the format ${formattedId.toLowerCase()}@my.sliit.lk` },
                { status: 400 }
            );
        }

        const existingStudent = await Student.findOne({ $or: [{ studentId: formattedId }, { email }] });
        if (existingStudent) {
            return NextResponse.json(
                { message: "Student already registered with this ID or Email" },
                { status: 400 }
            );
        }

        const studentData = {
            studentId: formattedId,
            email,
            password: hashedPassword,
            year,
            semester,
        };
        console.log("Creating student document with data:", JSON.stringify(studentData, null, 2));
        
        const newStudent = new Student(studentData);
        console.log("Mongoose document object keys:", Object.keys(newStudent.toObject()));
        
        await newStudent.save();

        return NextResponse.json(
            { message: "Student registered successfully" },
            { status: 201 }
        );

    } else if (role === "lecturer") {
        // Validate Lecturer ID (LC + 8 digits)
        const lecturerIdPattern = /^LC\d{8}$/;
        if (!lecturerIdPattern.test(formattedId)) {
            return NextResponse.json(
                { message: "Invalid Lecturer ID format. Example: LC12345678" },
                { status: 400 }
            );
        }

        const lecturerEmailPattern = new RegExp(`^${formattedId.toLowerCase()}@my\\.sliit\\.lk$`, 'i');
        if (!lecturerEmailPattern.test(email)) {
            return NextResponse.json(
                { message: `Email must be in the format ${formattedId.toLowerCase()}@my.sliit.lk` },
                { status: 400 }
            );
        }
        
        const existingLecturer = await Lecturer.findOne({ $or: [{ lecturerId: formattedId }, { email }] });
        if (existingLecturer) {
            return NextResponse.json(
                { message: "Lecturer already registered with this ID or Email" },
                { status: 400 }
            );
        }

        await Lecturer.create({
            lecturerId: formattedId,
            email,
            password: hashedPassword,
        });

        return NextResponse.json(
            { message: "Lecturer registered successfully" },
            { status: 201 }
        );
    } else {
        return NextResponse.json(
            { message: "Invalid role selected" },
            { status: 400 }
        );
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
