import type { MongoServerError } from 'mongodb';

import { toObjectId } from '@/lib/contacts';
import { getContactCollection } from '@/models/Contact';
import { getContactRequestCollection } from '@/models/ContactRequest';

const DUPLICATE_KEY_ERROR = 11000;

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = params.id;
  const objectId = toObjectId(requestId);

  if (!objectId) {
    return Response.json(
      { errors: [{ field: 'id', message: 'Request id is invalid.' }] },
      { status: 400 }
    );
  }

  const requestCollection = await getContactRequestCollection();
  const contactRequest = await requestCollection.findOne({ _id: objectId });

  if (!contactRequest) {
    return Response.json({ error: 'Request not found.' }, { status: 404 });
  }

  if (contactRequest.status !== 'pending') {
    return Response.json(
      { error: 'Request has already been resolved.' },
      { status: 409 }
    );
  }

  const now = new Date();
  await requestCollection.updateOne(
    { _id: objectId },
    { $set: { status: 'accepted', updatedAt: now } }
  );

  const participantIds = [
    contactRequest.requester.id,
    contactRequest.receiver.id,
  ].sort() as [string, string];
  const contacts = await getContactCollection();

  try {
    await contacts.insertOne({
      participantIds,
      participants: [contactRequest.requester, contactRequest.receiver],
      createdAt: now,
    });
  } catch (error) {
    if ((error as MongoServerError).code !== DUPLICATE_KEY_ERROR) {
      return Response.json(
        { error: 'Unable to create contact.' },
        { status: 500 }
      );
    }
  }

  return Response.json({
    status: 'ok',
    request: {
      id: requestId,
      status: 'accepted',
      updatedAt: now,
    },
  });
}
