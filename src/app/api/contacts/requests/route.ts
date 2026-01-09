import type { MongoServerError } from 'mongodb';

import {
  normalizeParticipant,
  type ContactRequestPayload,
  validateParticipant,
} from '@/lib/contacts';
import { getClientIp } from '@/lib/request';
import { enforceRateLimit } from '@/lib/rateLimit';
import { getContactRequestCollection } from '@/models/ContactRequest';

const DUPLICATE_KEY_ERROR = 11000;
const REQUEST_WINDOW_MS = 10 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

export async function POST(request: Request) {
  let payload: ContactRequestPayload;

  try {
    payload = (await request.json()) as ContactRequestPayload;
  } catch {
    return Response.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON.' }] },
      { status: 400 }
    );
  }

  const errors = [
    ...validateParticipant(payload.requester, 'requester'),
    ...validateParticipant(payload.receiver, 'receiver'),
  ];

  if (payload.requester?.id && payload.receiver?.id) {
    if (payload.requester.id.trim() === payload.receiver.id.trim()) {
      errors.push({
        field: 'receiver.id',
        message: 'Requester and receiver must be different users.',
      });
    }
  }

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  const requesterId = payload.requester?.id?.trim() ?? 'unknown';
  const clientIp = getClientIp(request) ?? 'unknown';
  const rateLimitKey = `contact-request:${requesterId}:${clientIp}`;
  const rateLimit = await enforceRateLimit({
    key: rateLimitKey,
    windowMs: REQUEST_WINDOW_MS,
    maxRequests: MAX_REQUESTS_PER_WINDOW,
    cooldownMs: REQUEST_COOLDOWN_MS,
  });

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000);
    return Response.json(
      { error: 'Too many contact requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
    );
  }

  const requester = normalizeParticipant(payload.requester ?? {});
  const receiver = normalizeParticipant(payload.receiver ?? {});
  const now = new Date();
  const record = {
    requester,
    receiver,
    status: 'pending' as const,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getContactRequestCollection();

  try {
    const result = await collection.insertOne(record);

    return Response.json(
      {
        status: 'ok',
        request: {
          id: result.insertedId.toHexString(),
          ...record,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as MongoServerError).code === DUPLICATE_KEY_ERROR) {
      return Response.json(
        { error: 'A pending request already exists for this recipient.' },
        { status: 409 }
      );
    }

    return Response.json({ error: 'Unable to create request.' }, { status: 500 });
  }
}
