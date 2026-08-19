import { executeQuery } from "@/lib/db";

export async function writeAuditLog(params: {
  userId: string;
  action: string;
  entityName: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await executeQuery(
    `INSERT INTO dbo.AuditLogs (AuditLogId, UserId, Action, EntityName, EntityId, Metadata, CreatedAt)
     VALUES (NEWID(), @userId, @action, @entityName, @entityId, @metadata, SYSUTCDATETIME())`,
    {
      userId: params.userId,
      action: params.action,
      entityName: params.entityName,
      entityId: params.entityId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  );
}
