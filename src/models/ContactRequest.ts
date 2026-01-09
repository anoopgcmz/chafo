import type { Collection } from 'mongodb';

import { getMongoClient } from '@/lib/db';

import type { ContactParticipant } from './ContactParticipant';

export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected';

export type ContactRequestRecord = {
  requester: ContactParticipant;
  receiver: ContactParticipant;
  status: ContactRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export async function getContactRequestCollection(): Promise<
  Collection<ContactRequestRecord>
> {
  const client = await getMongoClient();
  const db = client.db();
  const collection = db.collection<ContactRequestRecord>('contactRequests');

  await collection.createIndex({ 'receiver.id': 1, status: 1, createdAt: -1 });
  await collection.createIndex({ 'requester.id': 1, status: 1, createdAt: -1 });
  await collection.createIndex({ 'receiver.phone': 1, status: 1, createdAt: -1 });
  await collection.createIndex({ 'requester.phone': 1, status: 1, createdAt: -1 });
  await collection.createIndex(
    { 'requester.id': 1, 'receiver.id': 1, status: 1 },
    {
      unique: true,
      partialFilterExpression: { status: 'pending' },
    }
  );

  return collection;
}
