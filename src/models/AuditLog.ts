import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

export type AuditLogRecord = {
  action: string;
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

export async function getAuditLogCollection(): Promise<
  Collection<AuditLogRecord>
> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<AuditLogRecord>('auditLogs');

  await collection.createIndex({ action: 1, createdAt: -1 });
  await collection.createIndex({ actorId: 1, createdAt: -1 });

  return collection;
}
