import { getContactRequestCollection } from '@/models/ContactRequest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const receiverId = searchParams.get('receiverId')?.trim();

  if (!receiverId) {
    return Response.json(
      { errors: [{ field: 'receiverId', message: 'receiverId is required.' }] },
      { status: 400 }
    );
  }

  const collection = await getContactRequestCollection();
  const requests = await collection
    .find({ 'receiver.id': receiverId, status: 'pending' })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({
    status: 'ok',
    requests: requests.map((requestRecord) => ({
      id: requestRecord._id.toHexString(),
      requester: requestRecord.requester,
      receiver: requestRecord.receiver,
      status: requestRecord.status,
      createdAt: requestRecord.createdAt,
      updatedAt: requestRecord.updatedAt,
    })),
  });
}
