import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

export type OtpRecord = {
  phone: string;
  codeHash: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  lastRequestedAt: Date;
  requestCount: number;
  windowStartedAt: Date;
};

export async function getOtpCollection(): Promise<Collection<OtpRecord>> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<OtpRecord>('otps');

  await collection.createIndex({ phone: 1 }, { unique: true });
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return collection;
}
