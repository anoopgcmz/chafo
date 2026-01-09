const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  MONGODB_URI: requiredEnv('MONGODB_URI'),
  OTP_PROVIDER_KEY: requiredEnv('OTP_PROVIDER_KEY'),
  OTP_PROVIDER_SECRET: requiredEnv('OTP_PROVIDER_SECRET'),
  APP_SECRET: requiredEnv('APP_SECRET'),
};
