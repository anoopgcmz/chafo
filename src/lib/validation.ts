import { normalizePhoneNumber } from '@/lib/phone';

export type TextValidationResult = {
  normalized?: string;
  error?: string;
};

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 254;
const NAME_REGEX = /^[\p{L}][\p{L}\p{M}'’ -]*$/u;

function sanitizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, '');
}

export function sanitizeName(input: string): string {
  return sanitizeWhitespace(stripControlChars(input));
}

export function validateName(input: string): TextValidationResult {
  const normalized = sanitizeName(input);
  if (!normalized) {
    return { error: 'Name is required.' };
  }

  if (normalized.length < NAME_MIN_LENGTH || normalized.length > NAME_MAX_LENGTH) {
    return {
      error: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`,
    };
  }

  if (!NAME_REGEX.test(normalized)) {
    return {
      error: 'Name may only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  return { normalized };
}

export function sanitizeEmail(input: string): string {
  return sanitizeWhitespace(stripControlChars(input)).toLowerCase();
}

export function validateEmail(input: string): TextValidationResult {
  const normalized = sanitizeEmail(input);
  if (!normalized) {
    return { error: 'Email is required.' };
  }

  if (normalized.length > EMAIL_MAX_LENGTH) {
    return { error: 'Email must be 254 characters or fewer.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: 'Email must be valid.' };
  }

  return { normalized };
}

export function sanitizePhoneNumber(input: string): string | null {
  return normalizePhoneNumber(input);
}
