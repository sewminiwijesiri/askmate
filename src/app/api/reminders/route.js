import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";
import { verifyStudent } from "@/lib/auth";
import { apiResponse, withErrorHandler } from "@/lib/apiResponse";

// GET: Fetch all reminders for a student
export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const auth = await verifyStudent(req, studentId);
  if (auth.error) {
    return apiResponse.error(auth.error, auth.status);
  }

  // If query param 'studentId' is missing, default to the logged-in student
  const finalStudentId = studentId || auth.studentDoc.studentId;

  await connectDB();
  const reminders = await Reminder.find({ studentId: finalStudentId }).sort({ deadlineDate: 1 });

  return apiResponse.success("Reminders fetched successfully", reminders);
});

// POST: Create a new reminder
export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  const { studentId, title, description, deadlineDate, deadlineTime, notificationTime } = body;

  // 1. Basic field check
  if (!studentId || !title || !deadlineDate || !deadlineTime) {
    return apiResponse.error("Missing required fields", 400);
  }

  // 2. Auth check - ensure student is adding reminder for themselves
  const auth = await verifyStudent(req, studentId);
  if (auth.error) {
    return apiResponse.error(auth.error, auth.status);
  }

  await connectDB();
  const newReminder = new Reminder({
    studentId,
    title,
    description: description || "",
    deadlineDate: new Date(deadlineDate),
    deadlineTime,
    notificationTime: notificationTime || "none",
    status: "pending",
  });

  await newReminder.save();

  return apiResponse.success("Reminder created successfully", newReminder, 201);
});
