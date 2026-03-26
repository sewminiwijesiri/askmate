import Notification from "@/models/Notification";
import Student from "@/models/Student";
import { connectDB } from "@/lib/db";

/**
 * Sends a notification to the student about their reminder.
 * @param {Object} reminder - The reminder document.
 */
export async function sendReminderAlert(reminder) {
  try {
    const { studentId, title, description } = reminder;
    
    await connectDB();

    // 1. Find the student _id from their studentId string
    const student = await Student.findOne({ studentId });
    if (!student) {
      console.error(`[NOTIFICATION] Student record not found for ID: ${studentId}`);
      return false;
    }

    // 2. Create and save in-app notification
    const notification = new Notification({
      userId: student._id,
      title: `Reminder: ${title}`,
      message: description || "You have a deadline approaching.",
      isRead: false
    });

    await notification.save();

    console.log(`\n🔔 [In-App NOTIFICATION] Created for student ${studentId}`);
    return true;
  } catch (error) {
    console.error(`Failed to create notification for reminder ${reminder._id}:`, error);
    return false;
  }
}
