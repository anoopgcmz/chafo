import { ObjectId } from 'mongodb';

import type { ContactParticipant } from '@/models/ContactParticipant';

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
  if (!participant?.name?.trim()) {
    errors.push({
      field: `${role}.name`,
      message: `${role[0].toUpperCase()}${role.slice(1)} name is required.`,
    });
  }
  return errors;
}

export function normalizeParticipant(
  participant: ContactParticipantPayload
): ContactParticipant {
  return {
    id: participant.id?.trim() ?? '',
    name: participant.name?.trim() ?? '',
    phone: participant.phone?.trim() || undefined,
    email: participant.email?.trim() || undefined,
  };
}

export function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}
