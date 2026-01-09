import { ObjectId } from 'mongodb';

import type { ContactParticipant } from '@/models/ContactParticipant';
import { sanitizeEmail, sanitizeName, sanitizePhoneNumber, validateEmail, validateName } from '@/lib/validation';

export type ContactParticipantPayload = Partial<ContactParticipant>;

export type ContactRequestPayload = {
  requester?: ContactParticipantPayload;
  receiver?: ContactParticipantPayload;
};

export type ValidationError = {
  field: string;
  message: string;
};

export function validateParticipant(
  participant: ContactParticipantPayload | undefined,
  role: 'requester' | 'receiver'
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!participant?.id?.trim()) {
    errors.push({
      field: `${role}.id`,
      message: `${role[0].toUpperCase()}${role.slice(1)} id is required.`,
    });
  }

  const nameValidation = validateName(participant?.name ?? '');
  if (nameValidation.error) {
    errors.push({
      field: `${role}.name`,
      message: nameValidation.error,
    });
  }

  if (participant?.email?.trim()) {
    const emailValidation = validateEmail(participant.email);
    if (emailValidation.error) {
      errors.push({
        field: `${role}.email`,
        message: emailValidation.error,
      });
    }
  }

  if (participant?.phone?.trim()) {
    const normalizedPhone = sanitizePhoneNumber(participant.phone);
    if (!normalizedPhone) {
      errors.push({
        field: `${role}.phone`,
        message:
          'Phone number must include 10 to 15 digits (country code required).',
      });
    }
  }
  return errors;
}

export function normalizeParticipant(
  participant: ContactParticipantPayload
): ContactParticipant {
  const sanitizedPhone = participant.phone
    ? sanitizePhoneNumber(participant.phone)
    : null;
  return {
    id: participant.id?.trim() ?? '',
    name: sanitizeName(participant.name ?? ''),
    phone: sanitizedPhone ?? undefined,
    email: participant.email ? sanitizeEmail(participant.email) : undefined,
  };
}

export function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}
