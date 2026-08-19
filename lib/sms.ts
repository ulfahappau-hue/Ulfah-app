import twilio from "twilio";

export function smsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

export async function sendSms(to: string, body: string) {
  if (!smsConfigured()) {
    console.info(`[sms:dev] to=${to}\n${body}`);
    return { dev: true as const };
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body,
    });
    return { dev: false as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Twilio send failed";
    console.error(`[sms:twilio] ${message}`);
    console.info(`[sms:dev] fallback to=${to}\n${body}`);
    return { dev: true as const };
  }
}
