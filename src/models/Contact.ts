import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

import type { ContactParticipant } from './ContactParticipant';

export type ContactRecord = {
  participantIds: [string, string];
  participants: ContactParticipant[];
  createdAt: Date;
};

export async function getContactCollection(): Promise<Collection<ContactRecord>> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<ContactRecord>('contacts');

  await collection.createIndex({ participantIds: 1 }, { unique: true });
  await collection.createIndex({ 'participants.id': 1 });
  await collection.createIndex({ 'participants.phone': 1 });

  return collection;
}
