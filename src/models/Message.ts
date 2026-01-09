import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

export type MessageRecord = {
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: Date;
  readAt?: Date | null;
  deletionAt?: Date | null;
};

export async function getMessageCollection(): Promise<Collection<MessageRecord>> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<MessageRecord>('messages');

  await collection.createIndex({ receiverId: 1, createdAt: -1 });
  await collection.createIndex({ senderId: 1, createdAt: -1 });
  await collection.createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
  await collection.createIndex({ deletionAt: 1 });

  return collection;
}
