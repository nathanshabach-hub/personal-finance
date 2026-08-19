import { executeQuery } from "@/lib/db";

export async function writeAuditLog(params: {
  userId: string;
  action: string;
  entityName: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await executeQuery(
    `INSERT INTO audit_logs (user_id, action, entity_name, entity_id, metadata)
     VALUES (@userId, @action, @entityName, @entityId, @metadata::jsonb)`,
    {
      userId: params.userId,
      action: params.action,
      entityName: params.entityName,
      entityId: params.entityId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  );
}
