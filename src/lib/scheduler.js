import cron from "node-cron";
import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";
import { sendReminderAlert } from "@/lib/notifications";

/**
 * Parses a reminder's deadline and notification settings into a trigger Date.
 * @param {Date} deadlineDate - The date part of the deadline.
 * @param {string} deadlineTime - The time part of the deadline (e.g. "14:30").
 * @param {string} notificationTime - The notification offset string (e.g. "1 hour before").
 * @returns {Date} The exact time to trigger the notification.
 */
function getReminderTriggerTime(deadlineDate, deadlineTime, notificationTime) {
  try {
    const deadline = new Date(deadlineDate);
    const [hours, minutes] = deadlineTime.split(":").map(Number);
    deadline.setHours(hours, minutes, 0, 0);

    // Default offset is 0ms (deliver at the deadline)
    let offsetMs = 0;

    if (notificationTime && notificationTime !== "none") {
      const match = notificationTime.match(/(\d+)\s+(minute|hour|day)s?\s+before/i);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const multipliers = {
          minute: 60 * 1000,
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
        };
        offsetMs = val * (multipliers[unit] || 0);
      }
    }

    return new Date(deadline.getTime() - offsetMs);
  } catch (error) {
    console.error("Error calculating trigger time:", error);
    return null;
  }
}

/**
 * Checks all pending reminders and sends alerts if due.
 */
async function processRemindersBatch() {
  try {
    await connectDB();
    const now = new Date();
    
    // Find reminders that are pending AND not yet notified
    // We filter by pending status to avoid reminders already marked 'completed' by user
    const remindersToCheck = await Reminder.find({
      status: "pending",
      notificationSent: false,
    });

    console.log(`[Reminders Job] Polling ${remindersToCheck.length} pending reminders...`);

    for (const reminder of remindersToCheck) {
      const triggerTime = getReminderTriggerTime(
        reminder.deadlineDate,
        reminder.deadlineTime,
        reminder.notificationTime
      );

      // If it's time to notify or we passed the time
      if (triggerTime && now >= triggerTime) {
        console.log(`[Reminders Job] Sending alert for reminder: ${reminder.title}`);
        
        const success = await sendReminderAlert(reminder);
        if (success) {
          reminder.notificationSent = true;
          await reminder.save();
        }
      }
    }
  } catch (err) {
    console.error("[Reminders Job FAILED]:", err);
  }
}

/**
 * Setup and start the cron scheduler.
 * This should be called once on server startup.
 */
export function initReminderScheduler() {
  console.log("-> Initializing Reminder Scheduler Service...");
  
  // Schedule to run every minute
  // * * * * * - Minute Hour Day Month DayOfWeek
  cron.schedule("* * * * *", async () => {
    await processRemindersBatch();
  });
}
