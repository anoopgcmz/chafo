import { writeAuditLog } from '@/lib/audit';
import { toObjectId } from '@/lib/contacts';
import { getMessageCollection } from '@/models/Message';

type DeleteMessagePayload = {
  requesterId?: string;
};

export async function POST(request: Request, context: { params: { id: string } }) {
  const messageId = context.params.id;
  const objectId = toObjectId(messageId);

  if (!objectId) {
    return Response.json(
      { errors: [{ field: 'id', message: 'Message id is invalid.' }] },
      { status: 400 }
    );
  }

  let payload: DeleteMessagePayload;

  try {
    payload = (await request.json()) as DeleteMessagePayload;
  } catch {
    return Response.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON.' }] },
      { status: 400 }
    );
  }

  const requesterId = payload.requesterId?.trim();
  if (!requesterId) {
    return Response.json(
      { errors: [{ field: 'requesterId', message: 'requesterId is required.' }] },
      { status: 400 }
    );
  }

  const collection = await getMessageCollection();
  const message = await collection.findOne({ _id: objectId });

  if (!message) {
    return Response.json({ error: 'Message not found.' }, { status: 404 });
  }

  if (![message.senderId, message.receiverId].includes(requesterId)) {
    return Response.json(
      { error: 'Requester is not authorized to delete this message.' },
      { status: 403 }
    );
  }

  const now = new Date();
  if (message.deletionAt && message.deletionAt <= now) {
    return Response.json({ error: 'Message has already been deleted.' }, { status: 410 });
  }

  await collection.updateOne(
    { _id: objectId },
    {
      $set: {
        deletionAt: now,
      },
    }
  );

  await writeAuditLog({
    action: 'message.deleted',
    actorId: requesterId,
    targetId: messageId,
    metadata: {
      senderId: message.senderId,
      receiverId: message.receiverId,
    },
  });

  return Response.json({
    status: 'ok',
    message: {
      id: messageId,
      deletionAt: now,
    },
  });
}
