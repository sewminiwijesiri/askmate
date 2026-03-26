import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/lib/auth";
import { apiResponse, withErrorHandler } from "@/lib/apiResponse";

/**
 * PATCH: Mark ALL notifications as read or Single notification as read.
 */
export const PATCH = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  const decoded = await getAuthUser(req);
  if (!decoded) {
    return apiResponse.error("Unauthorized", 401);
  }

  await connectDB();

  if (id === "read-all") {
    await Notification.updateMany(
      { userId: decoded.id, isRead: false },
      { isRead: true }
    );
    return apiResponse.success("All notifications marked as read");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: decoded.id },
    { isRead: true },
    { returnDocument: 'after' }
  );

  if (!notification) {
    return apiResponse.error("Notification not found", 404);
  }

  return apiResponse.success("Marked as read", notification);
});

/**
 * DELETE: Remove a specific notification.
 */
export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  const decoded = await getAuthUser(req);
  if (!decoded) {
    return apiResponse.error("Unauthorized", 401);
  }

  await connectDB();

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: decoded.id
  });

  if (!notification) {
    return apiResponse.error("Notification not found", 404);
  }

  return apiResponse.success("Notification deleted successfully");
});
