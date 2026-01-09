import { getOtpCollection } from '@/models/Otp';
import { generateOtpCode, hashOtp } from '@/lib/otp';
import { validatePhoneNumber } from '@/lib/phone';
import { sendSms } from '@/services/sms';

const OTP_TTL_MS = 5 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 60 * 1000;
const REQUEST_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const DEV_OTP_CODE = '123456';

type OtpRequestPayload = {
  phone?: string;
};

function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

export async function POST(request: Request) {
  let payload: OtpRequestPayload;

  try {
    payload = (await request.json()) as OtpRequestPayload;
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

  const phone = phoneValidation.normalized;
  const now = new Date();
  const collection = await getOtpCollection();
  const existing = await collection.findOne({ phone });

  if (existing) {
    const lastRequestedAt = existing.lastRequestedAt?.getTime() ?? 0;
    if (now.getTime() - lastRequestedAt < REQUEST_COOLDOWN_MS) {
      return Response.json(
        { error: 'OTP recently requested. Please wait before retrying.' },
        { status: 429 }
      );
    }

    const windowStartedAt = existing.windowStartedAt?.getTime() ?? 0;
    const inWindow = now.getTime() - windowStartedAt < REQUEST_WINDOW_MS;
    if (inWindow && existing.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return Response.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  const code = isDevelopment() ? DEV_OTP_CODE : generateOtpCode();
  const codeHash = hashOtp(phone, code);
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  const windowStartedAt =
    existing && now.getTime() - existing.windowStartedAt.getTime() < REQUEST_WINDOW_MS
      ? existing.windowStartedAt
      : now;
  const requestCount =
    existing && windowStartedAt === existing.windowStartedAt
      ? existing.requestCount + 1
      : 1;

  await collection.updateOne(
    { phone },
    {
      $set: {
        phone,
        codeHash,
        createdAt: now,
        expiresAt,
        attempts: 0,
        lastRequestedAt: now,
        requestCount,
        windowStartedAt,
      },
    },
    { upsert: true }
  );

  if (!isDevelopment()) {
    await sendSms({
      to: phone,
      body: `Your verification code is ${code}. It expires in 5 minutes.`,
    });
  }

  return Response.json({
    status: 'sent',
    expiresAt: expiresAt.toISOString(),
  });
}
