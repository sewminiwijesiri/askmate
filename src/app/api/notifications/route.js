import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/lib/auth";
import { apiResponse, withErrorHandler } from "@/lib/apiResponse";

export async function GET(req) {
  return withErrorHandler(async (req) => {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return apiResponse.error("Unauthorized", 401);
    }

    await connectDB();

    const notifications = await Notification.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: decoded.id,
      isRead: false,
    });

    return apiResponse.success("Notifications fetched successfully", {
      notifications,
      unreadCount,
    });
  })(req);
}
