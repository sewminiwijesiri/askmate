import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";
import { verifyStudent } from "@/lib/auth";
import { apiResponse, withErrorHandler } from "@/lib/apiResponse";

// GET: Get single reminder
export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;

  await connectDB();
  const reminder = await Reminder.findById(id);

  if (!reminder) {
    return apiResponse.error("Reminder not found", 404);
  }

  // Verify ownership
  const auth = await verifyStudent(req, reminder.studentId);
  if (auth.error) {
    return apiResponse.error(auth.error, auth.status);
  }

  return apiResponse.success("Reminder fetched successfully", reminder);
});

// PATCH: Update reminder or Mark as completed
export const PATCH = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  const updates = await req.json();

  await connectDB();
  const reminder = await Reminder.findById(id);

  if (!reminder) {
    return apiResponse.error("Reminder not found", 404);
  }

  // Verify ownership before updating
  const auth = await verifyStudent(req, reminder.studentId);
  if (auth.error) {
    return apiResponse.error(auth.error, auth.status);
  }

  if (updates.deadlineDate) {
    updates.deadlineDate = new Date(updates.deadlineDate);
  }

  const updatedReminder = await Reminder.findByIdAndUpdate(id, updates, { new: true });

  return apiResponse.success("Reminder updated successfully", updatedReminder);
});

// DELETE: Delete reminder
export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;

  await connectDB();
  const reminder = await Reminder.findById(id);

  if (!reminder) {
    return apiResponse.error("Reminder not found", 404);
  }

  // Verify ownership before deleting
  const auth = await verifyStudent(req, reminder.studentId);
  if (auth.error) {
    return apiResponse.error(auth.error, auth.status);
  }

  await Reminder.findByIdAndDelete(id);

  return apiResponse.success("Reminder deleted successfully");
});
