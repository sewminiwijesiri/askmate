// src/instrumentation.js

/**
 * Next.js Instrumentation Hook: Runs once on server startup.
 * We use this to initialize our background reminder scheduler.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Dynamically import to avoid any early runtime issues
      const { initReminderScheduler } = await import("@/lib/scheduler");
      initReminderScheduler();
    } catch (error) {
      console.error("Failed to initialize scheduler during instrumentation:", error);
    }
  }
}
