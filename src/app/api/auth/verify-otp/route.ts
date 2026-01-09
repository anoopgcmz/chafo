import { signJwt } from '@/lib/jwt';
import { isOtpMatch } from '@/lib/otp';
import { validatePhoneNumber } from '@/lib/phone';
import { getOtpCollection } from '@/models/Otp';

const MAX_VERIFY_ATTEMPTS = 5;
const SESSION_TTL_SECONDS = 60 * 60 * 24;

type VerifyPayload = {
  phone?: string;
  code?: string;
};

export async function POST(request: Request) {
  let payload: VerifyPayload;

  try {
    payload = (await request.json()) as VerifyPayload;
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  const phoneValidation = validatePhoneNumber(payload.phone ?? '');
  if (phoneValidation.error || !phoneValidation.normalized) {
    return Response.json(
      { error: phoneValidation.error ?? 'Phone number is required.' },
      { status: 400 }
    );
  }

  if (!payload.code?.trim()) {
    return Response.json({ error: 'OTP code is required.' }, { status: 400 });
  }

  const phone = phoneValidation.normalized;
  const collection = await getOtpCollection();
  const record = await collection.findOne({ phone });

  if (!record) {
    return Response.json({ error: 'OTP not found.' }, { status: 404 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await collection.deleteOne({ phone });
    return Response.json({ error: 'OTP has expired.' }, { status: 400 });
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    return Response.json(
      { error: 'Too many failed attempts. Please request a new OTP.' },
      { status: 429 }
    );
  }

  if (!isOtpMatch(record.codeHash, phone, payload.code.trim())) {
    await collection.updateOne(
      { phone },
      { $set: { attempts: record.attempts + 1 } }
    );
    return Response.json({ error: 'Invalid OTP code.' }, { status: 400 });
  }

  await collection.deleteOne({ phone });

  const now = Math.floor(Date.now() / 1000);
  const token = signJwt({
    sub: phone,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  });

  return Response.json({ status: 'verified', token, expiresIn: SESSION_TTL_SECONDS });
}
