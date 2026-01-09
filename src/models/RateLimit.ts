import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

export type RateLimitRecord = {
  key: string;
  windowStartedAt: Date;
  requestCount: number;
  lastRequestedAt: Date;
};

export async function getRateLimitCollection(): Promise<
  Collection<RateLimitRecord>
> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<RateLimitRecord>('rateLimits');

  await collection.createIndex({ key: 1 }, { unique: true });

  return collection;
}
