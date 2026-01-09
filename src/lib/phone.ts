export type PhoneValidationResult = {
  normalized?: string;
  error?: string;
};

const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

export function normalizePhoneNumber(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) {
    return null;
  }

  return `+${digits}`;
}

export function validatePhoneNumber(input: string): PhoneValidationResult {
  if (!input?.trim()) {
    return { error: 'Phone number is required.' };
  }

  const normalized = normalizePhoneNumber(input);
  if (!normalized) {
    return {
      error:
        'Phone number must include 10 to 15 digits (country code required).',
    };
  }

  return { normalized };
}
