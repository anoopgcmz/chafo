import { getAuditLogCollection, type AuditLogRecord } from '@/models/AuditLog';

export async function writeAuditLog(
  event: Omit<AuditLogRecord, 'createdAt'>
): Promise<void> {
  const collection = await getAuditLogCollection();
  await collection.insertOne({
    ...event,
    createdAt: new Date(),
  });
}
