type SmsPayload = {
  to: string;
  body: string;
};

type SmsResult = {
  provider: string;
  status: 'sent' | 'skipped' | 'failed';
  messageId?: string;
  error?: string;
};

const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
};

export async function sendSms({ to, body }: SmsPayload): Promise<SmsResult> {
  if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.fromNumber) {
    return {
      provider: 'placeholder',
      status: 'skipped',
      error: 'SMS provider not configured',
    };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${twilioConfig.accountSid}:${twilioConfig.authToken}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: twilioConfig.fromNumber,
          Body: body,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return {
        provider: 'twilio',
        status: 'failed',
        error: text || `Twilio error: ${response.status}`,
      };
    }

    const payload = (await response.json()) as { sid?: string };
    return {
      provider: 'twilio',
      status: 'sent',
      messageId: payload.sid,
    };
  } catch (error) {
    return {
      provider: 'twilio',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown SMS error',
    };
  }
}
