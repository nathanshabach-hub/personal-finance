import { executeQuery } from "@/lib/db";

export async function listNotifications(userId: string) {
  return executeQuery(
    `SELECT id, type, title, message, is_read, created_at
     FROM notifications
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId },
  );
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await executeQuery(
    `UPDATE notifications
     SET is_read = true
     WHERE id = @notificationId AND user_id = @userId`,
    { userId, notificationId },
  );
}
