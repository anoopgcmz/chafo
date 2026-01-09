import { validatePhoneNumber } from '@/lib/phone';

type RegisterPayload = {
  phone?: string;
  email?: string;
  name?: string;
  dateOfBirth?: string;
  profileMetadata?: Record<string, string>;
};

type ValidationError = {
  field: string;
  message: string;
};

function validateDateOfBirth(dateOfBirth?: string): ValidationError | null {
  if (!dateOfBirth) {
    return { field: 'dateOfBirth', message: 'Date of birth is required.' };
  }

  const parsed = new Date(dateOfBirth);
  if (Number.isNaN(parsed.getTime())) {
    return {
      field: 'dateOfBirth',
      message: 'Date of birth must be a valid date.',
    };
  }

  const now = new Date();
  if (parsed > now) {
    return {
      field: 'dateOfBirth',
      message: 'Date of birth cannot be in the future.',
    };
  }

  let age = now.getFullYear() - parsed.getFullYear();
  const hasHadBirthday =
    now.getMonth() > parsed.getMonth() ||
    (now.getMonth() === parsed.getMonth() &&
      now.getDate() >= parsed.getDate());
  if (!hasHadBirthday) {
    age -= 1;
  }

  if (age > 13) {
    return {
      field: 'dateOfBirth',
      message: 'You must be 13 or younger to register.',
    };
  }

  return null;
}

export async function POST(request: Request) {
  let payload: RegisterPayload;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return Response.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON.' }] },
      { status: 400 }
    );
  }

  const errors: ValidationError[] = [];

  if (!payload.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required.' });
  }

  if (!payload.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push({ field: 'email', message: 'Email must be valid.' });
  }

  const phoneValidation = validatePhoneNumber(payload.phone ?? '');
  if (phoneValidation.error) {
    errors.push({ field: 'phone', message: phoneValidation.error });
  }

  const dateError = validateDateOfBirth(payload.dateOfBirth);
  if (dateError) {
    errors.push(dateError);
  }

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  return Response.json(
    {
      status: 'ok',
      user: {
        phone: phoneValidation.normalized,
        email: payload.email?.trim(),
        name: payload.name?.trim(),
        dateOfBirth: payload.dateOfBirth,
        profileMetadata: payload.profileMetadata ?? {},
      },
    },
    { status: 201 }
  );
}
