import { writeAuditLog } from '@/lib/audit';
import { toObjectId } from '@/lib/contacts';
import { getContactRequestCollection } from '@/models/ContactRequest';

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
    { $set: { status: 'rejected', updatedAt: now } }
  );
  await writeAuditLog({
    action: 'contact_request.rejected',
    actorId: contactRequest.receiver.id,
    targetId: requestId,
    metadata: {
      requesterId: contactRequest.requester.id,
      receiverId: contactRequest.receiver.id,
    },
  });

  return Response.json({
    status: 'ok',
    request: {
      id: requestId,
      status: 'rejected',
      updatedAt: now,
    },
  });
}
