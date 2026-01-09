import { createHmac } from 'crypto';

import { env } from '@/lib/env';

type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(data: Uint8Array | string): string {
  const buffer = typeof data === 'string' ? encoder.encode(data) : data;
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(payload: JwtPayload): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signatureBase = `${header}.${body}`;
  const signature = createHmac('sha256', env.APP_SECRET)
    .update(signatureBase)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureBase}.${signature}`;
}
