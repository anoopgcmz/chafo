import { toObjectId } from '@/lib/contacts';
import { getMessageCollection } from '@/models/Message';

type ReadMessagePayload = {
  receiverId?: string;
};

const READ_RETENTION_MS = 30_000;

export async function POST(request: Request, context: { params: { id: string } }) {
  const messageId = context.params.id;
  const objectId = toObjectId(messageId);

  if (!objectId) {
    return Response.json(
      { errors: [{ field: 'id', message: 'Message id is invalid.' }] },
      { status: 400 }
    );
  }

  let payload: ReadMessagePayload;

  try {
    payload = (await request.json()) as ReadMessagePayload;
  } catch {
    return Response.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON.' }] },
      { status: 400 }
    );
  }

  const receiverId = payload.receiverId?.trim();

  if (!receiverId) {
    return Response.json(
      { errors: [{ field: 'receiverId', message: 'receiverId is required.' }] },
      { status: 400 }
    );
  }

  const collection = await getMessageCollection();
  const message = await collection.findOne({ _id: objectId });

  if (!message) {
    return Response.json({ error: 'Message not found.' }, { status: 404 });
  }

  if (message.receiverId !== receiverId) {
    return Response.json({ error: 'Receiver does not match message.' }, { status: 403 });
  }

  const readAt = message.readAt ?? new Date();
  const deletionAt = message.deletionAt ?? new Date(readAt.getTime() + READ_RETENTION_MS);

  await collection.updateOne(
    { _id: objectId },
    {
      $set: {
        readAt,
        deletionAt,
      },
    }
  );

  return Response.json({
    status: 'ok',
    message: {
      id: message._id.toHexString(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      body: message.body,
      createdAt: message.createdAt,
      readAt,
      deletionAt,
    },
  });
}
