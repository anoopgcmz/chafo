import { createHmac, randomInt, timingSafeEqual } from 'crypto';

import { env } from '@/lib/env';

const OTP_DIGITS = 6;

export function generateOtpCode(): string {
  const value = randomInt(0, 10 ** OTP_DIGITS);
  return value.toString().padStart(OTP_DIGITS, '0');
}

export function hashOtp(phone: string, code: string): string {
  return createHmac('sha256', env.APP_SECRET)
    .update(`${phone}:${code}`)
    .digest('hex');
}

export function isOtpMatch(expectedHash: string, phone: string, code: string) {
  const candidate = hashOtp(phone, code);
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}
