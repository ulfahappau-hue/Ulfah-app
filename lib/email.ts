import { Resend } from "resend";
import { APP_NAME } from "./constants";

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@localhost>`;
  if (!key) {
    console.info(`[email:dev] to=${to}\nsubject=${subject}\n${html}`);
    return { dev: true as const };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email:resend]", { to, subject, from, error });
    throw new Error(error.message);
  }
  console.info("[email:sent]", { to, subject, id: data?.id });
  return { dev: false as const, id: data?.id };
}

export function emailLayout(title: string, body: string) {
  return `
  <div style="font-family:Georgia,serif;background:#F4EFE4;padding:24px;color:#1B3D32">
    <div style="max-width:520px;margin:0 auto;background:#FBFAF6;border:1px solid #E4D9C5;border-radius:16px;padding:28px">
      <p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#6B8F71;margin:0 0 8px">${APP_NAME}</p>
      <h1 style="font-size:24px;margin:0 0 16px">${title}</h1>
      <div style="font-size:16px;line-height:1.6">${body}</div>
    </div>
  </div>`;
}
