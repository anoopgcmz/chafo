import { getMessageCollection } from '@/models/Message';

type MessagePayload = {
  senderId?: string;
  receiverId?: string;
  body?: string;
};

export async function POST(request: Request) {
  let payload: MessagePayload;

  try {
    payload = (await request.json()) as MessagePayload;
  } catch {
    return Response.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON.' }] },
      { status: 400 }
    );
  }

  const errors = [];
  if (!payload.senderId?.trim()) {
    errors.push({ field: 'senderId', message: 'senderId is required.' });
  }
  if (!payload.receiverId?.trim()) {
    errors.push({ field: 'receiverId', message: 'receiverId is required.' });
  }
  if (!payload.body?.trim()) {
    errors.push({ field: 'body', message: 'body is required.' });
  }

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  const now = new Date();
  const record = {
    senderId: payload.senderId!.trim(),
    receiverId: payload.receiverId!.trim(),
    body: payload.body!.trim(),
    createdAt: now,
    readAt: null,
    deletionAt: null,
  };

  const collection = await getMessageCollection();
  const result = await collection.insertOne(record);

  return Response.json(
    {
      status: 'ok',
      message: {
        id: result.insertedId.toHexString(),
        ...record,
      },
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get('participantId')?.trim();

  if (!participantId) {
    return Response.json(
      { errors: [{ field: 'participantId', message: 'participantId is required.' }] },
      { status: 400 }
    );
  }

  const now = new Date();
  const collection = await getMessageCollection();
  const messages = await collection
    .find({
      $and: [
        { $or: [{ senderId: participantId }, { receiverId: participantId }] },
        {
          $or: [
            { deletionAt: { $exists: false } },
            { deletionAt: null },
            { deletionAt: { $gt: now } },
          ],
        },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({
    status: 'ok',
    messages: messages.map((message) => ({
      id: message._id.toHexString(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      body: message.body,
      createdAt: message.createdAt,
      readAt: message.readAt ?? null,
      deletionAt: message.deletionAt ?? null,
    })),
  });
}
