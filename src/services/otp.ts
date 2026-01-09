import { env } from '@/lib/env';

export type OtpRequest = {
  phoneNumber: string;
};

export const otpProviderConfig = {
  apiKey: env.OTP_PROVIDER_KEY,
  apiSecret: env.OTP_PROVIDER_SECRET,
};

export async function sendOtp(_: OtpRequest) {
  return {
    provider: 'placeholder',
    status: 'not-configured',
  };
}
