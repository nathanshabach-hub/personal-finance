import { executeQuery } from "@/lib/db";

export async function listNotifications(userId: string) {
  return executeQuery(
    `SELECT NotificationId, Type, Title, Message, IsRead, CreatedAt
     FROM dbo.Notifications
     WHERE UserId = @userId
     ORDER BY CreatedAt DESC`,
    { userId },
  );
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await executeQuery(
    `UPDATE dbo.Notifications
     SET IsRead = 1
     WHERE NotificationId = @notificationId AND UserId = @userId`,
    { userId, notificationId },
  );
}
