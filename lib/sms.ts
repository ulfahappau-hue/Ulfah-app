import twilio from "twilio";

export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.info(`[sms:dev] to=${to}\n${body}`);
    return { dev: true as const };
  }

  const client = twilio(sid, token);
  await client.messages.create({ to, from, body });
  return { dev: false as const };
}
