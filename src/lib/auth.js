import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

/**
 * Verifies the JWT from the request header and returns the user object.
 * @param {Request} req 
 * @returns {Promise<Object|null>} Decoded user token or null.
 */
export async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware-like helper to verify if the logged-in user is a student
 * and optionally check if the studentId in the request matches their own.
 * @param {Request} req 
 * @param {string} studentIdToMatch (Optional) The studentId to check against.
 * @returns {Promise<{ user: Object, studentDoc: Object } | Response>}
 */
export async function verifyStudent(req, studentIdToMatch = null) {
  const decoded = await getAuthUser(req);
  
  if (!decoded) {
    return { error: "Unauthorized", status: 401 };
  }

  if (decoded.role !== "student") {
    return { error: "Forbidden: Students only", status: 403 };
  }

  await connectDB();
  const studentDoc = await Student.findById(decoded.id);

  if (!studentDoc) {
    return { error: "Student profile not found", status: 404 };
  }

  // If a studentId was provided in the request body/query, verify it's theirs
  if (studentIdToMatch && studentDoc.studentId !== studentIdToMatch) {
    return { error: "Forbidden: You cannot modify other student's reminders", status: 403 };
  }

  return { user: decoded, studentDoc };
}
