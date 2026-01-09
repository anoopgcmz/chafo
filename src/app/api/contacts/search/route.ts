import { validatePhoneNumber } from '@/lib/phone';
import { getContactCollection } from '@/models/Contact';

type ContactSearchResult = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone')?.trim() ?? '';
  const requesterId = searchParams.get('requesterId')?.trim();
  const requesterPhone = searchParams.get('requesterPhone')?.trim() ?? '';

  if (!requesterId) {
    return Response.json(
      { errors: [{ field: 'requesterId', message: 'Requester id is required.' }] },
      { status: 400 }
    );
  }

  const phoneValidation = validatePhoneNumber(phone);
  if (phoneValidation.error || !phoneValidation.normalized) {
    return Response.json(
      { errors: [{ field: 'phone', message: phoneValidation.error }] },
      { status: 400 }
    );
  }

  const requesterPhoneValidation = validatePhoneNumber(requesterPhone);
  if (requesterPhoneValidation.error || !requesterPhoneValidation.normalized) {
    return Response.json(
      {
        errors: [
          {
            field: 'requesterPhone',
            message:
              requesterPhoneValidation.error ?? 'Requester phone is required.',
          },
        ],
      },
      { status: 400 }
    );
  }

  if (requesterPhoneValidation.normalized === phoneValidation.normalized) {
    return Response.json(
      {
        errors: [
          {
            field: 'phone',
            message: 'You cannot search for your own phone number.',
          },
        ],
      },
      { status: 400 }
    );
  }

  const collection = await getContactCollection();
  const records = await collection
    .find({
      participantIds: requesterId,
      'participants.phone': phoneValidation.normalized,
    })
    .limit(5)
    .toArray();

  const results: ContactSearchResult[] = records
    .map((record) => {
      const participant = record.participants.find(
        (entry) => entry.phone === phoneValidation.normalized
      );
      if (!participant) {
        return null;
      }

      return {
        id: participant.id,
        name: participant.name,
        phone: participant.phone,
        email: participant.email,
      };
    })
    .filter((entry): entry is ContactSearchResult => Boolean(entry));

  return Response.json({ results });
}
